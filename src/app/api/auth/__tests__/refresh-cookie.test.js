/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { POST as logout } from '../logout/route';
import { POST as refresh } from '../refresh/route';
import { POST as exchange } from '../token/route';

const REFRESH_COOKIE = 'sshf_refresh_token';

function cookieHeader(response) {
  return response.headers.get('set-cookie') || '';
}

describe('auth refresh cookie', () => {
  const originalFetch = global.fetch;
  const originalClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const originalSecret = process.env.GOOGLE_CLIENT_SECRET;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalClientId === undefined) {
      delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    } else {
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = originalClientId;
    }
    if (originalSecret === undefined) {
      delete process.env.GOOGLE_CLIENT_SECRET;
    } else {
      process.env.GOOGLE_CLIENT_SECRET = originalSecret;
    }
  });

  test('code exchange stores the refresh token in an httpOnly cookie and omits it from JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-access',
        refresh_token: 'long-lived-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });

    const request = new NextRequest('http://localhost/api/auth/token', {
      method: 'POST',
      body: JSON.stringify({ code: 'auth-code' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await exchange(request);
    const body = await response.json();
    const setCookie = cookieHeader(response);

    expect(body.accessToken).toBe('new-access');
    expect(body.refreshToken).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('long-lived-refresh');
    expect(setCookie).toContain(`${REFRESH_COOKIE}=long-lived-refresh`);
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(setCookie.toLowerCase()).toContain('path=/api/auth');
  });

  test('refresh uses the cookie and does not require a refresh token in the body', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'refreshed-access',
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });

    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        cookie: `${REFRESH_COOKIE}=cookie-refresh-token`,
      },
    });

    const response = await refresh(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accessToken).toBe('refreshed-access');
    expect(JSON.stringify(body)).not.toContain('cookie-refresh-token');

    const [, googleInit] = global.fetch.mock.calls[0];
    expect(googleInit.body.toString()).toContain('refresh_token=cookie-refresh-token');
    expect(googleInit.body.toString()).not.toContain('undefined');
  });

  test('logout clears the refresh cookie', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${REFRESH_COOKIE}=cookie-refresh-token` },
    });

    const response = await logout(request);
    const setCookie = cookieHeader(response).toLowerCase();

    expect(response.status).toBe(200);
    expect(setCookie).toContain(REFRESH_COOKIE);
    expect(setCookie).toMatch(/max-age=0|expires=thu, 01 jan 1970/);
  });

  test('a failed refresh clears the refresh cookie', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'invalid_grant' }),
    });

    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'body-token-must-be-ignored' }),
      headers: {
        'Content-Type': 'application/json',
        cookie: `${REFRESH_COOKIE}=cookie-refresh-token`,
      },
    });

    const response = await refresh(request);
    const setCookie = cookieHeader(response).toLowerCase();

    expect(response.status).toBe(400);
    expect(setCookie).toContain(REFRESH_COOKIE);
    expect(setCookie).toMatch(/max-age=0|expires=thu, 01 jan 1970/);

    const [, googleInit] = global.fetch.mock.calls[0];
    expect(googleInit.body.toString()).toContain('refresh_token=cookie-refresh-token');
    expect(googleInit.body.toString()).not.toContain('body-token-must-be-ignored');
  });
});
