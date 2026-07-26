/**
 * Filter main nav items based on full-access group membership.
 * Unauthorized users only see Settings (logout remains in the user menu).
 */
export function getNavItemsForAccess(navItems, hasFullAccess) {
  if (hasFullAccess) {
    return navItems;
  }

  return (navItems ?? [])
    .map((group) => ({
      ...group,
      items: (group.items ?? []).filter((item) => item.key === 'settings'),
    }))
    .filter((group) => (group.items ?? []).length > 0);
}
