import { createTheme } from '@mui/material/styles';

import { stickyHeaderBarSurfaceSx } from '../sticky-header-surface';

describe('stickyHeaderBarSurfaceSx', () => {
  const theme = createTheme();

  test('uses an opaque paper background in production', () => {
    const sx = stickyHeaderBarSurfaceSx(false);
    expect(sx).toEqual({ backgroundColor: 'background.paper' });
    expect(sx.backdropFilter).toBeUndefined();
  });

  test('uses a translucent paper background with blur when the env banner is shown', () => {
    const sx = stickyHeaderBarSurfaceSx(true);
    expect(sx.backdropFilter).toBe('blur(8px)');
    expect(sx.WebkitBackdropFilter).toBe('blur(8px)');
    expect(sx.backgroundColor(theme)).toMatch(/rgba?\(/);
  });
});
