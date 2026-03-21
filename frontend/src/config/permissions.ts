// ─── ROLE DEFINITIONS ────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  QUALITY_MANAGER: 'QUALITY_MANAGER',
  SUPERVISOR: 'SUPERVISOR',
  OPERATOR: 'OPERATOR',
  PROCUREMENT: 'PROCUREMENT',
  AUDITOR: 'AUDITOR',
  USER: 'USER',
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleName = typeof ROLES[RoleKey];

// ─── PERMISSION DEFINITIONS ───────────────────────────────────────────────────

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW:         'dashboard:view',

  // Products
  PRODUCTS_VIEW:          'products:view',
  PRODUCTS_CREATE:        'products:create',
  PRODUCTS_EDIT:          'products:edit',
  PRODUCTS_DELETE:        'products:delete',

  // Categories
  CATEGORIES_VIEW:        'categories:view',
  CATEGORIES_CREATE:      'categories:create',
  CATEGORIES_EDIT:        'categories:edit',
  CATEGORIES_DELETE:      'categories:delete',

  // Inventory
  INVENTORY_VIEW:         'inventory:view',
  INVENTORY_CREATE:       'inventory:create',
  INVENTORY_EDIT:         'inventory:edit',
  INVENTORY_DELETE:       'inventory:delete',

  // Lots & Serials
  LOTS_VIEW:              'lots:view',
  LOTS_CREATE:            'lots:create',
  LOTS_EDIT:              'lots:edit',
  LOTS_DELETE:            'lots:delete',
  SERIALS_VIEW:           'serials:view',
  SERIALS_CREATE:         'serials:create',
  SERIALS_EDIT:           'serials:edit',
  SERIALS_DELETE:         'serials:delete',

  // Locations
  LOCATIONS_VIEW:         'locations:view',
  LOCATIONS_CREATE:       'locations:create',
  LOCATIONS_EDIT:         'locations:edit',
  LOCATIONS_DELETE:       'locations:delete',

  // Movements
  MOVEMENTS_VIEW:         'movements:view',
  MOVEMENTS_CREATE:       'movements:create',
  MOVEMENTS_EDIT:         'movements:edit',
  MOVEMENTS_DELETE:       'movements:delete',
  MOVEMENTS_APPROVE:      'movements:approve',
  MOVEMENTS_CANCEL:       'movements:cancel',

  // Quality
  QUALITY_VIEW:           'quality:view',
  QUALITY_CREATE:         'quality:create',
  QUALITY_EDIT:           'quality:edit',
  QUALITY_DELETE:         'quality:delete',
  QUALITY_APPROVE:        'quality:approve',
  QUARANTINE_MANAGE:      'quarantine:manage',

  // Alerts
  ALERTS_VIEW:            'alerts:view',
  ALERTS_MANAGE:          'alerts:manage',
  ALERTS_DELETE:          'alerts:delete',

  // Users (admin only)
  USERS_VIEW:             'users:view',
  USERS_CREATE:           'users:create',
  USERS_EDIT:             'users:edit',
  USERS_DELETE:           'users:delete',

  // Permissions (admin only)
  PERMISSIONS_VIEW:       'permissions:view',
  PERMISSIONS_MANAGE:     'permissions:manage',

  // Audit Logs
  AUDIT_VIEW:             'audit:view',

  // Settings
  SETTINGS_VIEW:          'settings:view',
  SETTINGS_MANAGE:        'settings:manage',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type Permission = typeof PERMISSIONS[PermissionKey];

// ─── ROLE → PERMISSIONS MATRIX ────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS),

  MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.CATEGORIES_VIEW, PERMISSIONS.CATEGORIES_CREATE, PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_CREATE, PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.LOTS_VIEW, PERMISSIONS.LOTS_CREATE, PERMISSIONS.LOTS_EDIT,
    PERMISSIONS.SERIALS_VIEW, PERMISSIONS.SERIALS_CREATE, PERMISSIONS.SERIALS_EDIT,
    PERMISSIONS.LOCATIONS_VIEW, PERMISSIONS.LOCATIONS_CREATE, PERMISSIONS.LOCATIONS_EDIT,
    PERMISSIONS.MOVEMENTS_VIEW, PERMISSIONS.MOVEMENTS_CREATE, PERMISSIONS.MOVEMENTS_EDIT,
    PERMISSIONS.MOVEMENTS_APPROVE, PERMISSIONS.MOVEMENTS_CANCEL,
    PERMISSIONS.QUALITY_VIEW, PERMISSIONS.QUALITY_CREATE, PERMISSIONS.QUALITY_EDIT, PERMISSIONS.QUALITY_APPROVE,
    PERMISSIONS.QUARANTINE_MANAGE,
    PERMISSIONS.ALERTS_VIEW, PERMISSIONS.ALERTS_MANAGE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  WAREHOUSE_MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_CREATE, PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.LOTS_VIEW, PERMISSIONS.LOTS_CREATE, PERMISSIONS.LOTS_EDIT,
    PERMISSIONS.SERIALS_VIEW, PERMISSIONS.SERIALS_CREATE, PERMISSIONS.SERIALS_EDIT,
    PERMISSIONS.LOCATIONS_VIEW, PERMISSIONS.LOCATIONS_CREATE, PERMISSIONS.LOCATIONS_EDIT,
    PERMISSIONS.MOVEMENTS_VIEW, PERMISSIONS.MOVEMENTS_CREATE, PERMISSIONS.MOVEMENTS_EDIT,
    PERMISSIONS.MOVEMENTS_APPROVE, PERMISSIONS.MOVEMENTS_CANCEL,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  QUALITY_MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOTS_VIEW,
    PERMISSIONS.SERIALS_VIEW,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.MOVEMENTS_VIEW,
    PERMISSIONS.QUALITY_VIEW, PERMISSIONS.QUALITY_CREATE, PERMISSIONS.QUALITY_EDIT,
    PERMISSIONS.QUALITY_DELETE, PERMISSIONS.QUALITY_APPROVE,
    PERMISSIONS.QUARANTINE_MANAGE,
    PERMISSIONS.ALERTS_VIEW, PERMISSIONS.ALERTS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  SUPERVISOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.LOTS_VIEW, PERMISSIONS.LOTS_CREATE,
    PERMISSIONS.SERIALS_VIEW, PERMISSIONS.SERIALS_CREATE,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.MOVEMENTS_VIEW, PERMISSIONS.MOVEMENTS_CREATE, PERMISSIONS.MOVEMENTS_EDIT,
    PERMISSIONS.MOVEMENTS_APPROVE,
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  OPERATOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOTS_VIEW,
    PERMISSIONS.SERIALS_VIEW,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.MOVEMENTS_VIEW, PERMISSIONS.MOVEMENTS_CREATE,
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  PROCUREMENT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.CATEGORIES_VIEW, PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOTS_VIEW, PERMISSIONS.LOTS_CREATE,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.MOVEMENTS_VIEW, PERMISSIONS.MOVEMENTS_CREATE,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  AUDITOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOTS_VIEW,
    PERMISSIONS.SERIALS_VIEW,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.MOVEMENTS_VIEW,
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  USER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOTS_VIEW,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.MOVEMENTS_VIEW,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

// ─── PERMISSION GROUPS (for UI display) ───────────────────────────────────────

export interface PermissionGroup {
  label: string;
  icon: string;
  permissions: { key: Permission; label: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'permissions.groups.dashboard',
    icon: 'LayoutDashboard',
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: 'permissions.labels.viewDashboard' },
    ],
  },
  {
    label: 'permissions.groups.products',
    icon: 'Boxes',
    permissions: [
      { key: PERMISSIONS.PRODUCTS_VIEW,   label: 'permissions.labels.viewProducts' },
      { key: PERMISSIONS.PRODUCTS_CREATE, label: 'permissions.labels.createProducts' },
      { key: PERMISSIONS.PRODUCTS_EDIT,   label: 'permissions.labels.editProducts' },
      { key: PERMISSIONS.PRODUCTS_DELETE, label: 'permissions.labels.deleteProducts' },
    ],
  },
  {
    label: 'permissions.groups.categories',
    icon: 'Tag',
    permissions: [
      { key: PERMISSIONS.CATEGORIES_VIEW,   label: 'permissions.labels.viewCategories' },
      { key: PERMISSIONS.CATEGORIES_CREATE, label: 'permissions.labels.createCategories' },
      { key: PERMISSIONS.CATEGORIES_EDIT,   label: 'permissions.labels.editCategories' },
      { key: PERMISSIONS.CATEGORIES_DELETE, label: 'permissions.labels.deleteCategories' },
    ],
  },
  {
    label: 'permissions.groups.inventory',
    icon: 'Package',
    permissions: [
      { key: PERMISSIONS.INVENTORY_VIEW,   label: 'permissions.labels.viewInventory' },
      { key: PERMISSIONS.INVENTORY_CREATE, label: 'permissions.labels.createInventory' },
      { key: PERMISSIONS.INVENTORY_EDIT,   label: 'permissions.labels.editInventory' },
      { key: PERMISSIONS.INVENTORY_DELETE, label: 'permissions.labels.deleteInventory' },
      { key: PERMISSIONS.LOTS_VIEW,        label: 'permissions.labels.viewLots' },
      { key: PERMISSIONS.LOTS_CREATE,      label: 'permissions.labels.createLots' },
      { key: PERMISSIONS.LOTS_EDIT,        label: 'permissions.labels.editLots' },
      { key: PERMISSIONS.LOTS_DELETE,      label: 'permissions.labels.deleteLots' },
      { key: PERMISSIONS.SERIALS_VIEW,     label: 'permissions.labels.viewSerials' },
      { key: PERMISSIONS.SERIALS_CREATE,   label: 'permissions.labels.createSerials' },
      { key: PERMISSIONS.SERIALS_EDIT,     label: 'permissions.labels.editSerials' },
      { key: PERMISSIONS.SERIALS_DELETE,   label: 'permissions.labels.deleteSerials' },
    ],
  },
  {
    label: 'permissions.groups.locations',
    icon: 'MapPin',
    permissions: [
      { key: PERMISSIONS.LOCATIONS_VIEW,   label: 'permissions.labels.viewLocations' },
      { key: PERMISSIONS.LOCATIONS_CREATE, label: 'permissions.labels.createLocations' },
      { key: PERMISSIONS.LOCATIONS_EDIT,   label: 'permissions.labels.editLocations' },
      { key: PERMISSIONS.LOCATIONS_DELETE, label: 'permissions.labels.deleteLocations' },
    ],
  },
  {
    label: 'permissions.groups.movements',
    icon: 'Move',
    permissions: [
      { key: PERMISSIONS.MOVEMENTS_VIEW,    label: 'permissions.labels.viewMovements' },
      { key: PERMISSIONS.MOVEMENTS_CREATE,  label: 'permissions.labels.createMovements' },
      { key: PERMISSIONS.MOVEMENTS_EDIT,    label: 'permissions.labels.editMovements' },
      { key: PERMISSIONS.MOVEMENTS_DELETE,  label: 'permissions.labels.deleteMovements' },
      { key: PERMISSIONS.MOVEMENTS_APPROVE, label: 'permissions.labels.approveMovements' },
      { key: PERMISSIONS.MOVEMENTS_CANCEL,  label: 'permissions.labels.cancelMovements' },
    ],
  },
  {
    label: 'permissions.groups.quality',
    icon: 'CheckCircle',
    permissions: [
      { key: PERMISSIONS.QUALITY_VIEW,    label: 'permissions.labels.viewQuality' },
      { key: PERMISSIONS.QUALITY_CREATE,  label: 'permissions.labels.createQuality' },
      { key: PERMISSIONS.QUALITY_EDIT,    label: 'permissions.labels.editQuality' },
      { key: PERMISSIONS.QUALITY_DELETE,  label: 'permissions.labels.deleteQuality' },
      { key: PERMISSIONS.QUALITY_APPROVE, label: 'permissions.labels.approveQuality' },
      { key: PERMISSIONS.QUARANTINE_MANAGE, label: 'permissions.labels.manageQuarantine' },
    ],
  },
  {
    label: 'permissions.groups.alerts',
    icon: 'Bell',
    permissions: [
      { key: PERMISSIONS.ALERTS_VIEW,   label: 'permissions.labels.viewAlerts' },
      { key: PERMISSIONS.ALERTS_MANAGE, label: 'permissions.labels.manageAlerts' },
      { key: PERMISSIONS.ALERTS_DELETE, label: 'permissions.labels.deleteAlerts' },
    ],
  },
  {
    label: 'permissions.groups.userManagement',
    icon: 'Users',
    permissions: [
      { key: PERMISSIONS.USERS_VIEW,   label: 'permissions.labels.viewUsers' },
      { key: PERMISSIONS.USERS_CREATE, label: 'permissions.labels.createUsers' },
      { key: PERMISSIONS.USERS_EDIT,   label: 'permissions.labels.editUsers' },
      { key: PERMISSIONS.USERS_DELETE, label: 'permissions.labels.deleteUsers' },
      { key: PERMISSIONS.PERMISSIONS_VIEW,   label: 'permissions.labels.viewPermissions' },
      { key: PERMISSIONS.PERMISSIONS_MANAGE, label: 'permissions.labels.managePermissions' },
    ],
  },
  {
    label: 'permissions.groups.auditSettings',
    icon: 'Shield',
    permissions: [
      { key: PERMISSIONS.AUDIT_VIEW,      label: 'permissions.labels.viewAudit' },
      { key: PERMISSIONS.SETTINGS_VIEW,   label: 'permissions.labels.viewSettings' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'permissions.labels.manageSettings' },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getDefaultPermissions(role: string): Permission[] {
  const normalised = role.toUpperCase().replace(/^ROLE_/, '') as RoleName;
  return ROLE_PERMISSIONS[normalised] ?? ROLE_PERMISSIONS.USER;
}

export const ROLE_META: Record<RoleName, { label: string; color: string; bg: string; description: string }> = {
  ADMIN: {
    label: 'roles.admin.label',
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'roles.admin.description',
  },
  MANAGER: {
    label: 'roles.manager.label',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'roles.manager.description',
  },
  WAREHOUSE_MANAGER: {
    label: 'roles.warehouseManager.label',
    color: 'text-cyan-700 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    description: 'roles.warehouseManager.description',
  },
  QUALITY_MANAGER: {
    label: 'roles.qualityManager.label',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    description: 'roles.qualityManager.description',
  },
  SUPERVISOR: {
    label: 'roles.supervisor.label',
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    description: 'roles.supervisor.description',
  },
  OPERATOR: {
    label: 'roles.operator.label',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'roles.operator.description',
  },
  PROCUREMENT: {
    label: 'roles.procurement.label',
    color: 'text-pink-700 dark:text-pink-400',
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    description: 'roles.procurement.description',
  },
  AUDITOR: {
    label: 'roles.auditor.label',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    description: 'roles.auditor.description',
  },
  USER: {
    label: 'roles.user.label',
    color: 'text-neutral-700 dark:text-neutral-400',
    bg: 'bg-neutral-100 dark:bg-neutral-700',
    description: 'roles.user.description',
  },
};
