import { useUser } from './use-user';
import { hasFullAccess, hasPermission } from '@/lib/auth/permissions';

export function usePermissions() {
  const { user } = useUser();
  const permissions = user?.permissions ?? [];

  const can = (permission) => hasPermission(permissions, permission);

  return {
    can,
    permissions,
    roles: user?.roles ?? [],
    hasAccess: Boolean(user?.hasAccess) || permissions.length > 0,
  };
}

/** True when the user holds the FULL-only permissions (delete, document admin, flight management). */
export function useHasFullAccess() {
  const { permissions } = usePermissions();
  return hasFullAccess(permissions);
}

export function useMembershipProbeFailed() {
  const { user } = useUser();
  return Boolean(user?.membershipProbeFailed);
}
