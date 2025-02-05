import { useUser } from './use-user';

export function usePermissions() {
  const { user } = useUser();

  const hasRole = (roleName) => {
    return user?.roles?.some(role => role.name === roleName) ?? false;
  };

  const hasAnyRole = (roleNames) => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  const isInGroup = (groupEmail) => {
    return user?.roles?.some(role => role.email === groupEmail) ?? false;
  };


  return {
    hasRole,
    hasAnyRole,
    isInGroup,
    roles: user?.roles ?? []
  };
} 