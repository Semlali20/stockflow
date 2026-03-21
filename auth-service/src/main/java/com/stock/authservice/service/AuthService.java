package com.stock.authservice.service;

import com.stock.authservice.constants.SecurityConstants;
import com.stock.authservice.dto.request.*;
import com.stock.authservice.dto.response.*;
import com.stock.authservice.entity.EmailVerificationToken;
import com.stock.authservice.entity.RefreshToken;
import com.stock.authservice.entity.User;
import com.stock.authservice.entity.UserSession;
import com.stock.authservice.event.AuthEventPublisher;
import com.stock.authservice.event.dto.UserLoginEvent;
import com.stock.authservice.event.dto.UserLogoutEvent;
import com.stock.authservice.exception.*;
import com.stock.authservice.repository.EmailVerificationTokenRepository;
import com.stock.authservice.repository.UserRepository;
import com.stock.authservice.security.CustomUserDetails;
import com.stock.authservice.security.JwtTokenProvider;
import com.stock.authservice.util.IpAddressUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final SessionService sessionService;
    private final AuditLogService auditLogService;
    private final AuthEventPublisher authEventPublisher;
    private final MfaService mfaService;
    private final UserService userService;
    private final EmailService emailService;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    // ==================== LOGIN ====================

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        log.info("Login attempt for user: {}", request.getUsernameOrEmail());

        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        // Find user
        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> {
                    auditLogService.logFailedLogin(request.getUsernameOrEmail(), ipAddress, "User not found");
                    return new InvalidCredentialsException();
                });

        // Check if account is locked
        if (user.getIsLocked() && !user.isAccountNonLocked()) {
            auditLogService.logFailedLogin(user.getUsername(), ipAddress, "Account locked");
            throw new AccountLockedException("Account is locked until " + user.getLockedUntil());
        }

        // Check if email is verified
        if (!user.getIsEmailVerified()) {
            throw new EmailNotVerifiedException("Email not verified. Please verify your email first.");
        }

        // Check if account is active
        if (!user.getIsActive()) {
            auditLogService.logFailedLogin(user.getUsername(), ipAddress, "Account deactivated");
            throw new InvalidCredentialsException("Account is deactivated");
        }

        try {
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()
                    )
            );

            log.info("Authentication successful for user: {}", user.getUsername());

            // Reset failed attempts on successful login
            user.resetFailedAttempts();
            userRepository.save(user);

            // Check MFA
            if (mfaService.isMfaRequired(user)) {
                String tempToken = jwtTokenProvider.generateMfaTempToken(user.getUsername());
                log.info("MFA required for user: {}", user.getUsername());

                return LoginResponse.builder()
                        .mfaRequired(true)
                        .tempToken(tempToken)
                        .build();
            }

            // Generate tokens
            log.debug("Generating access token...");
            String accessToken = jwtTokenProvider.generateAccessToken(authentication);

            log.debug("Creating refresh token...");
            RefreshToken refreshToken = tokenService.createRefreshToken(user, ipAddress, userAgent);

            // Create session
            log.debug("Creating user session...");
            UserSession session = sessionService.createSession(user, accessToken, ipAddress, userAgent, request.getDeviceType());

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Audit log
            auditLogService.logSuccessfulLogin(user.getId(), user.getUsername(), ipAddress);

            // Publish event
            authEventPublisher.publishUserLogin(UserLoginEvent.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .deviceType(request.getDeviceType())
                    .loginTime(LocalDateTime.now())
                    .mfaUsed(false)
                    .sessionId(session.getId())
                    .build());

            log.info("User logged in successfully: {}", user.getUsername());

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .tokenType("Bearer")
                    .expiresIn(SecurityConstants.ACCESS_TOKEN_EXPIRATION / 1000) // seconds
                    .user(userService.mapToUserResponse(user))
                    .mfaRequired(false)
                    .build();

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // Wrong password - specific handling
            log.error("Bad credentials for user: {}", user.getUsername());
            handleFailedLogin(user, ipAddress, userAgent);
            throw new InvalidCredentialsException();
        } catch (Exception e) {
            // Log the actual error for debugging
            log.error("Login failed for user: {} - Error: {}", user.getUsername(), e.getMessage(), e);
            handleFailedLogin(user, ipAddress, userAgent);
            throw new RuntimeException("Login failed: " + e.getMessage(), e);
        }
    }

    // ==================== REGISTER ====================

    @Transactional
    public ApiResponse<UserResponse> register(RegisterRequest request) {
        log.info("Registration attempt for username: {}", request.getUsername());

        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("User", "username", request.getUsername());
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .isEmailVerified(false)  // Not verified yet
                .isPhoneVerified(false)
                .mfaEnabled(false)
                .failedLoginAttempts(0)
                .build();

        // Assign default role
        userService.assignDefaultRole(user);

        user = userRepository.save(user);

        // Create email verification token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(24)) // Token valid for 24 hours
                .isUsed(false)
                .build();

        verificationTokenRepository.save(verificationToken);

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", user.getEmail(), e);
            // Don't fail registration if email fails
        }

        log.info("User registered successfully: {}", user.getUsername());

        return ApiResponse.success(
                "User registered successfully. Please verify your email.",
                userService.mapToUserResponse(user));
    }

    // ==================== REFRESH TOKEN ====================

    @Transactional
    public TokenResponse refreshAccessToken(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        log.info("Refresh token request");

        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);

        // Validate refresh token
        RefreshToken refreshToken = tokenService.validateRefreshToken(request.getRefreshToken());

        User user = refreshToken.getUser();

        // Generate new access token
        CustomUserDetails userDetails = CustomUserDetails.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );

        String newAccessToken = jwtTokenProvider.generateAccessToken(authentication);

        // Optionally rotate refresh token
        tokenService.revokeRefreshToken(request.getRefreshToken());
        RefreshToken newRefreshToken = tokenService.createRefreshToken(
                user, ipAddress, httpRequest.getHeader("User-Agent")
        );

        log.info("Access token refreshed for user: {}", user.getUsername());

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(SecurityConstants.ACCESS_TOKEN_EXPIRATION / 1000)
                .build();
    }

    // ==================== LOGOUT ====================

    @Transactional
    public ApiResponse<Void> logout(String accessToken, HttpServletRequest httpRequest) {
        log.info("Logout request");

        String username = jwtTokenProvider.getUsernameFromToken(accessToken);
        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Revoke all refresh tokens
        tokenService.revokeAllUserRefreshTokens(user.getId());

        // Audit log
        auditLogService.logLogout(user.getId(), user.getUsername(), ipAddress);

        // Publish event
        authEventPublisher.publishUserLogout(UserLogoutEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .logoutTime(LocalDateTime.now())
                .reason("USER_LOGOUT")
                .build());

        log.info("User logged out successfully: {}", user.getUsername());

        return ApiResponse.success("Logout successful", null);
    }

    // ==================== MFA VERIFICATION ====================

    @Transactional
    public LoginResponse verifyMfa(VerifyMfaRequest request, HttpServletRequest httpRequest) {
        log.info("MFA verification request");

        String username = jwtTokenProvider.getUsernameFromToken(request.getTempToken());
        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Validate MFA code
        if (!mfaService.validateMfaCode(user, request.getMfaCode())) {
            auditLogService.logFailedLogin(username, ipAddress, "Invalid MFA code");
            throw new InvalidCredentialsException("Invalid MFA code");
        }

        // Generate tokens
        CustomUserDetails userDetails = CustomUserDetails.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        RefreshToken refreshToken = tokenService.createRefreshToken(user, ipAddress, userAgent);

        // Create session
        UserSession session = sessionService.createSession(user, accessToken, ipAddress, userAgent, request.getDeviceType());

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Audit log
        auditLogService.logSuccessfulLogin(user.getId(), user.getUsername(), ipAddress);

        // Publish event
        authEventPublisher.publishUserLogin(UserLoginEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .deviceType(request.getDeviceType())
                .loginTime(LocalDateTime.now())
                .mfaUsed(true)
                .sessionId(session.getId())
                .build());

        log.info("MFA verification successful for user: {}", user.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(SecurityConstants.ACCESS_TOKEN_EXPIRATION / 1000)
                .user(userService.mapToUserResponse(user))
                .mfaRequired(false)
                .build();
    }

    // ==================== PASSWORD MANAGEMENT ====================

    @Transactional
    public ApiResponse<Void> forgotPassword(PasswordResetRequest request) {
        log.info("Forgot password request for: {}", request.getEmail());

        // TODO: Implement password reset token generation and email
        // 1. Find user by email
        // 2. Generate password reset token
        // 3. Save token to database
        // 4. Send email with reset link

        throw new UnsupportedOperationException("Password reset not implemented yet");
    }

    @Transactional
    public ApiResponse<Void> resetPassword(PasswordResetConfirmRequest request) {
        log.info("Reset password with token");

        // TODO: Implement password reset
        // 1. Validate reset token
        // 2. Check if token is expired
        // 3. Update user password
        // 4. Invalidate token
        // 5. Send confirmation email

        throw new UnsupportedOperationException("Password reset not implemented yet");
    }

    @Transactional
    public ApiResponse<Void> changePassword(PasswordChangeRequest request, String username) {
        log.info("Change password for user: {}", username);

        // TODO: Implement password change
        // 1. Find user by username
        // 2. Verify current password
        // 3. Validate new password
        // 4. Update password
        // 5. Invalidate all sessions/tokens
        // 6. Send notification email

        throw new UnsupportedOperationException("Password change not implemented yet");
    }

    @Transactional
    public ApiResponse<Void> verifyEmail(String token) {
        log.info("Email verification request with token");

        // Find token
        EmailVerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Verification token not found or expired"));

        // Check if already used
        if (verificationToken.getIsUsed()) {
            throw new IllegalStateException("This verification link has already been used");
        }

        // Check if expired
        if (verificationToken.isExpired()) {
            throw new IllegalStateException("This verification link has expired");
        }

        // Find user
        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", verificationToken.getUserId()));

        // Mark email as verified
        user.setIsEmailVerified(true);
        userRepository.save(user);

        // Mark token as used
        verificationToken.markAsVerified();
        verificationTokenRepository.save(verificationToken);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
            // Don't fail verification if welcome email fails
        }

        log.info("Email verified successfully for user: {}", user.getUsername());

        return ApiResponse.success("Email verified successfully", null);
    }

    // ==================== HELPER METHODS ====================

    private void handleFailedLogin(User user, String ipAddress, String userAgent) {
        if (user == null) {
            auditLogService.logFailedLogin("unknown", ipAddress, "Invalid username or password");
            return;
        }

        user.incrementFailedAttempts();

        if (user.getFailedLoginAttempts() >= SecurityConstants.MAX_FAILED_LOGIN_ATTEMPTS) {
            user.lock(SecurityConstants.ACCOUNT_LOCK_DURATION_MINUTES);
            log.warn("Account locked for user: {}", user.getUsername());

            auditLogService.logAction(
                    user.getId(),
                    user.getUsername(),
                    "ACCOUNT_LOCKED",
                    ipAddress
            );
        }

        userRepository.save(user);
        auditLogService.logFailedLogin(user.getUsername(), ipAddress, "Invalid password");
    }
}
