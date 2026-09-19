/** Bar surface for the edit-form sticky name header. */
export function stickyHeaderBarSurfaceSx(showEnvironmentBanner) {
  if (!showEnvironmentBanner) {
    return {
      backgroundColor: 'background.paper',
    };
  }

  // MUI CSS variables: theme.palette.background.paper is a var(...) string; do not pass it to alpha().
  return {
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-background-paper) 42%, transparent)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };
}
