jest.mock('@/components/core/toaster', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/lib/auth/domain/tokenManager', () => ({
  tokenManager: {
    getValidToken: jest.fn(),
    getRefreshToken: jest.fn(),
    refreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

describe('ApiClient base URL', () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
    jest.resetModules();
  });

  test('uses NEXT_PUBLIC_API_URL when set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test';

    let api;
    jest.isolateModules(() => {
      api = require('@/lib/api').api;
    });

    expect(api.baseUrl).toBe('https://api.example.test');
  });

  test('does not silently fall back to the dev API URL when unset', () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    let api;
    jest.isolateModules(() => {
      api = require('@/lib/api').api;
    });

    expect(api.baseUrl).toBeUndefined();
  });
});
