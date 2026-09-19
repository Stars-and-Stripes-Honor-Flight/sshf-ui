import { alpha } from '@mui/material/styles';

/** Bar surface for the edit-form sticky name header. */
export function stickyHeaderBarSurfaceSx(showEnvironmentBanner) {
  if (!showEnvironmentBanner) {
    return {
      backgroundColor: 'background.paper',
    };
  }

  return {
    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.72),
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };
}
