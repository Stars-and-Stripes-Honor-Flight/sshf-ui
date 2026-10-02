import { isAdhocQueryEnabled } from '@/lib/adhoc-query';
import { NAV_LEAF_PERMISSION } from '@/lib/auth/permissions';

const ADHOC_QUERY_NAV_KEY = 'tools:query';

function filterNavNode(node, can) {
  if (Array.isArray(node.items)) {
    const items = node.items.map((child) => filterNavNode(child, can)).filter(Boolean);
    if (items.length === 0) {
      return null;
    }
    return { ...node, items };
  }

  if (node.key === 'settings') {
    return node;
  }

  const permission = NAV_LEAF_PERMISSION[node.key];
  if (!permission || !can(permission)) {
    return null;
  }

  return node;
}

/**
 * Filter main nav items by API permissions.
 * Settings stays visible so a signed-in user can still log out.
 */
export function getNavItemsForAccess(navItems, can) {
  const allow = typeof can === 'function' ? can : () => false;
  return (navItems ?? []).map((node) => filterNavNode(node, allow)).filter(Boolean);
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

export function getVisibleNavItems(navItems, can) {
  return getNavItemsForAdhocQuery(
    getNavItemsForAccess(navItems, can),
    isAdhocQueryEnabled()
  );
}
