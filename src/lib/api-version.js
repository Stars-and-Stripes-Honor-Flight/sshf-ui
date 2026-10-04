import { api } from '@/lib/api';

let apiVersionPromise;

/**
 * One public OpenAPI read for the signed-in shell.
 * Later calls reuse the same promise, including after a failure.
 */
export function loadApiVersion() {
  if (!apiVersionPromise) {
    apiVersionPromise = Promise.resolve()
      .then(() => api.getPublicApiVersion())
      .then((version) => (typeof version === 'string' && version.trim() ? version.trim() : null))
      .catch(() => null);
  }

  return apiVersionPromise;
}

export function resetApiVersionCache() {
  apiVersionPromise = undefined;
}
