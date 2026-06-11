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

const mockVeteran = {
  _id: 'vet-1',
  type: 'Veteran',
  name: { first: 'James', middle: '', last: 'Weimer', nickname: '' },
  birth_date: '1935-04-01',
  vet_type: 'Korea',
  app_date: '2024-07-25',
  address: { city: 'Schiller Park' },
  flight: { status: 'Future-Fall', group: '855-1', status_note: 'Guardian fee waiver.mm' },
  call: { notes: 'Call notes here' },
  guardian: { id: 'grd-9', name: 'James Weimer Jr' },
};

const mockGuardian = {
  _id: 'grd-1',
  type: 'Guardian',
  name: { first: 'Rachel', middle: '', last: 'Stubner', nickname: '' },
  birth_date: '1970-02-15',
  app_date: '2023-06-12',
  address: { city: 'Menasha' },
  flight: { status: 'Active' },
  notes: { other: 'Prefers fall flight' },
  medical: { experience: 'RN for 20 years' },
  veteran: {
    pairings: [
      { id: 'vet-2', name: 'Gary Stubner' },
      { id: 'vet-3', name: 'Vernin Tretow' },
    ],
  },
};

describe('api.getWaitlist', () => {
  let fetchMock;

  const mockFetchWith = (data) => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    });
    global.fetch = fetchMock;
  };

  beforeEach(() => {
    toast.error.mockClear();
  });

  test('sends type, offset and limit query params with default limit of 100', async () => {
    mockFetchWith([]);

    await api.getWaitlist();

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('/waitlist?');
    expect(url).toContain('type=veterans');
    expect(url).toContain('offset=0');
    expect(url).toContain('limit=100');
  });

  test('passes through explicit pagination params', async () => {
    mockFetchWith([]);

    await api.getWaitlist({ type: 'guardians', offset: 100, limit: 101 });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('type=guardians');
    expect(url).toContain('offset=100');
    expect(url).toContain('limit=101');
  });

  test('transforms veteran entries with status, conflict, group and guardian pairing', async () => {
    mockFetchWith([mockVeteran]);

    const result = await api.getWaitlist({ type: 'veterans' });

    expect(result).toHaveLength(1);
    const entry = result[0];
    expect(entry.id).toBe('vet-1');
    // vet_type is no longer appended to the name; it is its own field
    expect(entry.name).toBe('James Weimer');
    expect(entry.vet_type).toBe('Korea');
    expect(entry.status).toBe('Future-Fall');
    expect(entry.group).toBe('855-1');
    expect(entry.pairings).toEqual([{ id: 'grd-9', name: 'James Weimer Jr' }]);
    expect(entry.city).toBe('Schiller Park');
    expect(entry.appdate).toBe('2024-07-25');
    expect(entry.prefs).toBe('Call notes here | Guardian fee waiver.mm');
  });

  test('formats names as simple "First Last", ignoring nickname and middle name', async () => {
    mockFetchWith([
      {
        ...mockVeteran,
        name: { first: 'James', middle: 'Robert', last: 'Weimer', nickname: 'Jim' },
      },
    ]);

    const result = await api.getWaitlist({ type: 'veterans' });

    expect(result[0].name).toBe('James Weimer');
  });

  test('veteran without a paired guardian yields empty pairings', async () => {
    mockFetchWith([{ ...mockVeteran, guardian: { id: '', name: '' } }]);

    const result = await api.getWaitlist({ type: 'veterans' });

    expect(result[0].pairings).toEqual([]);
  });

  test('transforms guardian entries with status and veteran pairings', async () => {
    mockFetchWith([mockGuardian]);

    const result = await api.getWaitlist({ type: 'guardians' });

    const entry = result[0];
    expect(entry.id).toBe('grd-1');
    expect(entry.name).toBe('Rachel Stubner');
    expect(entry.status).toBe('Active');
    expect(entry.pairings).toEqual([
      { id: 'vet-2', name: 'Gary Stubner' },
      { id: 'vet-3', name: 'Vernin Tretow' },
    ]);
    // Guardian notes still merge notes.other and medical.experience (covers Med. Training)
    expect(entry.prefs).toBe('Prefers fall flight | RN for 20 years');
  });

  test('shows toast error and rethrows on failure', async () => {
    fetchMock = jest.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = fetchMock;

    await expect(api.getWaitlist()).rejects.toThrow('Network error');
    expect(toast.error).toHaveBeenCalledWith('Failed to fetch waitlist: Network error');
  });
});
