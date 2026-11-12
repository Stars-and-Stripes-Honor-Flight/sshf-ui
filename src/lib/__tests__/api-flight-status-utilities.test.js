import { api } from '@/lib/api';

jest.mock('@/components/core/toaster', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('@/lib/auth/domain/tokenManager', () => ({
  tokenManager: {
    getValidToken: jest.fn().mockResolvedValue('test-token'),
    getRefreshToken: jest.fn(),
    hasRefreshSession: jest.fn(() => false),
    refreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

describe('flight status utility API client (issue #252)', () => {
  const bulkBody = {
    fromStatus: 'Active',
    toStatus: 'Flown',
    counts: { matched: 5, changed: 5, skipped: 0, failed: 0 },
    failed: [],
  };

  function mockResponse(body, status) {
    global.fetch = jest.fn().mockResolvedValue({
      // 207 is in the 2xx range, so response.ok is true and the call must not throw.
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('completeFlight POSTs /flights/{id}/complete with no body and returns status plus body', async () => {
    const body = { counts: { changed: 2, failed: 0 } };
    mockResponse(body, 200);

    const result = await api.completeFlight('flight-214');

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/flights\/flight-214\/complete$/);
    expect(options.method).toBe('POST');
    expect(options.body).toBeUndefined();
    expect(result).toEqual({ status: 200, body });
  });

  test('completeFlight keeps 200 and 207 distinct when the body is the same', async () => {
    mockResponse(bulkBody, 200);
    const okResult = await api.completeFlight('flight-214');

    mockResponse(bulkBody, 207);
    const partialResult = await api.completeFlight('flight-214');

    expect(okResult).toEqual({ status: 200, body: bulkBody });
    expect(partialResult).toEqual({ status: 207, body: bulkBody });
    expect(okResult).not.toEqual(partialResult);
  });

  test.each([
    [409, 'Flight is already completed'],
    [400, 'Flight name cannot be used to match people'],
    [500, 'Database unreachable'],
  ])('completeFlight throws the API error message on HTTP %s', async (status, message) => {
    mockResponse({ error: message }, status);

    await expect(api.completeFlight('flight-214')).rejects.toThrow(message);
  });

  test('activateFutureStatus POSTs { status } to /flights/future-status/activate and returns status plus body', async () => {
    const body = { counts: { changed: 4, failed: 0 }, assignedToFlight: [] };
    mockResponse(body, 200);

    const result = await api.activateFutureStatus('Future-Fall');

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/flights\/future-status\/activate$/);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ status: 'Future-Fall' });
    expect(result).toEqual({ status: 200, body });
  });

  test('activateFutureStatus keeps 200 and 207 distinct when the body is the same', async () => {
    const body = {
      fromStatus: 'Future-Spring',
      toStatus: 'Active',
      counts: { matched: 3, changed: 1, skipped: 0, failed: 2 },
      failed: [{ id: 'vet-9', type: 'veteran', error: 'conflict' }],
      assignedToFlight: ['vet-9'],
    };

    mockResponse(body, 200);
    const okResult = await api.activateFutureStatus('Future-Spring');

    mockResponse(body, 207);
    const partialResult = await api.activateFutureStatus('Future-Spring');

    expect(okResult).toEqual({ status: 200, body });
    expect(partialResult).toEqual({ status: 207, body });
    expect(okResult).not.toEqual(partialResult);
  });

  test.each([
    [400, 'status is missing or does not begin with "Future-"'],
    [500, 'Database unreachable'],
  ])('activateFutureStatus throws the API error message on HTTP %s', async (status, message) => {
    mockResponse({ error: message }, status);

    await expect(api.activateFutureStatus('Future-Spring')).rejects.toThrow(message);
  });
});
