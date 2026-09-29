import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';

jest.mock('@/components/core/toaster', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
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

describe('bus assignment API client', () => {
  let fetchMock;

  const mockFetchWith = (data, { ok = true, status = 200 } = {}) => {
    fetchMock = jest.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
    });
    global.fetch = fetchMock;
  };

  beforeEach(() => {
    toast.error.mockClear();
  });

  test('updateVeteranBus PATCHes /veterans/{id}/bus with { value }', async () => {
    const body = { ok: true, id: 'vet-1', rev: '2-abc', bus: 'Alpha1' };
    mockFetchWith(body);

    const result = await api.updateVeteranBus('vet-1', 'Alpha1');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/veterans/vet-1/bus');
    expect(url).not.toContain('fix-bus-mismatches');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ value: 'Alpha1' });
    expect(result).toEqual(body);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('updateGuardianBus PATCHes /guardians/{id}/bus with { value }', async () => {
    const body = { ok: true, id: 'grd-1', rev: '4-def', bus: 'Bravo2' };
    mockFetchWith(body);

    const result = await api.updateGuardianBus('grd-1', 'Bravo2');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/guardians/grd-1/bus');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ value: 'Bravo2' });
    expect(result).toEqual(body);
  });

  test('updateVeteranBus toasts and rethrows when the request fails', async () => {
    mockFetchWith({ error: 'Invalid bus' }, { ok: false, status: 400 });

    await expect(api.updateVeteranBus('vet-1', 'Alpha1')).rejects.toThrow('Invalid bus');
    expect(toast.error).toHaveBeenCalledWith('Failed to update veteran bus: Invalid bus');
  });

  test('updateGuardianBus toasts and rethrows when the request fails', async () => {
    mockFetchWith({ error: 'Guardian not found' }, { ok: false, status: 404 });

    await expect(api.updateGuardianBus('grd-1', 'Bravo2')).rejects.toThrow('Guardian not found');
    expect(toast.error).toHaveBeenCalledWith('Failed to update guardian bus: Guardian not found');
  });
});
