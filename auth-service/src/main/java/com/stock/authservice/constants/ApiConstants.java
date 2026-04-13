package com.stock.authservice.constants;

public final class ApiConstants {

    private ApiConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // API Base Paths
    public static final String API_BASE_PATH = "/api";
    public static final String API_VERSION_1 = "/v1";

    // Authentication Endpoints
    public static final String AUTH_BASE = API_BASE_PATH + "/auth";
    public static final String AUTH_LOGIN = "/login";
    public static final String AUTH_REGISTER = "/register";
    public static final String AUTH_LOGOUT = "/logout";
    public static final String AUTH_REFRESH = "/refresh";
    public static final String AUTH_FORGOT_PASSWORD = "/forgot-password";
    public static final String AUTH_RESET_PASSWORD = "/reset-password";
    public static final String AUTH_CHANGE_PASSWORD = "/change-password";
    public static final String AUTH_VERIFY_EMAIL = "/verify-email";

    // User Endpoints
    public static final String USERS_BASE = API_BASE_PATH + "/users";
    public static final String USER_ME = "/me";
    public static final String USER_PROFILE = "/profile";

    // Role Endpoints
    public static final String ROLES_BASE = API_BASE_PATH + "/roles";

    // Permission Endpoints
    public static final String PERMISSIONS_BASE = API_BASE_PATH + "/permissions";

    // MFA Endpoints
    public static final String MFA_BASE = API_BASE_PATH + "/mfa";
    public static final String MFA_ENABLE = "/enable";
    public static final String MFA_DISABLE = "/disable";
    public static final String MFA_VERIFY = "/verify";
    public static final String MFA_BACKUP_CODES = "/backup-codes";

    // Session Endpoints
    public static final String SESSIONS_BASE = API_BASE_PATH + "/sessions";

    // Audit Endpoints
    public static final String AUDIT_BASE = API_BASE_PATH + "/audit";

    // HTTP Headers
    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String HEADER_CONTENT_TYPE = "Content-Type";
    public static final String HEADER_ACCEPT = "Accept";
    public static final String HEADER_USER_AGENT = "User-Agent";
    public static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";
    public static final String HEADER_X_REAL_IP = "X-Real-IP";

    // Content Types
    public static final String CONTENT_TYPE_JSON = "application/json";
    public static final String CONTENT_TYPE_FORM = "application/x-www-form-urlencoded";

    // Response Messages
    public static final String SUCCESS = "Operation completed successfully";
    public static final String CREATED = "Resource created successfully";
    public static final String UPDATED = "Resource updated successfully";
    public static final String DELETED = "Resource deleted successfully";
    public static final String NOT_FOUND = "Resource not found";
    public static final String UNAUTHORIZED = "Unauthorized access";
    public static final String FORBIDDEN = "Access forbidden";
    public static final String BAD_REQUEST = "Invalid request";
    public static final String INTERNAL_ERROR = "Internal server error";

    // Pagination
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "DESC";
}
