package com.stock.authservice.util;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

public final class RandomTokenGenerator {

    private RandomTokenGenerator() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final String NUMERIC = "0123456789";
    private static final String UPPERCASE_ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    // ==================== UUID TOKENS ====================

    public static String generateUUID() {
        return UUID.randomUUID().toString();
    }

    public static String generateUUIDWithoutHyphens() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    // ==================== SECURE RANDOM TOKENS ====================

    public static String generateSecureToken(int length) {
        byte[] bytes = new byte[length];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String generateAlphanumericToken(int length) {
        StringBuilder token = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            token.append(ALPHANUMERIC.charAt(SECURE_RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return token.toString();
    }

    public static String generateNumericToken(int length) {
        StringBuilder token = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            token.append(NUMERIC.charAt(SECURE_RANDOM.nextInt(NUMERIC.length())));
        }
        return token.toString();
    }

    public static String generateUppercaseAlphanumericToken(int length) {
        StringBuilder token = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            token.append(UPPERCASE_ALPHANUMERIC.charAt(SECURE_RANDOM.nextInt(UPPERCASE_ALPHANUMERIC.length())));
        }
        return token.toString();
    }

    // ==================== SPECIFIC TOKEN TYPES ====================

    public static String generatePasswordResetToken() {
        return generateSecureToken(32);
    }

    public static String generateEmailVerificationToken() {
        return generateSecureToken(32);
    }

    public static String generateMfaBackupCode() {
        return generateUppercaseAlphanumericToken(8);
    }

    public static String generateOtpCode() {
        return generateNumericToken(6);
    }

    public static String generateSessionToken() {
        return generateSecureToken(48);
    }

    // ==================== HEX TOKENS ====================

    public static String generateHexToken(int byteLength) {
        byte[] bytes = new byte[byteLength];
        SECURE_RANDOM.nextBytes(bytes);
        return bytesToHex(bytes);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder(2 * bytes.length);
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    // ==================== CUSTOM FORMAT ====================

    public static String generateFormattedToken(String format) {
        // Format: XXXX-XXXX-XXXX where X is alphanumeric
        StringBuilder token = new StringBuilder();
        for (char c : format.toCharArray()) {
            if (c == 'X' || c == 'x') {
                token.append(ALPHANUMERIC.charAt(SECURE_RANDOM.nextInt(ALPHANUMERIC.length())));
            } else if (c == 'N' || c == 'n') {
                token.append(NUMERIC.charAt(SECURE_RANDOM.nextInt(NUMERIC.length())));
            } else {
                token.append(c);
            }
        }
        return token.toString();
    }

    // ==================== VALIDATION ====================

    public static boolean isValidUUID(String token) {
        try {
            UUID.fromString(token);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static boolean isValidNumericToken(String token, int expectedLength) {
        if (token == null || token.length() != expectedLength) {
            return false;
        }
        return token.matches("\\d+");
    }

    public static boolean isValidAlphanumericToken(String token, int expectedLength) {
        if (token == null || token.length() != expectedLength) {
            return false;
        }
        return token.matches("[A-Za-z0-9]+");
    }
}
