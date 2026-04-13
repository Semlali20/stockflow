package com.stock.authservice.service;

import com.stock.authservice.entity.User;
import com.stock.authservice.exception.InvalidCredentialsException;
import com.stock.authservice.exception.ResourceNotFoundException;
import com.stock.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class MfaService {

    private final UserRepository userRepository;
    private static final String ALGORITHM = "HmacSHA1";
    private static final int CODE_LENGTH = 6;
    private static final int TIME_STEP = 30; // 30 seconds

    // ==================== MFA STATUS ====================

    @Transactional(readOnly = true)
    public boolean isMfaRequired(User user) {
        return user.getMfaEnabled() != null && user.getMfaEnabled();
    }

    @Transactional(readOnly = true)
    public boolean isMfaEnabled(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return user.getMfaEnabled() != null && user.getMfaEnabled();
    }

    // ==================== MFA SETUP ====================

    @Transactional
    public String generateMfaSecret() {
        log.info("Generating MFA secret");

        // Generate a random 20-byte secret
        SecureRandom random = new SecureRandom();
        byte[] secret = new byte[20];
        random.nextBytes(secret);

        String encodedSecret = Base64.getEncoder().encodeToString(secret);
        log.debug("MFA secret generated successfully");

        return encodedSecret;
    }

    @Transactional
    public String enableMfa(String userId) {
        log.info("Enabling MFA for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getMfaEnabled()) {
            log.warn("MFA already enabled for user: {}", userId);
            return user.getMfaSecret();
        }

        String secret = generateMfaSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(true);

        userRepository.save(user);

        log.info("MFA enabled successfully for user: {}", userId);
        return secret;
    }

    @Transactional
    public void disableMfa(String userId, String verificationCode) {
        log.info("Disabling MFA for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.getMfaEnabled()) {
            log.warn("MFA already disabled for user: {}", userId);
            return;
        }

        // Verify code before disabling
        if (!validateMfaCode(user, verificationCode)) {
            throw new InvalidCredentialsException("Invalid MFA code");
        }

        user.setMfaSecret(null);
        user.setMfaEnabled(false);

        userRepository.save(user);

        log.info("MFA disabled successfully for user: {}", userId);
    }

    // ==================== MFA VALIDATION ====================

    @Transactional(readOnly = true)
    public boolean validateMfaCode(User user, String code) {
        if (user.getMfaSecret() == null || !user.getMfaEnabled()) {
            log.warn("MFA not enabled for user: {}", user.getId());
            return false;
        }

        try {
            String expectedCode = generateTOTP(user.getMfaSecret());
            boolean isValid = expectedCode.equals(code);

            if (isValid) {
                log.info("MFA code validated successfully for user: {}", user.getId());
            } else {
                log.warn("Invalid MFA code for user: {}", user.getId());
            }

            return isValid;
        } catch (Exception e) {
            log.error("Error validating MFA code for user: {}", user.getId(), e);
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean validateMfaCodeByUserId(String userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return validateMfaCode(user, code);
    }

    // ==================== TOTP GENERATION ====================

    private String generateTOTP(String secret) throws NoSuchAlgorithmException, InvalidKeyException {
        // Get current time counter (30 second intervals)
        long timeCounter = System.currentTimeMillis() / 1000 / TIME_STEP;

        // Decode secret
        byte[] decodedSecret = Base64.getDecoder().decode(secret);

        // Convert counter to byte array
        byte[] data = new byte[8];
        long value = timeCounter;
        for (int i = 7; i >= 0; i--) {
            data[i] = (byte) value;
            value >>>= 8;
        }

        // Generate HMAC-SHA1 hash
        SecretKeySpec signKey = new SecretKeySpec(decodedSecret, ALGORITHM);
        Mac mac = Mac.getInstance(ALGORITHM);
        mac.init(signKey);
        byte[] hash = mac.doFinal(data);

        // Dynamic truncation
        int offset = hash[hash.length - 1] & 0xF;
        long truncatedHash = 0;
        for (int i = 0; i < 4; i++) {
            truncatedHash <<= 8;
            truncatedHash |= (hash[offset + i] & 0xFF);
        }

        // Remove sign bit
        truncatedHash &= 0x7FFFFFFF;

        // Generate 6-digit code
        truncatedHash %= 1000000;

        return String.format("%06d", truncatedHash);
    }

    // ==================== QR CODE GENERATION ====================

    public String generateQRCodeUrl(String username, String secret, String issuer) {
        log.debug("Generating QR code URL for user: {}", username);

        // Format: otpauth://totp/Issuer:username?secret=SECRET&issuer=Issuer
        String otpUrl = String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s",
                issuer,
                username,
                secret,
                issuer
        );

        log.debug("QR code URL generated successfully");
        return otpUrl;
    }

    @Transactional(readOnly = true)
    public String generateQRCodeUrlForUser(String userId, String issuer) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getMfaSecret() == null) {
            throw new IllegalStateException("MFA not enabled for user");
        }

        return generateQRCodeUrl(user.getUsername(), user.getMfaSecret(), issuer);
    }

    // ==================== BACKUP CODES ====================

    public String[] generateBackupCodes(int count) {
        log.info("Generating {} backup codes", count);

        String[] backupCodes = new String[count];
        SecureRandom random = new SecureRandom();

        for (int i = 0; i < count; i++) {
            // Generate 8-digit backup code
            int code = 10000000 + random.nextInt(90000000);
            backupCodes[i] = String.valueOf(code);
        }

        log.info("Backup codes generated successfully");
        return backupCodes;
    }

    // ==================== VERIFICATION ====================

    @Transactional
    public boolean verifyMfaSetup(String userId, String verificationCode) {
        log.info("Verifying MFA setup for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getMfaSecret() == null) {
            throw new IllegalStateException("MFA secret not generated");
        }

        boolean isValid = validateMfaCode(user, verificationCode);

        if (isValid) {
            log.info("MFA setup verified successfully for user: {}", userId);
        } else {
            log.warn("MFA setup verification failed for user: {}", userId);
        }

        return isValid;
    }
}
