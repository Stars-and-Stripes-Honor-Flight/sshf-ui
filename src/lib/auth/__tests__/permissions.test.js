import {
  FULL_ONLY_PERMISSIONS,
  PERMISSIONS,
  friendlyForbiddenMessage,
  hasFullAccess,
  hasPermission,
  requiredPermissionForPath,
} from '@/lib/auth/permissions';

describe('permission helpers', () => {
  test('can() is true only when the permission is in the API summary', () => {
    const permissions = [PERMISSIONS.RECORDS_READ, PERMISSIONS.EXPORTS_READ];
    expect(hasPermission(permissions, PERMISSIONS.RECORDS_READ)).toBe(true);
    expect(hasPermission(permissions, PERMISSIONS.RECORDS_WRITE)).toBe(false);
    expect(hasPermission(undefined, PERMISSIONS.RECORDS_READ)).toBe(false);
  });

  test('full access is the FULL-only permissions, not a Workspace group', () => {
    expect(FULL_ONLY_PERMISSIONS).toEqual([
      PERMISSIONS.RECORDS_DELETE,
      PERMISSIONS.DOCUMENTS_ADMIN,
      PERMISSIONS.FLIGHTS_MANAGE,
    ]);
    const write = [PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_WRITE, PERMISSIONS.EXPORTS_READ];
    const full = [...write, ...FULL_ONLY_PERMISSIONS];
    expect(hasFullAccess(write)).toBe(false);
    expect(hasFullAccess(full)).toBe(true);
  });

  test('maps routes to the permission the API enforces', () => {
    expect(requiredPermissionForPath('/search')).toBe(PERMISSIONS.RECORDS_READ);
    expect(requiredPermissionForPath('/veterans/details')).toBe(PERMISSIONS.RECORDS_READ);
    expect(requiredPermissionForPath('/veterans/create')).toBe(PERMISSIONS.RECORDS_WRITE);
    expect(requiredPermissionForPath('/guardians/create')).toBe(PERMISSIONS.RECORDS_WRITE);
    expect(requiredPermissionForPath('/flights/details')).toBe(PERMISSIONS.RECORDS_READ);
    expect(requiredPermissionForPath('/flights/create')).toBe(PERMISSIONS.FLIGHTS_MANAGE);
    expect(requiredPermissionForPath('/exports/flight')).toBe(PERMISSIONS.EXPORTS_READ);
    expect(requiredPermissionForPath('/tools/query')).toBe(PERMISSIONS.RECORDS_READ);
    expect(requiredPermissionForPath('/review/applications')).toBe(PERMISSIONS.APPLICATIONS_REVIEW);
    expect(requiredPermissionForPath('/review/applications/detail')).toBe(PERMISSIONS.APPLICATIONS_REVIEW);
    expect(requiredPermissionForPath('/settings/account')).toBeNull();
    expect(requiredPermissionForPath('/')).toBeNull();
  });
});

describe('friendlyForbiddenMessage', () => {
  test('names the required permission from a 403 body', () => {
    expect(
      friendlyForbiddenMessage({
        message: 'Forbidden: requires permission records:delete',
        requiredPermission: 'records:delete',
      })
    ).toMatch(/records:delete/);
    expect(
      friendlyForbiddenMessage({
        message: 'Forbidden: requires permission records:delete',
        requiredPermission: 'records:delete',
      })
    ).not.toMatch(/Forbidden: requires permission/);
  });

  test('uses account-not-permitted copy when the API denies the account', () => {
    expect(friendlyForbiddenMessage({ message: 'Forbidden: Account not permitted' })).toMatch(
      /not permitted/i
    );
  });

  test('falls back to a generic authorization message', () => {
    expect(friendlyForbiddenMessage({})).toMatch(/not authorized/i);
  });
});
