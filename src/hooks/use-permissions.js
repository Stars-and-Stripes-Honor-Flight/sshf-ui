import { useUser } from './use-user';

export function usePermissions() {
  const { user } = useUser();

  const isInGroup = (groupEmail) => {
    return user?.roles?.some(role => role.email === groupEmail) ?? false;
  };

  return {
    isInGroup,
    roles: user?.roles ?? []
  };
}

export function useHasFullAccess() {
  const { isInGroup } = usePermissions();
  const fullAccessGroup = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
  return isInGroup(fullAccessGroup);
}
