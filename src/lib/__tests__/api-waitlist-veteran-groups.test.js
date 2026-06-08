import { api } from '@/lib/api';
import { toast } from '@/components/core/toaster';

jest.mock('@/components/core/toaster', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@/lib/auth/domain/tokenManager', () => ({
  tokenManager: {
    getValidToken: jest.fn().mockResolvedValue('test-token'),
    getRefreshToken: jest.fn(),
    refreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

describe('api.getWaitlistVeteranGroups', () => {
  let fetchMock;

  const mockGroups = [
    { group: '853-3', names: ['William Mathias (SSHF-Mark1)', 'Robert Kossow (SSHF-Mark1)'] },
    { group: '855-2', names: ['Philip Schultz'] },
  ];

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGroups),
    });
    global.fetch = fetchMock;
    toast.error.mockClear();
  });

  test('fetches veteran groups from /waitlist/veteran-groups', async () => {
    const result = await api.getWaitlistVeteranGroups();

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('/waitlist/veteran-groups');
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
    expect(result).toEqual(mockGroups);
    expect(result[0]).toHaveProperty('group');
    expect(result[0]).toHaveProperty('names');
  });

  test('shows toast error on failure', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    await expect(api.getWaitlistVeteranGroups()).rejects.toThrow('Network error');
    expect(toast.error).toHaveBeenCalledWith('Failed to fetch veteran groups: Network error');
  });
});
