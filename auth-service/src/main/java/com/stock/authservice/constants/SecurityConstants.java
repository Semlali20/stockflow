package com.stock.authservice.constants;

public final class SecurityConstants {

    private SecurityConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // JWT Constants
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String TOKEN_TYPE = "JWT";

    // Token Expiration (milliseconds)
    public static final long ACCESS_TOKEN_EXPIRATION = 900000; // 15 minutes
    public static final long REFRESH_TOKEN_EXPIRATION = 604800000; // 7 days
    public static final long MFA_TEMP_TOKEN_EXPIRATION = 300000; // 5 minutes
    public static final long PASSWORD_RESET_TOKEN_EXPIRATION = 3600000; // 1 hour
    public static final long EMAIL_VERIFICATION_TOKEN_EXPIRATION = 86400000; // 24 hours

    // Password Policy
    public static final int PASSWORD_MIN_LENGTH = 8;
    public static final int PASSWORD_MAX_LENGTH = 100;
    public static final int PASSWORD_MIN_UPPERCASE = 1;
    public static final int PASSWORD_MIN_LOWERCASE = 1;
    public static final int PASSWORD_MIN_DIGITS = 1;
    public static final int PASSWORD_MIN_SPECIAL_CHARS = 1;
    public static final String PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    public static final int PASSWORD_HISTORY_SIZE = 5; // Remember last 5 passwords
    public static final int PASSWORD_EXPIRATION_DAYS = 90; // Force password change after 90 days

    // Account Lockout Policy
    public static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    public static final int ACCOUNT_LOCKOUT_DURATION_MINUTES = 30;
    public static final int FAILED_ATTEMPTS_RESET_MINUTES = 60; // Reset counter after 1 hour
    // Session Constants
    public static final int MAX_CONCURRENT_SESSIONS = 5;
    public static final int SESSION_INACTIVITY_TIMEOUT_MINUTES = 30;
    // Rate Limiting
    public static final int LOGIN_RATE_LIMIT = 5; // 5 attempts
    public static final int LOGIN_RATE_LIMIT_WINDOW_MINUTES = 15; // per 15 minutes
    public static final int PASSWORD_RESET_RATE_LIMIT = 3; // 3 requests
    public static final int PASSWORD_RESET_RATE_LIMIT_WINDOW_HOURS = 1; // per hour
    public static final int MFA_VERIFY_RATE_LIMIT = 5; // 5 attempts
    public static final int MFA_VERIFY_RATE_LIMIT_WINDOW_MINUTES = 10; // per 10 minutes
    public static final int TOKEN_REFRESH_RATE_LIMIT = 10; // 10 refreshes
    public static final int TOKEN_REFRESH_RATE_LIMIT_WINDOW_MINUTES = 60; // per hour

    // Session Management

    public static final int SESSION_CLEANUP_INTERVAL_HOURS = 24;

    // MFA
    public static final int MFA_CODE_LENGTH = 6;
    public static final int MFA_CODE_VALIDITY_SECONDS = 30; // TOTP window
    public static final int MFA_BACKUP_CODES_COUNT = 10;
    public static final int MFA_BACKUP_CODE_LENGTH = 8;
    // Account Lock Constants
    public static final int ACCOUNT_LOCK_DURATION_MINUTES = 30;


    // Username Policy
    public static final int USERNAME_MIN_LENGTH = 3;
    public static final int USERNAME_MAX_LENGTH = 50;
    public static final String USERNAME_PATTERN = "^[a-zA-Z0-9_-]+$";

    // Email Policy
    public static final int EMAIL_MAX_LENGTH = 100;

    // Audit & Cleanup
    public static final int AUDIT_LOG_RETENTION_DAYS = 365; // 1 year
    public static final int EXPIRED_TOKEN_CLEANUP_DAYS = 7;
    public static final int INACTIVE_USER_CLEANUP_DAYS = 365; // Users who never logged in

    // Redis Cache TTL (seconds)
    public static final long CACHE_USER_TTL = 3600; // 1 hour
    public static final long CACHE_ROLE_TTL = 7200; // 2 hours
    public static final long CACHE_PERMISSION_TTL = 7200; // 2 hours
    public static final long CACHE_TOKEN_BLACKLIST_TTL = 900; // 15 minutes

    // API Rate Limiting Keys
    public static final String RATE_LIMIT_PREFIX = "rate_limit:";
    public static final String LOGIN_RATE_LIMIT_KEY = RATE_LIMIT_PREFIX + "login:";
    public static final String PASSWORD_RESET_RATE_LIMIT_KEY = RATE_LIMIT_PREFIX + "password_reset:";
    public static final String MFA_RATE_LIMIT_KEY = RATE_LIMIT_PREFIX + "mfa:";
}
