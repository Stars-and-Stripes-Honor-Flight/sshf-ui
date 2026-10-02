/**
 * @jest-environment jsdom
 */

import { GOOGLE_SIGN_IN_SCOPE, authClient } from '../client';
import { tokenManager } from '../tokenManager';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    getPermissions: jest.fn(),
    hasGroup: jest.fn(),
  },
}));

jest.mock('../tokenManager', () => ({
  tokenManager: {
    getValidToken: jest.fn(),
    clearTokens: jest.fn(),
    storeTokenData: jest.fn(),
    hasRefreshSession: jest.fn(() => false),
  },
}));

describe('auth client permissions', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    tokenManager.getValidToken.mockResolvedValue('access-token');
    global.fetch = jest.fn(async (url) => {
      if (String(url).includes('userinfo')) {
        return {
          ok: true,
          json: async () => ({
            sub: 'user-1',
            email: 'jane@example.com',
            given_name: 'Jane',
            family_name: 'Doe',
            picture: 'https://example.com/a.png',
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('sign-in scope does not request Directory group access', () => {
    expect(GOOGLE_SIGN_IN_SCOPE).toBe('email profile');
    expect(GOOGLE_SIGN_IN_SCOPE).not.toMatch(/admin\.directory/);
  });

  test('loads the user from one getPermissions call', async () => {
    api.getPermissions.mockResolvedValue({
      email: 'jane@example.com',
      hasAccess: true,
      roles: ['WRITE'],
      permissions: ['records:read', 'records:write', 'exports:read'],
      evaluatedAt: '2026-10-01T15:04:05.000Z',
      expiresAt: '2026-10-01T15:19:05.000Z',
    });

    const { data } = await authClient.getUser();

    expect(api.getPermissions).toHaveBeenCalledTimes(1);
    expect(api.hasGroup).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringMatching(/admin\.googleapis\.com/),
      expect.anything()
    );
    expect(data).toMatchObject({
      id: 'user-1',
      email: 'jane@example.com',
      hasAccess: true,
      roles: ['WRITE'],
      permissions: ['records:read', 'records:write', 'exports:read'],
      membershipProbeFailed: false,
      expiresAt: '2026-10-01T15:19:05.000Z',
    });
  });

  test('keeps the session and flags membershipProbeFailed when permissions returns 503', async () => {
    const error = new Error('Authentication service unavailable');
    error.status = 503;
    api.getPermissions.mockRejectedValue(error);

    const { data } = await authClient.getUser();

    expect(data.membershipProbeFailed).toBe(true);
    expect(data.hasAccess).toBe(false);
    expect(data.permissions).toEqual([]);
    expect(tokenManager.clearTokens).not.toHaveBeenCalled();
  });
});
