import { layoutConfig } from '../config';
import { getNavItemsForAccess, getVisibleNavItems } from '../nav-access';
import { PERMISSIONS } from '@/lib/auth/permissions';

function findNavItem(nodes, key) {
  for (const node of nodes ?? []) {
    if (node.key === key) {
      return node;
    }
    const nested = findNavItem(node.items, key);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

function canAll() {
  return true;
}

function canOnly(...allowed) {
  return (permission) => allowed.includes(permission);
}

describe('getNavItemsForAccess', () => {
  test('returns all nav items when every permission is granted', () => {
    expect(getNavItemsForAccess(layoutConfig.navItems, canAll)).toEqual(layoutConfig.navItems);
  });

  test('returns only Settings when the user has no permissions', () => {
    const filtered = getNavItemsForAccess(layoutConfig.navItems, canOnly());

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('general');
    expect(filtered[0].items).toHaveLength(1);
    expect(filtered[0].items[0].key).toBe('settings');
    expect(filtered[0].items[0].title).toBe('Settings');
  });

  test('shows read navigation and hides write, flight management, and review for READ', () => {
    const filtered = getNavItemsForAccess(
      layoutConfig.navItems,
      canOnly(PERMISSIONS.RECORDS_READ, PERMISSIONS.EXPORTS_READ)
    );

    expect(findNavItem(filtered, 'search')).toBeDefined();
    expect(findNavItem(filtered, 'veteran:details')).toBeDefined();
    expect(findNavItem(filtered, 'flights:details')).toBeDefined();
    expect(findNavItem(filtered, 'exports:flight')).toBeDefined();
    expect(findNavItem(filtered, 'waitlist:list')).toBeDefined();
    expect(findNavItem(filtered, 'veteran:create')).toBeUndefined();
    expect(findNavItem(filtered, 'guardian:create')).toBeUndefined();
    expect(findNavItem(filtered, 'flights:create')).toBeUndefined();
    expect(findNavItem(filtered, 'review:applications')).toBeUndefined();
    expect(findNavItem(filtered, 'settings')).toBeDefined();
  });

  test('shows create-record links for WRITE and keeps flight create hidden', () => {
    const filtered = getNavItemsForAccess(
      layoutConfig.navItems,
      canOnly(PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_WRITE, PERMISSIONS.EXPORTS_READ)
    );

    expect(findNavItem(filtered, 'veteran:create')).toBeDefined();
    expect(findNavItem(filtered, 'guardian:create')).toBeDefined();
    expect(findNavItem(filtered, 'flights:create')).toBeUndefined();
  });

  test('shows the review queue for REVIEW without logistics permissions', () => {
    const filtered = getNavItemsForAccess(
      layoutConfig.navItems,
      canOnly(PERMISSIONS.APPLICATIONS_REVIEW, PERMISSIONS.APPLICATIONS_ACCEPT)
    );

    expect(findNavItem(filtered, 'review:applications')).toBeDefined();
    expect(findNavItem(filtered, 'search')).toBeUndefined();
    expect(findNavItem(filtered, 'flights:create')).toBeUndefined();
    expect(findNavItem(filtered, 'settings')).toBeDefined();
  });
});

describe('getVisibleNavItems', () => {
  const originalFlag = process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY;

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY;
    } else {
      process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = originalFlag;
    }
  });

  test('keeps Ad-hoc Query when the user can read records and the flag is on', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'true';
    const items = getVisibleNavItems(layoutConfig.navItems, canOnly(PERMISSIONS.RECORDS_READ));

    expect(findNavItem(items, 'tools:query')).toBeDefined();
    expect(findNavItem(items, 'tools')?.title).toBe('Tools');
  });

  test('hides Ad-hoc Query and the empty Tools group when the flag is off', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'false';
    const items = getVisibleNavItems(layoutConfig.navItems, canAll);

    expect(findNavItem(items, 'tools:query')).toBeUndefined();
    expect(findNavItem(items, 'tools')).toBeUndefined();
    expect(findNavItem(items, 'settings')).toBeDefined();
  });

  test('hides Ad-hoc Query when the user cannot read records even if the flag is on', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'true';
    const items = getVisibleNavItems(
      layoutConfig.navItems,
      canOnly(PERMISSIONS.APPLICATIONS_REVIEW)
    );

    expect(findNavItem(items, 'tools:query')).toBeUndefined();
  });
});
