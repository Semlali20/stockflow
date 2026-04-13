package com.stock.authservice.constants;

public final class KafkaTopics {

    private KafkaTopics() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // Topic Prefix
    public static final String TOPIC_PREFIX = "auth.";

    // ==================== AUTHENTICATION EVENTS ====================
    public static final String USER_LOGIN = TOPIC_PREFIX + "user.login";
    public static final String USER_LOGOUT = TOPIC_PREFIX + "user.logout";
    public static final String USER_LOGIN_FAILED = TOPIC_PREFIX + "user.login.failed";
    public static final String TOKEN_REFRESH = TOPIC_PREFIX + "token.refresh";

    // ==================== USER EVENTS ====================
    public static final String USER_CREATED = TOPIC_PREFIX + "user.created";
    public static final String USER_UPDATED = TOPIC_PREFIX + "user.updated";
    public static final String USER_DELETED = TOPIC_PREFIX + "user.deleted";
    public static final String USER_ACTIVATED = TOPIC_PREFIX + "user.activated";
    public static final String USER_DEACTIVATED = TOPIC_PREFIX + "user.deactivated";
    public static final String USER_LOCKED = TOPIC_PREFIX + "user.locked";
    public static final String USER_UNLOCKED = TOPIC_PREFIX + "user.unlocked";

    // ==================== PASSWORD EVENTS ====================
    public static final String PASSWORD_CHANGED = TOPIC_PREFIX + "password.changed";
    public static final String PASSWORD_RESET_REQUESTED = TOPIC_PREFIX + "password.reset.requested";
    public static final String PASSWORD_RESET_COMPLETED = TOPIC_PREFIX + "password.reset.completed";

    // ==================== MFA EVENTS ====================
    public static final String MFA_ENABLED = TOPIC_PREFIX + "mfa.enabled";
    public static final String MFA_DISABLED = TOPIC_PREFIX + "mfa.disabled";
    public static final String MFA_VERIFY_SUCCESS = TOPIC_PREFIX + "mfa.verify.success";
    public static final String MFA_VERIFY_FAILED = TOPIC_PREFIX + "mfa.verify.failed";

    // ==================== ROLE & PERMISSION EVENTS ====================
    public static final String ROLE_CREATED = TOPIC_PREFIX + "role.created";
    public static final String ROLE_UPDATED = TOPIC_PREFIX + "role.updated";
    public static final String ROLE_DELETED = TOPIC_PREFIX + "role.deleted";
    public static final String ROLE_ASSIGNED = TOPIC_PREFIX + "role.assigned";
    public static final String ROLE_REVOKED = TOPIC_PREFIX + "role.revoked";
    public static final String PERMISSION_GRANTED = TOPIC_PREFIX + "permission.granted";
    public static final String PERMISSION_REVOKED = TOPIC_PREFIX + "permission.revoked";

    // ==================== EMAIL EVENTS ====================
    public static final String EMAIL_VERIFICATION_SENT = TOPIC_PREFIX + "email.verification.sent";
    public static final String EMAIL_VERIFIED = TOPIC_PREFIX + "email.verified";

    // ==================== SESSION EVENTS ====================
    public static final String SESSION_CREATED = TOPIC_PREFIX + "session.created";
    public static final String SESSION_TERMINATED = TOPIC_PREFIX + "session.terminated";
    public static final String SESSION_EXPIRED = TOPIC_PREFIX + "session.expired";

    // ==================== SECURITY EVENTS ====================
    public static final String SECURITY_BREACH_DETECTED = TOPIC_PREFIX + "security.breach.detected";
    public static final String SUSPICIOUS_ACTIVITY = TOPIC_PREFIX + "security.suspicious.activity";
    public static final String RATE_LIMIT_EXCEEDED = TOPIC_PREFIX + "security.rate.limit.exceeded";

    // Topic Configuration
    public static final int DEFAULT_PARTITIONS = 3;
    public static final short DEFAULT_REPLICATION_FACTOR = 1;
}
