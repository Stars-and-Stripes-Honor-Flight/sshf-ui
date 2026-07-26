jest.mock('@/components/core/toaster', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/lib/auth/domain/tokenManager', () => ({
  tokenManager: {
    getValidToken: jest.fn(async () => 'token'),
    getRefreshToken: jest.fn(() => null),
    refreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

describe('ApiClient 403 handling', () => {
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

  test('toasts a safe message and throws on 403', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden: Account not permitted' }),
    }));

    let api;
    let toast;
    jest.isolateModules(() => {
      toast = require('@/components/core/toaster').toast;
      api = require('@/lib/api').api;
    });

    await expect(api.request('/veterans/abc')).rejects.toMatchObject({ status: 403 });
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/not authorized|permission|forbidden/i)
    );
  });
});
