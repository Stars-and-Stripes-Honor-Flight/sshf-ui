/**
 * UI version of the build that is running.
 * Set from package.json by next.config.mjs. No 0.0.0 fallback.
 */
export function getUiVersion() {
  return (process.env.NEXT_PUBLIC_SITE_VERSION || '').trim();
}
