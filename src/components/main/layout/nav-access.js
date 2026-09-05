import { isAdhocQueryEnabled } from '@/lib/adhoc-query';

const ADHOC_QUERY_NAV_KEY = 'tools:query';

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

function filterAdhocQueryNode(node, adhocQueryEnabled) {
  if (!adhocQueryEnabled && node.key === ADHOC_QUERY_NAV_KEY) {
    return null;
  }

  if (!Array.isArray(node.items)) {
    return node;
  }

  const items = node.items
    .map((child) => filterAdhocQueryNode(child, adhocQueryEnabled))
    .filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return { ...node, items };
}

export function getNavItemsForAdhocQuery(navItems, adhocQueryEnabled) {
  return (navItems ?? [])
    .map((node) => filterAdhocQueryNode(node, adhocQueryEnabled))
    .filter(Boolean);
}

export function getVisibleNavItems(navItems, hasFullAccess) {
  return getNavItemsForAdhocQuery(
    getNavItemsForAccess(navItems, hasFullAccess),
    isAdhocQueryEnabled()
  );
}
