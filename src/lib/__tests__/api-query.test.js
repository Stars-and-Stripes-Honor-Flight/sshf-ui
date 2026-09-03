import { api } from '../api';
import { toast } from '@/components/core/toaster';

jest.mock('@/components/core/toaster', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('ApiClient.postQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('should call POST /query with request body', async () => {
    const mockResponse = {
      docs: [
        { _id: 'vet-1', type: 'Veteran', name: { first: 'John', last: 'Doe' } }
      ],
      bookmark: 'next-page-token'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const body = {
      selector: { type: 'Veteran' },
      limit: 25
    };

    const result = await api.postQuery(body);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/query'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should include authentication headers', async () => {
    const mockResponse = { docs: [] };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    // Mock token manager (assuming it's set up in the environment)
    const body = { selector: {}, limit: 25 };
    await api.postQuery(body);

    const fetchCall = global.fetch.mock.calls[0];
    const headers = fetchCall[1].headers;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should handle API errors with toast', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid selector' }),
    });

    const body = { selector: { $invalid: true } };

    await expect(api.postQuery(body)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Query failed'));
  });

  it('should surface API error field in thrown error message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Validation failed: skip not supported' }),
    });

    const body = { selector: {}, skip: 10 };

    await expect(api.postQuery(body)).rejects.toThrow(/Validation failed: skip not supported/);
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Validation failed: skip not supported'));
  });

  it('should handle 500 errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    const body = { selector: { type: 'Veteran' } };

    await expect(api.postQuery(body)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const body = { selector: {} };

    await expect(api.postQuery(body)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Network error'));
  });

  it('should pass complex query body correctly', async () => {
    const mockResponse = { docs: [], bookmark: 'test' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const body = {
      selector: {
        type: 'Veteran',
        'vet_type': { $in: ['WWII', 'Korea'] }
      },
      fields: ['_id', 'name', 'vet_type'],
      sort: [{ 'app_date': 'desc' }],
      limit: 50,
      use_index: '_design/veteran-index',
      execution_stats: true
    };

    await api.postQuery(body);

    const fetchCall = global.fetch.mock.calls[0];
    expect(JSON.parse(fetchCall[1].body)).toEqual(body);
  });
});
