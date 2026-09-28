/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { POST as refresh } from '../refresh/route';
import { POST as exchange } from '../token/route';

const REFRESH_COOKIE = 'sshf_refresh_token';
const CLIENT_SECRET = 'test-client-secret';
const AUTH_CODE = 'test-auth-code';
const REFRESH_TOKEN = 'test-refresh-token';
const ACCESS_TOKEN = 'test-access-token';
const UPSTREAM_MARKER = 'upstream-diagnostic-detail';

function googleFailure(body, status = 400) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: false,
    status,
    text: async () => raw,
    json: async () => JSON.parse(raw),
  };
}

function loggedText(spies) {
  return spies
    .flatMap((spy) => spy.mock.calls)
    .flat()
    .map((part) => {
      if (typeof part === 'string') {
        return part;
      }
      try {
        return JSON.stringify(part);
      } catch {
        return String(part);
      }
    })
    .join(' ');
}

describe('Google OAuth error logging', () => {
  const originalFetch = global.fetch;
  const originalClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const originalSecret = process.env.GOOGLE_CLIENT_SECRET;
  let errorSpy;
  let logSpy;
  let warnSpy;
  let infoSpy;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = CLIENT_SECRET;
    global.fetch = jest.fn();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    errorSpy.mockRestore();
    logSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
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

  function logs() {
    return loggedText([errorSpy, logSpy, warnSpy, infoSpy]);
  }

  test('token exchange logs status and a short reason, omitting the Google body', async () => {
    const upstream = {
      error: 'invalid_grant',
      error_description: `Bad Request ${UPSTREAM_MARKER}`,
    };
    global.fetch.mockResolvedValue(googleFailure(upstream, 400));

    const request = new NextRequest('http://localhost/api/auth/token', {
      method: 'POST',
      body: JSON.stringify({ code: AUTH_CODE }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await exchange(request);
    const body = await response.json();
    const message = logs();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Failed to exchange authorization code for tokens' });
    expect(JSON.stringify(body)).not.toContain(UPSTREAM_MARKER);
    expect(message).toContain('400');
    expect(message).toContain('invalid_grant');
    expect(message).not.toContain(UPSTREAM_MARKER);
    expect(message).not.toContain('error_description');
    expect(message).not.toContain(JSON.stringify(upstream));
    expect(message).not.toContain(AUTH_CODE);
    expect(message).not.toContain(CLIENT_SECRET);
    expect(message).not.toContain(ACCESS_TOKEN);
  });

  test('refresh logs status and a short reason, omitting the Google body', async () => {
    const upstream = {
      error: 'invalid_grant',
      error_description: `Token revoked ${UPSTREAM_MARKER}`,
    };
    global.fetch.mockResolvedValue(googleFailure(upstream, 400));

    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: {
        cookie: `${REFRESH_COOKIE}=${REFRESH_TOKEN}`,
      },
    });

    const response = await refresh(request);
    const body = await response.json();
    const message = logs();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Failed to refresh token' });
    expect(JSON.stringify(body)).not.toContain(UPSTREAM_MARKER);
    expect(message).toContain('400');
    expect(message).toContain('invalid_grant');
    expect(message).not.toContain(UPSTREAM_MARKER);
    expect(message).not.toContain('error_description');
    expect(message).not.toContain(JSON.stringify(upstream));
    expect(message).not.toContain(REFRESH_TOKEN);
    expect(message).not.toContain(CLIENT_SECRET);
    expect(message).not.toContain(ACCESS_TOKEN);
  });

  test('an unsafe Google payload is replaced with a generic reason', async () => {
    const upstream = {
      error: `invalid request ${UPSTREAM_MARKER}`,
      error_description: UPSTREAM_MARKER,
    };
    global.fetch.mockResolvedValue(googleFailure(upstream, 401));

    const request = new NextRequest('http://localhost/api/auth/token', {
      method: 'POST',
      body: JSON.stringify({ code: AUTH_CODE }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await exchange(request);
    const message = logs();

    expect(response.status).toBe(401);
    expect(message).toContain('401');
    expect(message).toContain('upstream_error');
    expect(message).not.toContain(UPSTREAM_MARKER);
    expect(message).not.toContain(AUTH_CODE);
    expect(message).not.toContain(CLIENT_SECRET);
  });

  test('a non-JSON Google error body is not written to the log', async () => {
    const raw = `<html>oauth failure ${UPSTREAM_MARKER}</html>`;
    global.fetch.mockResolvedValue(googleFailure(raw, 502));

    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { cookie: `${REFRESH_COOKIE}=${REFRESH_TOKEN}` },
    });

    const response = await refresh(request);
    const body = await response.json();
    const message = logs();

    expect(response.status).toBe(502);
    expect(body).toEqual({ error: 'Failed to refresh token' });
    expect(JSON.stringify(body)).not.toContain(UPSTREAM_MARKER);
    expect(message).toContain('502');
    expect(message).toContain('upstream_error');
    expect(message).not.toContain(UPSTREAM_MARKER);
    expect(message).not.toContain(raw);
    expect(message).not.toContain(REFRESH_TOKEN);
    expect(message).not.toContain(CLIENT_SECRET);
  });

  test('success responses do not log tokens, secrets, or authorization codes', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: ACCESS_TOKEN,
        refresh_token: REFRESH_TOKEN,
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });

    const exchangeRequest = new NextRequest('http://localhost/api/auth/token', {
      method: 'POST',
      body: JSON.stringify({ code: AUTH_CODE }),
      headers: { 'Content-Type': 'application/json' },
    });
    const exchangeResponse = await exchange(exchangeRequest);
    expect(exchangeResponse.status).toBe(200);

    const refreshRequest = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { cookie: `${REFRESH_COOKIE}=${REFRESH_TOKEN}` },
    });
    const refreshResponse = await refresh(refreshRequest);
    expect(refreshResponse.status).toBe(200);

    const message = logs();
    expect(message).not.toContain(ACCESS_TOKEN);
    expect(message).not.toContain(REFRESH_TOKEN);
    expect(message).not.toContain(AUTH_CODE);
    expect(message).not.toContain(CLIENT_SECRET);
  });
});
