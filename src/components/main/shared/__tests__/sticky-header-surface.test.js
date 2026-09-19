import { stickyHeaderBarSurfaceSx } from '../sticky-header-surface';

describe('stickyHeaderBarSurfaceSx', () => {
  test('uses an opaque paper background in production', () => {
    const sx = stickyHeaderBarSurfaceSx(false);
    expect(sx).toEqual({ backgroundColor: 'background.paper' });
    expect(sx.backdropFilter).toBeUndefined();
  });

  test('uses color-mix translucency (not alpha on theme.palette.background.paper) when the env banner is shown', () => {
    const sx = stickyHeaderBarSurfaceSx(true);
    expect(sx.backdropFilter).toBe('blur(8px)');
    expect(sx.WebkitBackdropFilter).toBe('blur(8px)');
    expect(typeof sx.backgroundColor).toBe('string');
    expect(sx.backgroundColor).toContain('color-mix');
    expect(sx.backgroundColor).toContain('58%');
    expect(sx.backgroundColor).toContain('var(--mui-palette-background-paper)');
    expect(sx.backgroundColor).not.toMatch(/alpha\(/);
  });
});
