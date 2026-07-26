import { layoutConfig } from '../config';
import { getNavItemsForAccess } from '../nav-access';

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
