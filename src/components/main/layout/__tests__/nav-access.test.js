import { layoutConfig } from '../config';
import { getNavItemsForAccess, getVisibleNavItems } from '../nav-access';

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

describe('getNavItemsForAccess', () => {
  test('returns all nav items when the user has full access', () => {
    expect(getNavItemsForAccess(layoutConfig.navItems, true)).toEqual(layoutConfig.navItems);
  });

  test('returns only the Settings item when the user lacks full access', () => {
    const filtered = getNavItemsForAccess(layoutConfig.navItems, false);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('general');
    expect(filtered[0].items).toHaveLength(1);
    expect(filtered[0].items[0].key).toBe('settings');
    expect(filtered[0].items[0].title).toBe('Settings');
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

  test('keeps Ad-hoc Query when the user has full access and the flag is on', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'true';
    const items = getVisibleNavItems(layoutConfig.navItems, true);

    expect(findNavItem(items, 'tools:query')).toBeDefined();
    expect(findNavItem(items, 'tools')?.title).toBe('Tools');
  });

  test('hides Ad-hoc Query and the empty Tools group when the flag is off', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'false';
    const items = getVisibleNavItems(layoutConfig.navItems, true);

    expect(findNavItem(items, 'tools:query')).toBeUndefined();
    expect(findNavItem(items, 'tools')).toBeUndefined();
    expect(findNavItem(items, 'settings')).toBeDefined();
  });

  test('returns only Settings when the user lacks full access even if the flag is on', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'true';
    const filtered = getVisibleNavItems(layoutConfig.navItems, false);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('general');
    expect(filtered[0].items).toHaveLength(1);
    expect(filtered[0].items[0].key).toBe('settings');
  });
});
