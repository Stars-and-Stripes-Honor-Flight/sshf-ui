/** Default OpenAPI URL for the deployed dev API. */
export const DEV_OPENAPI_URL =
  'https://sshf-api-330507742215.us-central1.run.app/openapi.json';

/** OpenAPI URL for a locally running API. */
export const LOCAL_OPENAPI_URL = 'http://localhost:8080/openapi.json';

/**
 * Resolve which OpenAPI URL to fetch for schema sync.
 *
 * Priority: SYNC_SCHEMAS_URL env > --local flag > dev default.
 *
 * @param {string[]} argv - CLI args (typically process.argv.slice(2))
 * @returns {string}
 */
export function resolveOpenApiUrl(argv = []) {
  if (process.env.SYNC_SCHEMAS_URL) {
    return process.env.SYNC_SCHEMAS_URL;
  }

  if (argv.includes('--local')) {
    return LOCAL_OPENAPI_URL;
  }

  return DEV_OPENAPI_URL;
}
