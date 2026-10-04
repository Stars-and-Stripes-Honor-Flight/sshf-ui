import { loadApiVersion, resetApiVersionCache } from '@/lib/api-version';

const mockGetPublicApiVersion = jest.fn();

jest.mock('@/lib/api', () => ({
  api: {
    getPublicApiVersion: (...args) => mockGetPublicApiVersion(...args),
  },
}));

describe('loadApiVersion', () => {
  beforeEach(() => {
    resetApiVersionCache();
    mockGetPublicApiVersion.mockReset();
  });

  test('fetches the API version once per shell load', async () => {
    mockGetPublicApiVersion.mockResolvedValue('3.2.1');

    const [first, second] = await Promise.all([loadApiVersion(), loadApiVersion()]);

    expect(first).toBe('3.2.1');
    expect(second).toBe('3.2.1');
    expect(mockGetPublicApiVersion).toHaveBeenCalledTimes(1);

    await expect(loadApiVersion()).resolves.toBe('3.2.1');
    expect(mockGetPublicApiVersion).toHaveBeenCalledTimes(1);
  });

  test('returns null when the lookup fails so the UI version can still render', async () => {
    mockGetPublicApiVersion.mockRejectedValue(new Error('offline'));

    await expect(loadApiVersion()).resolves.toBeNull();
  });
});
