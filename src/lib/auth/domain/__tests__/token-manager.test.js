/**
 * @jest-environment jsdom
 */

import { authClient } from '../client';
import { tokenManager } from '../tokenManager';

jest.mock('@/lib/api', () => ({
  api: { hasGroup: jest.fn() },
}));

const REFRESH_KEY = 'google-refresh-token';
const ACCESS_KEY = 'google-access-token';
const EXPIRY_KEY = 'google-token-expiry';
const SESSION_KEY = 'google-has-refresh-session';

describe('token storage and silent refresh', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
    tokenManager.stopPeriodicRefresh();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    tokenManager.stopPeriodicRefresh();
    global.fetch = originalFetch;
  });

  test('sign-in does not leave the refresh token in localStorage, sessionStorage, or the DOM', async () => {
    localStorage.setItem(REFRESH_KEY, 'legacy-refresh-token');

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'access-from-sign-in',
        expiresIn: 3600,
        hasRefreshSession: true,
        refreshToken: 'must-not-be-stored',
      }),
    });

    await authClient.exchangeCodeForTokens('auth-code');

    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(sessionStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(document.body.innerHTML).not.toContain('must-not-be-stored');
    expect(localStorage.getItem(ACCESS_KEY)).toBe('access-from-sign-in');
    expect(localStorage.getItem(SESSION_KEY)).toBe('1');

    const [, requestInit] = global.fetch.mock.calls[0];
    expect(requestInit.body).not.toContain('must-not-be-stored');
    expect(JSON.stringify(localStorage)).not.toContain('must-not-be-stored');
  });

  test('refresh obtains a new access token without sending a refresh token in the body', async () => {
    tokenManager.storeTokenData('stale-access', 1, { hasRefreshSession: true });
    localStorage.setItem(EXPIRY_KEY, String(Date.now() - 1000));

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'refreshed-access',
        expiresIn: 3600,
      }),
    });

    const accessToken = await tokenManager.refreshToken();

    expect(accessToken).toBe('refreshed-access');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );

    const [, requestInit] = global.fetch.mock.calls[0];
    const body = JSON.parse(requestInit.body);
    expect(body).not.toHaveProperty('refreshToken');
    expect(JSON.stringify(body)).not.toMatch(/refresh/i);
    expect(localStorage.getItem(ACCESS_KEY)).toBe('refreshed-access');
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBe('1');
  });

  test('logout removes every stored credential and clears the refresh session', async () => {
    tokenManager.storeTokenData('access', 3600, { hasRefreshSession: true });
    localStorage.setItem(REFRESH_KEY, 'should-be-removed');
    sessionStorage.setItem(REFRESH_KEY, 'should-be-removed');

    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    await authClient.signOut();

    expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(localStorage.getItem(EXPIRY_KEY)).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
  });

  test('a failed refresh removes stored credentials and the refresh session', async () => {
    tokenManager.storeTokenData('stale-access', 3600, { hasRefreshSession: true });

    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Failed to refresh token' }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const accessToken = await tokenManager.refreshToken();

    expect(accessToken).toBeNull();
    expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
