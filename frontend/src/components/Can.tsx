// frontend/src/components/Can.tsx
// Usage:
//   <Can permission="products:create"><button>Add</button></Can>
//   <Can permission="users:delete" fallback={<span>No access</span>}>...</Can>
//   <CanAny permissions={['movements:approve', 'movements:edit']}>...</CanAny>

import { type ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { type Permission } from '@/config/permissions';

interface CanProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the user has the required permission. */
export const Can = ({ permission, fallback = null, children }: CanProps) => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};

interface CanAnyProps {
  permissions: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children when the user has AT LEAST ONE of the listed permissions. */
export const CanAny = ({ permissions, fallback = null, children }: CanAnyProps) => {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(...permissions) ? <>{children}</> : <>{fallback}</>;
};

interface CanAllProps {
  permissions: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the user has ALL of the listed permissions. */
export const CanAll = ({ permissions, fallback = null, children }: CanAllProps) => {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(...permissions) ? <>{children}</> : <>{fallback}</>;
};
