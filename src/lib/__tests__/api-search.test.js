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

describe('api.search', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rows: [], total_rows: 0 }),
    });
    global.fetch = fetchMock;
    toast.error.mockClear();
  });

  test('includes phone_num when valid and omits lastname', async () => {
    await api.search({ lastname: 'Smith', phone_num: '414-817', status: 'Active' });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('phone_num=414-817');
    expect(url).not.toContain('lastname=');
  });

  test('includes lastname when phone_num is not valid', async () => {
    await api.search({ lastname: 'Smith', phone_num: '41', status: 'Active' });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('lastname=Smith');
    expect(url).not.toContain('phone_num=');
  });

  test('includes lastname when phone_num is empty', async () => {
    await api.search({ lastname: 'Smith', status: 'Active' });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('lastname=Smith');
    expect(url).not.toContain('phone_num=');
  });

  test('does not include phone_num when fewer than 3 digits', async () => {
    await api.search({ phone_num: '12', status: 'Active' });

    const url = fetchMock.mock.calls[0][0];
    expect(url).not.toContain('phone_num=');
  });
});
