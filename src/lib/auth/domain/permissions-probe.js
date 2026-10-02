/**
 * Interpret GET /user/permissions for the signed-in user.
 * A 503 (or a failure before any status) is not the same as "no permissions".
 */
export function accessFromPermissionsProbe(result = {}) {
  if (result.error) {
    const status = result.error.status;
    const probeFailed = status === 503 || status === undefined;
    return {
      permissions: [],
      roles: [],
      hasAccess: false,
      evaluatedAt: null,
      expiresAt: null,
      probeFailed: status === 401 || status === 403 ? false : probeFailed,
    };
  }

  const permissions = Array.isArray(result.permissions) ? result.permissions : [];
  const roles = Array.isArray(result.roles) ? result.roles : [];
  const hasAccess = typeof result.hasAccess === 'boolean' ? result.hasAccess : permissions.length > 0;

  return {
    permissions,
    roles,
    hasAccess,
    evaluatedAt: result.evaluatedAt ?? null,
    expiresAt: result.expiresAt ?? null,
    probeFailed: false,
  };
}
