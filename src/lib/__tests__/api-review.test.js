import { api } from '@/lib/api';
import { toast } from '@/components/core/toaster';

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

describe('review application API client', () => {
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

  test('listReviewApplications calls GET /review/applications with status and limit', async () => {
    mockFetchWith({ rows: [{ id: '1', name: 'Test' }] });

    const rows = await api.listReviewApplications({ status: 'Hold', limit: 50 });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('/review/applications?');
    expect(url).toContain('status=Hold');
    expect(url).toContain('limit=50');
    expect(rows).toHaveLength(1);
  });

  test('updateReviewApplicationStatus PATCHes status endpoint', async () => {
    mockFetchWith({ _id: '1', app_status: 'Rejected' });

    await api.updateReviewApplicationStatus('1', {
      app_status: 'Rejected',
      app_status_note: 'Incomplete',
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/review/applications/1/status');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({
      app_status: 'Rejected',
      app_status_note: 'Incomplete',
    });
  });

  test('acceptReviewApplication POSTs to accept endpoint', async () => {
    mockFetchWith({ application: { _id: '1', app_status: 'Accepted' } });

    await api.acceptReviewApplication('1', { app_status_note: 'OK' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/review/applications/1/accept');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ app_status_note: 'OK' });
  });

  test('acceptReviewApplication shows toast on 409 without generic failure toast', async () => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: 'Logistics modified' }),
    });
    global.fetch = fetchMock;

    await expect(api.acceptReviewApplication('1')).rejects.toMatchObject({ status: 409 });
    expect(toast.error).toHaveBeenCalledWith('Logistics modified');
  });
});
