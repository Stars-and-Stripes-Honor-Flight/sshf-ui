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

describe('roster boolean PATCH API client (issue #277)', () => {
  let fetchMock;

  const mockFetchWith = (data, { ok = true, status = 200 } = {}) => {
    fetchMock = jest.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
    });
    global.fetch = fetchMock;
  };

  test('updateGuardianWaiver PATCHes /guardians/{id}/waiver', async () => {
    mockFetchWith({ ok: true });

    await api.updateGuardianWaiver('grd-1', true);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/guardians/grd-1/waiver');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ value: true });
  });

  test('updateGuardianTrainingSeeDoc PATCHes /guardians/{id}/training-see-doc', async () => {
    mockFetchWith({ ok: true });

    await api.updateGuardianTrainingSeeDoc('grd-2', false);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/guardians/grd-2/training-see-doc');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ value: false });
  });

  test('updateVeteranMailCallReceived PATCHes /veterans/{id}/mail-call-received', async () => {
    mockFetchWith({ ok: true });

    await api.updateVeteranMailCallReceived('vet-1', true);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/veterans/vet-1/mail-call-received');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ value: true });
  });

  test('updateVeteranMailCallAdopt PATCHes /veterans/{id}/mail-call-adopt', async () => {
    mockFetchWith({ ok: true });

    await api.updateVeteranMailCallAdopt('vet-2', false);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/veterans/vet-2/mail-call-adopt');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ value: false });
  });

  test('updateVeteranMailCallNotes PATCHes /veterans/{id}/mail-call-notes', async () => {
    mockFetchWith({ ok: true });

    await api.updateVeteranMailCallNotes('vet-3', 'Left at the front desk');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/veterans/vet-3/mail-call-notes');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ value: 'Left at the front desk' });
  });
});
