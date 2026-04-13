package com.stock.authservice.constants;

public final class MessageConstants {

    private MessageConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // ==================== SUCCESS MESSAGES ====================
    public static final String LOGIN_SUCCESS = "Login successful";
    public static final String LOGOUT_SUCCESS = "Logout successful";
    public static final String REGISTRATION_SUCCESS = "Registration successful. Please verify your email.";
    public static final String PASSWORD_CHANGED = "Password changed successfully";
    public static final String PASSWORD_RESET_EMAIL_SENT = "Password reset link has been sent to your email";
    public static final String PASSWORD_RESET_SUCCESS = "Password reset successful";
    public static final String EMAIL_VERIFIED = "Email verified successfully";
    public static final String MFA_ENABLED = "MFA enabled successfully";
    public static final String MFA_DISABLED = "MFA disabled successfully";
    public static final String MFA_VERIFIED = "MFA verification successful";
    public static final String USER_CREATED = "User created successfully";
    public static final String USER_UPDATED = "User updated successfully";
    public static final String USER_DELETED = "User deleted successfully";
    public static final String ROLE_CREATED = "Role created successfully";
    public static final String ROLE_UPDATED = "Role updated successfully";
    public static final String ROLE_DELETED = "Role deleted successfully";
    public static final String PERMISSION_ASSIGNED = "Permission assigned successfully";
    public static final String PERMISSION_REVOKED = "Permission revoked successfully";
    public static final String SESSION_TERMINATED = "Session terminated successfully";

    // ==================== ERROR MESSAGES ====================
    public static final String INVALID_CREDENTIALS = "Invalid username or password";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String EMAIL_NOT_FOUND = "Email not found";
    public static final String ACCOUNT_LOCKED = "Account is locked. Please try again later.";
    public static final String ACCOUNT_DISABLED = "Account is disabled. Please contact support.";
    public static final String TOKEN_EXPIRED = "Token has expired";
    public static final String TOKEN_INVALID = "Invalid token";
    public static final String REFRESH_TOKEN_EXPIRED = "Refresh token has expired. Please login again.";
    public static final String MFA_CODE_INVALID = "Invalid MFA code";
    public static final String MFA_REQUIRED = "MFA verification required";
    public static final String PASSWORD_MISMATCH = "Passwords do not match";
    public static final String PASSWORD_TOO_WEAK = "Password does not meet security requirements";
    public static final String PASSWORD_SAME_AS_OLD = "New password cannot be the same as old password";
    public static final String USERNAME_EXISTS = "Username already exists";
    public static final String EMAIL_EXISTS = "Email already exists";
    public static final String ROLE_NOT_FOUND = "Role not found";
    public static final String PERMISSION_NOT_FOUND = "Permission not found";
    public static final String UNAUTHORIZED_ACCESS = "You do not have permission to access this resource";
    public static final String RATE_LIMIT_EXCEEDED = "Too many requests. Please try again later.";
    public static final String EMAIL_SEND_FAILED = "Failed to send email. Please try again.";
    public static final String INVALID_RESET_TOKEN = "Invalid or expired reset token";

    // ==================== VALIDATION MESSAGES ====================
    public static final String USERNAME_REQUIRED = "Username is required";
    public static final String EMAIL_REQUIRED = "Email is required";
    public static final String EMAIL_INVALID = "Invalid email format";
    public static final String PASSWORD_REQUIRED = "Password is required";
    public static final String PASSWORD_MIN_LENGTH = "Password must be at least 8 characters";
    public static final String PASSWORD_MUST_CONTAIN_UPPERCASE = "Password must contain at least one uppercase letter";
    public static final String PASSWORD_MUST_CONTAIN_LOWERCASE = "Password must contain at least one lowercase letter";
    public static final String PASSWORD_MUST_CONTAIN_DIGIT = "Password must contain at least one digit";
    public static final String PASSWORD_MUST_CONTAIN_SPECIAL = "Password must contain at least one special character";
    public static final String MFA_CODE_REQUIRED = "MFA code is required";
    public static final String MFA_CODE_INVALID_FORMAT = "MFA code must be 6 digits";

    // ==================== INFO MESSAGES ====================
    public static final String CHECK_EMAIL = "Please check your email for further instructions";
    public static final String VERIFICATION_EMAIL_SENT = "Verification email has been sent";
    public static final String MFA_SETUP_INSTRUCTIONS = "Scan the QR code with your authenticator app";
}
