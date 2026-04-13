import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  ROLE_PERMISSIONS,
  ROLES,
  type Permission,
  type RoleName,
} from '@/config/permissions';

export function usePermissions() {
  const { user } = useAppSelector((state) => state.auth);

  const roles: RoleName[] = useMemo(() => {
    if (!user) return [];
    const raw: string[] = user.roles ?? (user.role ? [user.role] : []);
    return raw.map(r => r.toUpperCase().replace(/^ROLE_/, '') as RoleName);
  }, [user]);

  /**
   * Permissions come directly from the backend (dynamic).
   * The backend resolves the actual permissions for every role the user has,
   * including any custom roles created by the admin.
   * We fall back to the hardcoded ROLE_PERMISSIONS map only if the backend
   * hasn't sent permissions yet (e.g. very old cached user object).
   */
  const permissions: Set<Permission> = useMemo(() => {
    const set = new Set<Permission>();

    if (user?.permissions && user.permissions.length > 0) {
      // ✅ Use real backend permissions (dynamic — works for custom roles too)
      for (const p of user.permissions) set.add(p as Permission);
    } else {
      // Fallback: derive from hardcoded role→permission map
      for (const role of roles) {
        const perms = ROLE_PERMISSIONS[role] ?? [];
        for (const p of perms) set.add(p);
      }
    }

    return set;
  }, [user?.permissions, roles]);

  const hasPermission = (permission: Permission): boolean =>
    permissions.has(permission);

  const hasAnyPermission = (...perms: Permission[]): boolean =>
    perms.some(p => permissions.has(p));

  const hasAllPermissions = (...perms: Permission[]): boolean =>
    perms.every(p => permissions.has(p));

  const hasRole = (role: RoleName): boolean => roles.includes(role);

  const isAdmin    = roles.includes(ROLES.ADMIN);
  const isManager  = isAdmin || roles.includes(ROLES.MANAGER);
  const isAuditor  = isAdmin || roles.includes(ROLES.AUDITOR);
  const isWarehouseManager = isAdmin || roles.includes(ROLES.WAREHOUSE_MANAGER);
  const isSupervisor = isAdmin || isManager || roles.includes(ROLES.SUPERVISOR);

  return {
    roles,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isManager,
    isAuditor,
    isWarehouseManager,
    isSupervisor,
    can: hasPermission,
  };
}
