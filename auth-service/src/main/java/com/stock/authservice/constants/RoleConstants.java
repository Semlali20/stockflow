package com.stock.authservice.constants;

public final class RoleConstants {

    private RoleConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // System Roles
    public static final String ADMIN = "ADMIN";
    public static final String USER = "USER";
    public static final String OPERATOR = "OPERATOR";
    public static final String SUPERVISOR = "SUPERVISOR";
    public static final String WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER";
    public static final String QUALITY_MANAGER = "QUALITY_MANAGER";
    public static final String PROCUREMENT = "PROCUREMENT";
    public static final String AUDITOR = "AUDITOR";
    public static final String MANAGER = "MANAGER";

    // Role Prefixes for Spring Security
    public static final String ROLE_PREFIX = "ROLE_";
    public static final String ROLE_ADMIN = ROLE_PREFIX + ADMIN;
    public static final String ROLE_USER = ROLE_PREFIX + USER;
    public static final String ROLE_OPERATOR = ROLE_PREFIX + OPERATOR;
    public static final String ROLE_SUPERVISOR = ROLE_PREFIX + SUPERVISOR;
    public static final String ROLE_WAREHOUSE_MANAGER = ROLE_PREFIX + WAREHOUSE_MANAGER;
    public static final String ROLE_QUALITY_MANAGER = ROLE_PREFIX + QUALITY_MANAGER;
    public static final String ROLE_PROCUREMENT = ROLE_PREFIX + PROCUREMENT;
    public static final String ROLE_AUDITOR = ROLE_PREFIX + AUDITOR;
    public static final String ROLE_MANAGER = ROLE_PREFIX + MANAGER;

    // Role Descriptions
    public static final String ADMIN_DESCRIPTION = "Full system access with all permissions";
    public static final String USER_DESCRIPTION = "Basic user with limited permissions";
    public static final String OPERATOR_DESCRIPTION = "Warehouse operator for receiving, picking, and inventory operations";
    public static final String SUPERVISOR_DESCRIPTION = "Warehouse supervisor with approval rights";
    public static final String WAREHOUSE_MANAGER_DESCRIPTION = "Warehouse manager with full warehouse access";
    public static final String QUALITY_MANAGER_DESCRIPTION = "Quality manager for QC and traceability";
    public static final String PROCUREMENT_DESCRIPTION = "Procurement specialist for purchasing operations";
    public static final String AUDITOR_DESCRIPTION = "Auditor with read-only access to logs and reports";
    public static final String MANAGER_DESCRIPTION = "Management level with KPI and reporting access";

    // Default Role
    public static final String DEFAULT_ROLE = USER;
}
