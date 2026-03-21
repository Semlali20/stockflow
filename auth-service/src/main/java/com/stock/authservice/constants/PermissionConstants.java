package com.stock.authservice.constants;

public final class PermissionConstants {

    private PermissionConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // Permission Format: RESOURCE:ACTION:SCOPE

    // ==================== USER MANAGEMENT ====================
    public static final String USER_CREATE = "user:create:all";
    public static final String USER_READ = "user:read:all";
    public static final String USER_READ_OWN = "user:read:own";
    public static final String USER_UPDATE = "user:update:all";
    public static final String USER_UPDATE_OWN = "user:update:own";
    public static final String USER_DELETE = "user:delete:all";
    public static final String USER_ACTIVATE = "user:activate:all";
    public static final String USER_DEACTIVATE = "user:deactivate:all";

    // ==================== ROLE MANAGEMENT ====================
    public static final String ROLE_CREATE = "role:create:all";
    public static final String ROLE_READ = "role:read:all";
    public static final String ROLE_UPDATE = "role:update:all";
    public static final String ROLE_DELETE = "role:delete:all";
    public static final String ROLE_ASSIGN = "role:assign:all";
    public static final String ROLE_REVOKE = "role:revoke:all";

    // ==================== PERMISSION MANAGEMENT ====================
    public static final String PERMISSION_CREATE = "permission:create:all";
    public static final String PERMISSION_READ = "permission:read:all";
    public static final String PERMISSION_UPDATE = "permission:update:all";
    public static final String PERMISSION_DELETE = "permission:delete:all";
    public static final String PERMISSION_ASSIGN = "permission:assign:all";
    public static final String PERMISSION_REVOKE = "permission:revoke:all";

    // ==================== INVENTORY MANAGEMENT ====================
    public static final String INVENTORY_CREATE = "inventory:create:all";
    public static final String INVENTORY_READ = "inventory:read:all";
    public static final String INVENTORY_READ_SITE = "inventory:read:site";
    public static final String INVENTORY_UPDATE = "inventory:update:all";
    public static final String INVENTORY_DELETE = "inventory:delete:all";
    public static final String INVENTORY_COUNT = "inventory:count:all";
    public static final String INVENTORY_ADJUST = "inventory:adjust:all";

    // ==================== MOVEMENT OPERATIONS ====================
    public static final String MOVEMENT_CREATE = "movement:create:all";
    public static final String MOVEMENT_READ = "movement:read:all";
    public static final String MOVEMENT_READ_SITE = "movement:read:site";
    public static final String MOVEMENT_UPDATE = "movement:update:all";
    public static final String MOVEMENT_DELETE = "movement:delete:all";
    public static final String MOVEMENT_APPROVE = "movement:approve:all";
    public static final String MOVEMENT_RECEIVE = "movement:receive:all";
    public static final String MOVEMENT_PICK = "movement:pick:all";
    public static final String MOVEMENT_TRANSFER = "movement:transfer:all";

    // ==================== LOCATION MANAGEMENT ====================
    public static final String LOCATION_CREATE = "location:create:all";
    public static final String LOCATION_READ = "location:read:all";
    public static final String LOCATION_UPDATE = "location:update:all";
    public static final String LOCATION_DELETE = "location:delete:all";

    // ==================== PRODUCT MANAGEMENT ====================
    public static final String PRODUCT_CREATE = "product:create:all";
    public static final String PRODUCT_READ = "product:read:all";
    public static final String PRODUCT_UPDATE = "product:update:all";
    public static final String PRODUCT_DELETE = "product:delete:all";

    // ==================== QUALITY MANAGEMENT ====================
    public static final String QUALITY_INSPECT = "quality:inspect:all";
    public static final String QUALITY_APPROVE = "quality:approve:all";
    public static final String QUALITY_REJECT = "quality:reject:all";
    public static final String QUALITY_QUARANTINE = "quality:quarantine:all";
    public static final String QUALITY_RELEASE = "quality:release:all";

    // ==================== TRACEABILITY ====================
    public static final String TRACE_VIEW = "trace:view:all";
    public static final String TRACE_LOT = "trace:lot:all";
    public static final String TRACE_SERIAL = "trace:serial:all";
    public static final String TRACE_RECALL = "trace:recall:all";

    // ==================== REPORTING ====================
    public static final String REPORT_VIEW = "report:view:all";
    public static final String REPORT_CREATE = "report:create:all";
    public static final String REPORT_EXPORT = "report:export:all";
    public static final String REPORT_SCHEDULE = "report:schedule:all";

    // ==================== AUDIT LOGS ====================
    public static final String AUDIT_READ = "audit:read:all";
    public static final String AUDIT_EXPORT = "audit:export:all";

    // ==================== SESSION MANAGEMENT ====================
    public static final String SESSION_VIEW = "session:view:all";
    public static final String SESSION_VIEW_OWN = "session:view:own";
    public static final String SESSION_TERMINATE = "session:terminate:all";
    public static final String SESSION_TERMINATE_OWN = "session:terminate:own";

    // ==================== SYSTEM CONFIGURATION ====================
    public static final String CONFIG_READ = "config:read:all";
    public static final String CONFIG_UPDATE = "config:update:all";
    public static final String CONFIG_INTEGRATION = "config:integration:all";

    // Resources
    public static final String RESOURCE_USER = "user";
    public static final String RESOURCE_ROLE = "role";
    public static final String RESOURCE_PERMISSION = "permission";
    public static final String RESOURCE_INVENTORY = "inventory";
    public static final String RESOURCE_MOVEMENT = "movement";
    public static final String RESOURCE_LOCATION = "location";
    public static final String RESOURCE_PRODUCT = "product";
    public static final String RESOURCE_QUALITY = "quality";
    public static final String RESOURCE_TRACE = "trace";
    public static final String RESOURCE_REPORT = "report";
    public static final String RESOURCE_AUDIT = "audit";
    public static final String RESOURCE_SESSION = "session";
    public static final String RESOURCE_CONFIG = "config";

    // Actions
    public static final String ACTION_CREATE = "create";
    public static final String ACTION_READ = "read";
    public static final String ACTION_UPDATE = "update";
    public static final String ACTION_DELETE = "delete";
    public static final String ACTION_APPROVE = "approve";
    public static final String ACTION_REJECT = "reject";
    public static final String ACTION_EXPORT = "export";
    public static final String ACTION_VIEW = "view";
    public static final String ACTION_TERMINATE = "terminate";

    // Scopes
    public static final String SCOPE_ALL = "all";
    public static final String SCOPE_OWN = "own";
    public static final String SCOPE_SITE = "site";
    public static final String SCOPE_WAREHOUSE = "warehouse";
}
