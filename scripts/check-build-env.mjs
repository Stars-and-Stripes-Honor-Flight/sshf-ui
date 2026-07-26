import { pathToFileURL } from 'node:url';

/**
 * Client build variables that must be present when building a deployable
 * bundle. NEXT_PUBLIC_* values are inlined at `next build` time, so a missing
 * value silently ships a broken (or wrong-environment) bundle. CI runs this
 * script before deploying; it fails the build if anything is unset.
 */
export const REQUIRED_BUILD_ENV_VARS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_ROLE_FULL_ACCESS',
  'NEXT_PUBLIC_ENVIRONMENT',
];

/**
 * @param {Record<string, string | undefined>} env
 * @returns {string[]} names of required variables that are unset or blank
 */
export function findMissingBuildEnvVars(env = process.env) {
  return REQUIRED_BUILD_ENV_VARS.filter((name) => !(env[name] || '').trim());
}

const isRunDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunDirectly) {
  const missing = findMissingBuildEnvVars();
  if (missing.length > 0) {
    console.error(`Missing required build environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('All required build environment variables are set.');
}
