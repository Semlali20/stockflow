// frontend/src/pages/settings/MobilePermissionsTab.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  Smartphone, Save, RotateCcw, Check,
  LayoutDashboard, Package, Layers, ArrowLeftRight,
  ShoppingCart, Receipt, Bell, User, ChevronRight,
  Info, Eye, Plus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'react-hot-toast';
import { ROLES, type RoleName } from '@/config/permissions';

// ─── Mobile Permission Definitions ───────────────────────────────────────────

export const MOBILE_PERMISSIONS = {
  DASHBOARD_VIEW:       'mobile:dashboard:view',
  ITEMS_VIEW:           'mobile:items:view',
  ITEMS_CREATE:         'mobile:items:create',
  INVENTORY_VIEW:       'mobile:inventory:view',
  MOVEMENTS_VIEW:       'mobile:movements:view',
  MOVEMENTS_CREATE:     'mobile:movements:create',
  PURCHASES_VIEW:       'mobile:purchases:view',
  PURCHASES_CREATE:     'mobile:purchases:create',
  SALES_VIEW:           'mobile:sales:view',
  SALES_CREATE_QUOTE:   'mobile:sales:create_quote',
  ALERTS_VIEW:          'mobile:alerts:view',
  PROFILE_VIEW:         'mobile:profile:view',
} as const;

export type MobilePermission = typeof MOBILE_PERMISSIONS[keyof typeof MOBILE_PERMISSIONS];

// ─── Feature groups for UI ────────────────────────────────────────────────────

interface MobileFeature {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  permissions: { key: MobilePermission; label: string; icon: React.ReactNode }[];
}

const MOBILE_FEATURES: MobileFeature[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    permissions: [
      { key: MOBILE_PERMISSIONS.DASHBOARD_VIEW, label: 'View Dashboard', icon: <Eye className="w-3 h-3" /> },
    ],
  },
  {
    id: 'items',
    label: 'Items',
    icon: <Package className="w-4 h-4" />,
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20',
    permissions: [
      { key: MOBILE_PERMISSIONS.ITEMS_VIEW,   label: 'View Items',   icon: <Eye className="w-3 h-3" /> },
      { key: MOBILE_PERMISSIONS.ITEMS_CREATE, label: 'Create Items', icon: <Plus className="w-3 h-3" /> },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <Layers className="w-4 h-4" />,
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    permissions: [
      { key: MOBILE_PERMISSIONS.INVENTORY_VIEW, label: 'View Stock Levels', icon: <Eye className="w-3 h-3" /> },
    ],
  },
  {
    id: 'movements',
    label: 'Movements',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    permissions: [
      { key: MOBILE_PERMISSIONS.MOVEMENTS_VIEW,   label: 'View Movements',   icon: <Eye className="w-3 h-3" /> },
      { key: MOBILE_PERMISSIONS.MOVEMENTS_CREATE, label: 'Create Movements', icon: <Plus className="w-3 h-3" /> },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    permissions: [
      { key: MOBILE_PERMISSIONS.PURCHASES_VIEW,   label: 'View Suppliers & Orders', icon: <Eye className="w-3 h-3" /> },
      { key: MOBILE_PERMISSIONS.PURCHASES_CREATE, label: 'Create Purchase Orders',  icon: <Plus className="w-3 h-3" /> },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: <Receipt className="w-4 h-4" />,
    color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
    permissions: [
      { key: MOBILE_PERMISSIONS.SALES_VIEW,         label: 'View Customers, Quotes & Deliveries', icon: <Eye className="w-3 h-3" /> },
      { key: MOBILE_PERMISSIONS.SALES_CREATE_QUOTE, label: 'Create Quotes',                       icon: <Plus className="w-3 h-3" /> },
    ],
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: <Bell className="w-4 h-4" />,
    color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    permissions: [
      { key: MOBILE_PERMISSIONS.ALERTS_VIEW, label: 'View Alerts', icon: <Eye className="w-3 h-3" /> },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="w-4 h-4" />,
    color: 'text-neutral-500 bg-neutral-50 dark:bg-neutral-800',
    permissions: [
      { key: MOBILE_PERMISSIONS.PROFILE_VIEW, label: 'View & Edit Profile', icon: <Eye className="w-3 h-3" /> },
    ],
  },
];

// ─── Default mobile permissions per role ──────────────────────────────────────

const ALL: MobilePermission[] = Object.values(MOBILE_PERMISSIONS);

const DEFAULT_MOBILE_ROLE_PERMISSIONS: Record<RoleName, MobilePermission[]> = {
  ADMIN: ALL,
  MANAGER: ALL,
  WAREHOUSE_MANAGER: [
    MOBILE_PERMISSIONS.DASHBOARD_VIEW,
    MOBILE_PERMISSIONS.ITEMS_VIEW,
    MOBILE_PERMISSIONS.INVENTORY_VIEW,
    MOBILE_PERMISSIONS.MOVEMENTS_VIEW,
    MOBILE_PERMISSIONS.MOVEMENTS_CREATE,
    MOBILE_PERMISSIONS.ALERTS_VIEW,
    MOBILE_PERMISSIONS.PROFILE_VIEW,
  ],
  SUPERVISOR: [
    MOBILE_PERMISSIONS.DASHBOARD_VIEW,
    MOBILE_PERMISSIONS.ITEMS_VIEW,
    MOBILE_PERMISSIONS.INVENTORY_VIEW,
    MOBILE_PERMISSIONS.MOVEMENTS_VIEW,
    MOBILE_PERMISSIONS.MOVEMENTS_CREATE,
    MOBILE_PERMISSIONS.ALERTS_VIEW,
    MOBILE_PERMISSIONS.PROFILE_VIEW,
  ],
  OPERATOR: [
    MOBILE_PERMISSIONS.DASHBOARD_VIEW,
    MOBILE_PERMISSIONS.ITEMS_VIEW,
    MOBILE_PERMISSIONS.INVENTORY_VIEW,
    MOBILE_PERMISSIONS.MOVEMENTS_VIEW,
    MOBILE_PERMISSIONS.MOVEMENTS_CREATE,
    MOBILE_PERMISSIONS.ALERTS_VIEW,
    MOBILE_PERMISSIONS.PROFILE_VIEW,
  ],
  PROCUREMENT: [
    MOBILE_PERMISSIONS.DASHBOARD_VIEW,
    MOBILE_PERMISSIONS.ITEMS_VIEW,
    MOBILE_PERMISSIONS.ITEMS_CREATE,
    MOBILE_PERMISSIONS.INVENTORY_VIEW,
    MOBILE_PERMISSIONS.PURCHASES_VIEW,
    MOBILE_PERMISSIONS.PURCHASES_CREATE,
    MOBILE_PERMISSIONS.ALERTS_VIEW,
    MOBILE_PERMISSIONS.PROFILE_VIEW,
  ],
  AUDITOR: [
    MOBILE_PERMISSIONS.DASHBOARD_VIEW,
    MOBILE_PERMISSIONS.ITEMS_VIEW,
    MOBILE_PERMISSIONS.INVENTORY_VIEW,
    MOBILE_PERMISSIONS.MOVEMENTS_VIEW,
    MOBILE_PERMISSIONS.PURCHASES_VIEW,
    MOBILE_PERMISSIONS.SALES_VIEW,
    MOBILE_PERMISSIONS.ALERTS_VIEW,
    MOBILE_PERMISSIONS.PROFILE_VIEW,
  ],
  USER: [
    MOBILE_PERMISSIONS.DASHBOARD_VIEW,
    MOBILE_PERMISSIONS.ITEMS_VIEW,
    MOBILE_PERMISSIONS.PROFILE_VIEW,
  ],
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'stockflow_mobile_permissions';

function loadFromStorage(): Record<string, MobilePermission[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

function saveToStorage(data: Record<string, MobilePermission[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Role color badges ────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  ADMIN:            'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  MANAGER:          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  WAREHOUSE_MANAGER:'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  SUPERVISOR:       'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  OPERATOR:         'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  PROCUREMENT:      'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  AUDITOR:          'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  USER:             'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
};

const getRoleColor = (role: string) =>
  ROLE_COLORS[role.toUpperCase()] ??
  'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300';

const formatRoleName = (role: string) =>
  role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

// ─── Main Component ───────────────────────────────────────────────────────────

export const MobilePermissionsTab: React.FC = () => {
  const roles = Object.values(ROLES) as RoleName[];
  const [selectedRole, setSelectedRole] = useState<RoleName>('ADMIN');
  const [allRolePerms, setAllRolePerms] = useState<Record<string, MobilePermission[]>>({});
  const [dirty, setDirty] = useState(false);

  // Load saved permissions on mount
  useEffect(() => {
    const stored = loadFromStorage();
    const merged: Record<string, MobilePermission[]> = {};
    for (const role of roles) {
      merged[role] = stored[role] ?? DEFAULT_MOBILE_ROLE_PERMISSIONS[role] ?? [];
    }
    setAllRolePerms(merged);
  }, []);

  const currentPerms = allRolePerms[selectedRole] ?? [];

  const hasPermission = (perm: MobilePermission) => currentPerms.includes(perm);

  const togglePermission = (perm: MobilePermission) => {
    setAllRolePerms(prev => {
      const current = prev[selectedRole] ?? [];
      const next = current.includes(perm)
        ? current.filter(p => p !== perm)
        : [...current, perm];
      return { ...prev, [selectedRole]: next };
    });
    setDirty(true);
  };

  const toggleAll = (feature: MobileFeature) => {
    const featurePerms = feature.permissions.map(p => p.key);
    const allEnabled = featurePerms.every(p => currentPerms.includes(p));
    setAllRolePerms(prev => {
      const current = prev[selectedRole] ?? [];
      const next = allEnabled
        ? current.filter(p => !featurePerms.includes(p))
        : [...new Set([...current, ...featurePerms])];
      return { ...prev, [selectedRole]: next };
    });
    setDirty(true);
  };

  const resetToDefaults = () => {
    setAllRolePerms(prev => ({
      ...prev,
      [selectedRole]: DEFAULT_MOBILE_ROLE_PERMISSIONS[selectedRole] ?? [],
    }));
    setDirty(true);
  };

  const saveAll = useCallback(() => {
    saveToStorage(allRolePerms);
    setDirty(false);
    toast.success(`Mobile permissions saved for all roles`);
  }, [allRolePerms]);

  const enabledCount = currentPerms.length;
  const totalCount = ALL.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Mobile App Permissions
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Define what each role can access in the StockFlow mobile app
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={saveAll}
            disabled={!dirty}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
              dirty
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            )}
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          Mobile permissions are <strong>independent from web permissions</strong>. A user with full web access
          can be restricted to only specific features on the mobile app. These settings are stored locally
          and applied when the mobile app checks user permissions.
        </p>
      </div>

      <div className="flex gap-5">
        {/* Role selector — left panel */}
        <div className="w-48 shrink-0 space-y-1">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1 mb-2">
            Roles
          </p>
          {roles.map(role => {
            const perms = allRolePerms[role] ?? [];
            const pct = Math.round((perms.length / totalCount) * 100);
            const isSelected = selectedRole === role;

            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 border',
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                    : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-xs font-semibold px-1.5 py-0.5 rounded-md border',
                    getRoleColor(role)
                  )}>
                    {formatRoleName(role)}
                  </span>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                {/* Permission progress bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-neutral-400">{perms.length}/{totalCount}</span>
                    <span className="text-[10px] font-medium text-neutral-500">{pct}%</span>
                  </div>
                  <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Permission matrix — right panel */}
        <div className="flex-1 min-w-0">
          {/* Role header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2.5 py-1 rounded-lg text-sm font-bold border',
                getRoleColor(selectedRole)
              )}>
                {formatRoleName(selectedRole)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {enabledCount} of {totalCount} mobile permissions enabled
              </span>
            </div>
            {/* Mobile preview badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Mobile Only</span>
            </div>
          </div>

          {/* Feature permission cards */}
          <div className="space-y-3">
            {MOBILE_FEATURES.map(feature => {
              const featurePerms = feature.permissions.map(p => p.key);
              const enabledInFeature = featurePerms.filter(p => currentPerms.includes(p)).length;
              const allFeatureEnabled = enabledInFeature === featurePerms.length;
              const someEnabled = enabledInFeature > 0 && !allFeatureEnabled;

              return (
                <div
                  key={feature.id}
                  className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
                >
                  {/* Feature header */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => toggleAll(feature)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', feature.color)}>
                        {feature.icon}
                      </div>
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {feature.label}
                      </span>
                      {enabledInFeature > 0 && (
                        <span className="text-xs text-neutral-400">
                          ({enabledInFeature}/{featurePerms.length})
                        </span>
                      )}
                    </div>
                    {/* Toggle all button */}
                    <div className={cn(
                      'w-5 h-5 rounded flex items-center justify-center border transition-colors',
                      allFeatureEnabled
                        ? 'bg-indigo-500 border-indigo-500'
                        : someEnabled
                          ? 'bg-indigo-200 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700'
                          : 'border-neutral-300 dark:border-neutral-600'
                    )}>
                      {(allFeatureEnabled || someEnabled) && (
                        <Check className={cn(
                          'w-3 h-3',
                          allFeatureEnabled ? 'text-white' : 'text-indigo-500'
                        )} />
                      )}
                    </div>
                  </div>

                  {/* Individual permissions */}
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {feature.permissions.map(perm => {
                      const enabled = hasPermission(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                        >
                          {/* Custom checkbox */}
                          <div
                            onClick={() => togglePermission(perm.key)}
                            className={cn(
                              'w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0',
                              enabled
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-neutral-300 dark:border-neutral-600 hover:border-indigo-400'
                            )}
                          >
                            {enabled && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>

                          <div className="flex items-center gap-1.5 flex-1">
                            <span className={cn('text-neutral-400', enabled && 'text-indigo-400')}>
                              {perm.icon}
                            </span>
                            <span className={cn(
                              'text-sm',
                              enabled
                                ? 'text-neutral-800 dark:text-neutral-200 font-medium'
                                : 'text-neutral-500 dark:text-neutral-400'
                            )}>
                              {perm.label}
                            </span>
                          </div>

                          <code className="text-[10px] text-neutral-300 dark:text-neutral-600 font-mono">
                            {perm.key}
                          </code>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile preview summary */}
          <div className="mt-5 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Mobile Navigation Preview for {formatRoleName(selectedRole)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOBILE_FEATURES.filter(f =>
                f.permissions.some(p => currentPerms.includes(p.key))
              ).map(feature => (
                <div
                  key={feature.id}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                    feature.color
                  )}
                >
                  {feature.icon}
                  {feature.label}
                </div>
              ))}
              {MOBILE_FEATURES.filter(f =>
                f.permissions.some(p => currentPerms.includes(p.key))
              ).length === 0 && (
                <p className="text-xs text-neutral-400 italic">
                  No features enabled — this role will see an empty mobile app.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePermissionsTab;
