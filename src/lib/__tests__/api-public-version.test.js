jest.mock('@/components/core/toaster', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/lib/auth/domain/tokenManager', () => ({
  tokenManager: {
    getValidToken: jest.fn(async () => 'secret-token'),
    hasRefreshSession: jest.fn(() => false),
    refreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

describe('ApiClient.getPublicApiVersion', () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test';
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  });

  test('reads info.version from the public OpenAPI document without auth', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ openapi: '3.0.0', info: { version: '9.8.7' } }),
    }));

    let api;
    let toast;
    jest.isolateModules(() => {
      toast = require('@/components/core/toaster').toast;
      api = require('@/lib/api').api;
    });

    await expect(api.getPublicApiVersion()).resolves.toBe('9.8.7');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.example.test/openapi.json');
    expect(options?.headers?.Authorization).toBeUndefined();
    expect(JSON.stringify(options ?? {})).not.toContain('secret-token');
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('returns null when the public spec cannot be read', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'nope' }),
    }));

    let api;
    jest.isolateModules(() => {
      api = require('@/lib/api').api;
    });

    await expect(api.getPublicApiVersion()).resolves.toBeNull();
  });
});
