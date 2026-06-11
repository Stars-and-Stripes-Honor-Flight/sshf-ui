import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockReplace = jest.fn();
const mockSearchParamsGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}));

jest.mock('@/lib/api', () => ({
  api: {
    getWaitlist: jest.fn(),
  },
}));

import { api } from '@/lib/api';
import { WaitlistView } from '@/components/main/waitlist/waitlist-view';

const makeVeteran = (overrides = {}) => ({
  id: 'vet-1',
  name: 'James Weimer',
  age: 90,
  city: 'Schiller Park',
  appdate: '2024-07-25',
  birth_date: '1935-04-01',
  prefs: 'Guardian fee waiver',
  status: 'Active',
  vet_type: 'Korea',
  group: '855-1',
  pairings: [{ id: 'grd-9', name: 'James Weimer Jr' }],
  ...overrides,
});

const makeGuardian = (overrides = {}) => ({
  id: 'grd-1',
  name: 'Rachel Stubner',
  age: 56,
  city: 'Menasha',
  appdate: '2023-06-12',
  birth_date: '1970-02-15',
  prefs: 'Good for GRB',
  status: 'Active',
  vet_type: '',
  group: '',
  pairings: [{ id: 'vet-2', name: 'Gary Stubner' }],
  ...overrides,
});

describe('WaitlistView', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParamsGet.mockImplementation(() => null);
    api.getWaitlist.mockReset();
    api.getWaitlist.mockResolvedValue([makeVeteran()]);

    // Force desktop layout (useMediaQuery -> matches false for down('sm'))
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test('requests a page size of 100 (fetches 101 to detect more pages)', async () => {
    render(<WaitlistView />);

    await waitFor(() => {
      expect(api.getWaitlist).toHaveBeenCalledWith({
        type: 'veterans',
        offset: 0,
        limit: 101,
      });
    });
  });

  test('uses offset of 100 per page when page param is set', async () => {
    mockSearchParamsGet.mockImplementation((key) => (key === 'page' ? '1' : null));

    render(<WaitlistView />);

    await waitFor(() => {
      expect(api.getWaitlist).toHaveBeenCalledWith({
        type: 'veterans',
        offset: 100,
        limit: 101,
      });
    });
  });

  test('renders veteran columns including Conflict, Flight Group and Guardian', async () => {
    render(<WaitlistView />);

    expect(await screen.findByText('James Weimer')).toBeInTheDocument();
    for (const header of [
      '#',
      'Name',
      'Age',
      'Birth Date',
      'City',
      'Application Date',
      'Conflict',
      'Flight Group',
      'Guardian',
      'Notes',
    ]) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
  });

  test('renders guardian columns with Veteran(s) and without Conflict or Flight Group', async () => {
    mockSearchParamsGet.mockImplementation((key) => (key === 'type' ? 'guardians' : null));
    api.getWaitlist.mockResolvedValue([makeGuardian()]);

    render(<WaitlistView />);

    expect(await screen.findByText('Rachel Stubner')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Veteran(s)' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Conflict' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Flight Group' })).not.toBeInTheDocument();
  });

  test('numbers positions from the page offset', async () => {
    mockSearchParamsGet.mockImplementation((key) => (key === 'page' ? '1' : null));
    api.getWaitlist.mockResolvedValue([
      makeVeteran(),
      makeVeteran({ id: 'vet-2', name: 'Robert Molkentine' }),
    ]);

    render(<WaitlistView />);

    expect(await screen.findByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
  });

  test('shows a status chip only for non-Active entries', async () => {
    api.getWaitlist.mockResolvedValue([
      makeVeteran(),
      makeVeteran({ id: 'vet-2', name: 'Vernin Tretow', status: 'Future-Fall' }),
    ]);

    render(<WaitlistView />);

    expect(await screen.findByText('Future-Fall')).toBeInTheDocument();
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });
});
