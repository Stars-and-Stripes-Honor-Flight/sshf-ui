/**
 * Permission names match GET /user/permissions (sshf-api Phase 3).
 * The API grants them as a union, with inheritance READ ⊂ WRITE ⊂ FULL.
 * MEDICAL and REVIEW are separate and are not included in FULL.
 *
 * Show/hide decisions use `permissions`, never Workspace group emails.
 */
export const PERMISSIONS = {
  RECORDS_READ: 'records:read',
  EXPORTS_READ: 'exports:read',
  RECORDS_WRITE: 'records:write',
  RECORDS_DELETE: 'records:delete',
  DOCUMENTS_ADMIN: 'documents:admin',
  FLIGHTS_MANAGE: 'flights:manage',
  APPLICATIONS_REVIEW: 'applications:review',
  APPLICATIONS_ACCEPT: 'applications:accept',
  MEDICAL_READ: 'medical:read',
  MEDICAL_WRITE: 'medical:write',
};

/** Permissions FULL holds that WRITE does not. */
export const FULL_ONLY_PERMISSIONS = [
  PERMISSIONS.RECORDS_DELETE,
  PERMISSIONS.DOCUMENTS_ADMIN,
  PERMISSIONS.FLIGHTS_MANAGE,
];

/**
 * Leaf nav keys → permission required to show the item.
 * Settings is always visible and is not listed.
 */
export const NAV_LEAF_PERMISSION = {
  search: PERMISSIONS.RECORDS_READ,
  'search:flights': PERMISSIONS.RECORDS_READ,
  'veteran:details': PERMISSIONS.RECORDS_READ,
  'veteran:create': PERMISSIONS.RECORDS_WRITE,
  'guardian:details': PERMISSIONS.RECORDS_READ,
  'guardian:create': PERMISSIONS.RECORDS_WRITE,
  'activity:list': PERMISSIONS.RECORDS_READ,
  'waitlist:list': PERMISSIONS.RECORDS_READ,
  'review:applications': PERMISSIONS.APPLICATIONS_REVIEW,
  'flights:details': PERMISSIONS.RECORDS_READ,
  'flights:create': PERMISSIONS.FLIGHTS_MANAGE,
  'exports:flight': PERMISSIONS.EXPORTS_READ,
  'exports:callcenter': PERMISSIONS.EXPORTS_READ,
  'exports:tourlead': PERMISSIONS.EXPORTS_READ,
  'tools:query': PERMISSIONS.RECORDS_READ,
};

const ROUTE_PERMISSIONS = [
  { prefix: '/veterans/create', permission: PERMISSIONS.RECORDS_WRITE },
  { prefix: '/guardians/create', permission: PERMISSIONS.RECORDS_WRITE },
  { prefix: '/flights/create', permission: PERMISSIONS.FLIGHTS_MANAGE },
  { prefix: '/review', permission: PERMISSIONS.APPLICATIONS_REVIEW },
  { prefix: '/exports', permission: PERMISSIONS.EXPORTS_READ },
  { prefix: '/tools/query', permission: PERMISSIONS.RECORDS_READ },
  { prefix: '/search-flights', permission: PERMISSIONS.RECORDS_READ },
  { prefix: '/search', permission: PERMISSIONS.RECORDS_READ },
  { prefix: '/veterans', permission: PERMISSIONS.RECORDS_READ },
  { prefix: '/guardians', permission: PERMISSIONS.RECORDS_READ },
  { prefix: '/flights', permission: PERMISSIONS.RECORDS_READ },
  { prefix: '/activity', permission: PERMISSIONS.RECORDS_READ },
  { prefix: '/waitlist', permission: PERMISSIONS.RECORDS_READ },
];

export function hasPermission(permissions, permission) {
  return Array.isArray(permissions) && permissions.includes(permission);
}

export function hasFullAccess(permissions) {
  return FULL_ONLY_PERMISSIONS.every((permission) => hasPermission(permissions, permission));
}

/**
 * Permission required to view a pathname.
 * `null` means the route is not tied to a single permission (settings, home).
 */
export function requiredPermissionForPath(pathname) {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return null;
  }

  if (pathname === '/' || pathname === '/settings' || pathname.startsWith('/settings/')) {
    return null;
  }

  const match = ROUTE_PERMISSIONS.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  );

  return match ? match.permission : null;
}

/**
 * Copy for an API 403. Prefers `requiredPermission` over the raw message.
 */
export function friendlyForbiddenMessage(body = {}) {
  const required = typeof body?.requiredPermission === 'string' ? body.requiredPermission.trim() : '';
  if (required) {
    return `You do not have permission to do that. This action requires ${required}.`;
  }

  const message = typeof body?.message === 'string' ? body.message : '';
  if (/account not permitted/i.test(message)) {
    return 'You are not authorized for this environment. Your account is not permitted to use it. Contact an administrator to request access.';
  }

  return 'You are not authorized to perform this action.';
}
