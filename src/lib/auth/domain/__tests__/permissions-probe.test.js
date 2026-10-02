import { accessFromPermissionsProbe } from '../permissions-probe';

describe('accessFromPermissionsProbe', () => {
  const summary = {
    email: 'jane@example.com',
    hasAccess: true,
    roles: ['READ'],
    permissions: ['exports:read', 'records:read'],
    evaluatedAt: '2026-10-01T15:04:05.000Z',
    expiresAt: '2026-10-01T15:19:05.000Z',
  };

  test('keeps the permission summary from GET /user/permissions', () => {
    expect(accessFromPermissionsProbe(summary)).toEqual({
      permissions: ['exports:read', 'records:read'],
      roles: ['READ'],
      hasAccess: true,
      evaluatedAt: summary.evaluatedAt,
      expiresAt: summary.expiresAt,
      probeFailed: false,
    });
  });

  test('treats an empty summary as no access, not a failed probe', () => {
    expect(
      accessFromPermissionsProbe({
        hasAccess: false,
        roles: [],
        permissions: [],
      })
    ).toMatchObject({
      permissions: [],
      hasAccess: false,
      probeFailed: false,
    });
  });

  test('marks probeFailed on 503 instead of treating it as non-membership', () => {
    const error = new Error('Authentication service unavailable');
    error.status = 503;
    expect(accessFromPermissionsProbe({ error })).toEqual({
      permissions: [],
      roles: [],
      hasAccess: false,
      evaluatedAt: null,
      expiresAt: null,
      probeFailed: true,
    });
  });

  test('marks probeFailed when the request fails before a status is known', () => {
    expect(accessFromPermissionsProbe({ error: new Error('Failed to fetch') }).probeFailed).toBe(true);
  });

  test('does not mark probeFailed for a definitive 403', () => {
    const error = new Error('Forbidden: Account not permitted');
    error.status = 403;
    expect(accessFromPermissionsProbe({ error }).probeFailed).toBe(false);
    expect(accessFromPermissionsProbe({ error }).hasAccess).toBe(false);
  });
});
