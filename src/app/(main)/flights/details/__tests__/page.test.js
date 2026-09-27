import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { api } from '@/lib/api';

import Page from '../page';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key) => (key === 'id' ? 'flight-214' : null),
  }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api', () => ({
  api: {
    getFlightDetails: jest.fn(),
    getFlightAssignments: jest.fn(),
  },
}));

jest.mock('@/components/core/toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

function veteran(overrides) {
  return {
    type: 'Veteran',
    bus: 'Alpha1',
    seat: '1A',
    confirmed: true,
    medical_form: true,
    medical_level: 'Level 1',
    nofly: false,
    ...overrides,
  };
}

function guardian(overrides) {
  return {
    type: 'Guardian',
    bus: 'Alpha1',
    seat: '1B',
    confirmed: true,
    medical_form: true,
    training_complete: true,
    training: 'Complete',
    nofly: false,
    ...overrides,
  };
}

const paired = {
  pairId: 'paired',
  busMismatch: false,
  missingPairedPerson: false,
  people: [
    veteran({ id: 'vet-paired', name_first: 'Pat', name_last: 'Paired' }),
    guardian({ id: 'grd-paired', name_first: 'Gail', name_last: 'Guardian' }),
  ],
};

const unpaired = {
  pairId: 'unpaired',
  busMismatch: false,
  missingPairedPerson: false,
  people: [veteran({ id: 'vet-unpaired', name_first: 'Uma', name_last: 'Unpaired' })],
};

const noFlyPair = {
  pairId: 'nofly-guardian',
  busMismatch: false,
  missingPairedPerson: false,
  people: [
    veteran({ id: 'vet-dc', name_first: 'Ned', name_last: 'District' }),
    guardian({
      id: 'grd-dc',
      name_first: 'Dana',
      name_last: 'District',
      nofly: true,
    }),
  ],
};

const crew = {
  pairId: 'crew',
  busMismatch: false,
  missingPairedPerson: false,
  people: [guardian({ id: 'grd-crew', name_first: 'Casey', name_last: 'Crew' })],
};

function countInCard(label) {
  const card = screen.getByText(label).parentElement;
  return within(card).getByRole('heading', { level: 6 }).textContent;
}

describe('Flight details roster — unpaired veterans (issue #214)', () => {
  beforeEach(() => {
    localStorage.clear();
    api.getFlightDetails.mockResolvedValue({
      flight: {
        name: 'May 2026',
        completed: false,
        flight_date: '2026-05-01',
        capacity: 40,
      },
      stats: {
        flight: { Alpha: 3, Bravo: 0, None: 0 },
        tours: { Alpha: 3, Bravo: 0, None: 0 },
        buses: { Alpha1: 3 },
      },
      pairs: [paired, unpaired, noFlyPair, crew],
    });
    api.getFlightAssignments.mockResolvedValue({
      counts: {
        veterans: 3,
        guardians: 3,
        veteransConfirmed: 3,
        guardiansConfirmed: 3,
        remaining: 10,
      },
    });
  });

  test('treats a veteran with no guardian as a status issue and filters with No guardian', async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pat Paired' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ned District' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Casey Crew' })).toBeInTheDocument();

    const umaRow = screen.getByRole('link', { name: 'Uma Unpaired' }).closest('tr');
    expect(within(umaRow).getByText('No Guardian')).toBeInTheDocument();
    expect(within(umaRow).queryByText('OK')).not.toBeInTheDocument();

    const patRow = screen.getByRole('link', { name: 'Pat Paired' }).closest('tr');
    expect(within(patRow).getByText('OK')).toBeInTheDocument();

    const nedRow = screen.getByRole('link', { name: 'Ned District' }).closest('tr');
    expect(within(nedRow).getByText('OK')).toBeInTheDocument();
    expect(within(nedRow).queryByText('No Guardian')).not.toBeInTheDocument();

    expect(countInCard('Needs Attention')).toBe('1');

    await user.click(screen.getByRole('button', { name: 'No guardian' }));

    expect(screen.getByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pat Paired' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ned District' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Casey Crew' })).not.toBeInTheDocument();
    expect(countInCard('In current view')).toBe('1');

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214'));
      expect(saved.noGuardianOnly).toBe(true);
    });

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));

    expect(await screen.findByRole('link', { name: 'Pat Paired' })).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214'));
      expect(saved.noGuardianOnly).toBe(false);
    });
  });

  test('Issues Only includes an otherwise complete unpaired veteran', async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();

    await user.click(screen.getByText('All Statuses'));
    await user.click(await screen.findByRole('option', { name: 'Issues Only' }));

    expect(screen.getByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pat Paired' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ned District' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Casey Crew' })).not.toBeInTheDocument();
  });
});
