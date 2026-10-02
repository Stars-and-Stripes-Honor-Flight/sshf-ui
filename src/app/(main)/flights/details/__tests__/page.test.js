import React, { Profiler } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { toast } from '@/components/core/toaster';
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

const mockCan = jest.fn(() => true);

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({
    can: (permission) => mockCan(permission),
    hasAccess: true,
    permissions: [],
  }),
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
    mockCan.mockImplementation(() => true);
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

  test('stops rendering once the roster is idle, including after No guardian toggles', async () => {
    const user = userEvent.setup();
    let commits = 0;
    render(
      <Profiler id="flight-roster" onRender={() => { commits += 1; }}>
        <Page />
      </Profiler>
    );

    expect(await screen.findByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();
    expect(screen.getByText('No Guardian')).toBeInTheDocument();

    async function waitUntilRenderIdle() {
      let previous = -1;
      let stablePolls = 0;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
        });
        if (commits === previous) {
          stablePolls += 1;
          if (stablePolls >= 3) {
            return commits;
          }
        } else {
          stablePolls = 0;
          previous = commits;
        }
      }
      throw new Error(`roster kept rendering (${commits} commits)`);
    }

    const settled = await waitUntilRenderIdle();
    await user.click(screen.getByRole('button', { name: 'No guardian' }));
    expect(screen.queryByRole('link', { name: 'Pat Paired' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'No guardian' }));
    expect(screen.getByRole('link', { name: 'Pat Paired' })).toBeInTheDocument();

    const afterToggle = await waitUntilRenderIdle();
    expect(afterToggle).toBeGreaterThanOrEqual(settled);
    expect(screen.getByText('No Guardian')).toBeInTheDocument();
  });
});

describe('Flight details roster — training preset (issue #212)', () => {
  const trainingDetails = {
    flight: {
      name: 'Oct 2026',
      completed: false,
      flight_date: '2026-10-10',
      capacity: 40,
    },
    stats: {
      flight: { Alpha: 2, Bravo: 0, None: 0 },
      tours: { Alpha: 2, Bravo: 0, None: 0 },
      buses: { Alpha2: 2 },
    },
    pairs: [
      {
        pairId: 'main-pair',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          veteran({
            id: 'vet-main',
            name_first: 'Dawn',
            name_last: 'Brust',
            name_middle: 'M',
            phone_mbl: '414-111-1111',
            birth_date: '1945-01-02',
          }),
          guardian({
            id: 'grd-main',
            name_first: 'Gail',
            name_last: 'Main',
            name_middle: 'Marie',
            phone_mbl: '414-327-5999',
            birth_date: '1969-05-07',
            training: 'Main',
            training_complete: false,
            flight_training_notes: 'Passport later',
            flight_waiver: true,
            flight_training_see_doc: true,
          }),
        ],
      },
      {
        pairId: 'web-pair',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          veteran({ id: 'vet-web', name_first: 'Wes', name_last: 'Webber' }),
          guardian({
            id: 'grd-web',
            name_first: 'Wendy',
            name_last: 'Web',
            training: 'Web',
            training_complete: true,
            flight_training_notes: '',
            flight_waiver: false,
            flight_training_see_doc: false,
          }),
        ],
      },
      {
        pairId: 'solo',
        busMismatch: false,
        missingPairedPerson: false,
        people: [veteran({ id: 'vet-solo', name_first: 'Uma', name_last: 'Unpaired' })],
      },
    ],
  };

  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    api.getFlightDetails.mockResolvedValue(trainingDetails);
    api.getFlightAssignments.mockResolvedValue({
      veterans: [],
      guardians: [],
      counts: { veterans: 0, guardians: 0 },
    });
    api.getGuardian = jest.fn().mockResolvedValue({
      _id: 'grd-main',
      _rev: '3-rev',
      type: 'Guardian',
      name: { first: 'Gail', last: 'Main', middle: 'Marie' },
      address: {
        street: '1 Main',
        city: 'Milwaukee',
        state: 'WI',
        zip: '53202',
        county: 'Milwaukee',
        phone_day: '414-555-0100',
        phone_mbl: '414-327-5999',
      },
      flight: {
        id: 'flight-214',
        bus: 'Alpha1',
        training: 'Main',
        training_complete: false,
        training_notes: 'Passport later',
        waiver: true,
        training_see_doc: true,
      },
    });
    api.updateGuardian = jest.fn().mockResolvedValue({ ok: true });
    api.getFlightDetails.mockResolvedValue(trainingDetails);
  });

  async function openTrainingPreset(user) {
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Columns' }));
    await user.click(await screen.findByRole('option', { name: 'Training' }));
  }

  test('selects the training preset, filters by type, and focuses on guardians', async () => {
    const user = userEvent.setup();
    await openTrainingPreset(user);

    expect(screen.getByRole('columnheader', { name: 'Training notes' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Gender' })).not.toBeInTheDocument();
    expect(localStorage.getItem('sshf-flight-detail-activity-preset')).toBe('training');

    expect(screen.getByRole('button', { name: 'Guardians focus' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('link', { name: 'Dawn Brust' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gail Main' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wendy Web' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Training type' }));
    expect(await screen.findByRole('option', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Web' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alt' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Web' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('link', { name: 'Gail Main' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wendy Web' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Uma Unpaired' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardians focus' }));
    expect(screen.getByRole('link', { name: 'Wes Webber' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Dawn Brust' })).not.toBeInTheDocument();
  });

  test('saves guardian training notes through the full guardian record', async () => {
    const user = userEvent.setup();
    await openTrainingPreset(user);

    const gailRow = screen.getByRole('link', { name: 'Gail Main' }).closest('tr');
    const notes = within(gailRow).getByRole('textbox', { name: 'Training notes' });
    await user.clear(notes);
    await user.type(notes, 'Passport after email');
    await user.tab();

    await waitFor(() => {
      expect(api.updateGuardian).toHaveBeenCalledWith(
        'grd-main',
        expect.objectContaining({
          _rev: '3-rev',
          name: expect.objectContaining({ first: 'Gail', last: 'Main', middle: 'Marie' }),
          flight: expect.objectContaining({
            training: 'Main',
            training_notes: 'Passport after email',
            training_complete: false,
            waiver: true,
          }),
        })
      );
    });

    const payload = api.updateGuardian.mock.calls[0][1];
    expect(payload.flight.history).toBeUndefined();
    expect(payload.metadata).toBeUndefined();
    expect(payload.address.phone_mbl).toBe('414-327-5999');
  });
});

function flightDetails(pairs) {
  return {
    flight: {
      name: 'May 2026',
      completed: false,
      flight_date: '2026-05-01',
      capacity: 40,
    },
    stats: {
      flight: { Alpha: 2, Bravo: 2, None: 0 },
      tours: { Alpha: 2, Bravo: 2, None: 0 },
      buses: { Alpha1: 1, Bravo1: 1, Bravo2: 1, None: 1 },
    },
    pairs,
  };
}

const busMismatchPairs = [
  {
    pairId: 'pair-alpha',
    busMismatch: true,
    missingPairedPerson: false,
    people: [
      veteran({ id: 'vet-alpha', name_first: 'Vic', name_last: 'Alpha', bus: 'Alpha1' }),
      guardian({ id: 'grd-bravo', name_first: 'Gina', name_last: 'Bravo', bus: 'Bravo2' }),
    ],
  },
  {
    pairId: 'pair-none',
    busMismatch: true,
    missingPairedPerson: false,
    people: [
      veteran({ id: 'vet-none', name_first: 'Ned', name_last: 'None', bus: 'None' }),
      guardian({ id: 'grd-bravo1', name_first: 'Bea', name_last: 'Bravo', bus: 'Bravo1' }),
    ],
  },
];

const fixedBusPairs = [
  {
    pairId: 'pair-alpha',
    busMismatch: false,
    missingPairedPerson: false,
    people: [
      veteran({ id: 'vet-alpha', name_first: 'Vic', name_last: 'Alpha', bus: 'Alpha1' }),
      guardian({ id: 'grd-bravo', name_first: 'Gina', name_last: 'Bravo', bus: 'Alpha1' }),
    ],
  },
  {
    pairId: 'pair-none',
    busMismatch: false,
    missingPairedPerson: false,
    people: [
      veteran({ id: 'vet-none', name_first: 'Ned', name_last: 'None', bus: 'Bravo1' }),
      guardian({ id: 'grd-bravo1', name_first: 'Bea', name_last: 'Bravo', bus: 'Bravo1' }),
    ],
  },
];

describe('Flight details — fix bus mismatches', () => {
  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    toast.success.mockClear();
    toast.error.mockClear();
    api.getFlightDetails.mockResolvedValue(flightDetails(busMismatchPairs));
    api.getFlightAssignments.mockResolvedValue({
      counts: {
        veterans: 2,
        guardians: 2,
        veteransConfirmed: 2,
        guardiansConfirmed: 2,
        remaining: 10,
      },
    });
    api.getVeteran = jest.fn(async (id) => ({
      _id: id,
      _rev: '5-rev',
      type: 'Veteran',
      name: { first: 'Ned', last: 'None' },
      flight: { id: 'flight-214', bus: 'None' },
    }));
    api.getGuardian = jest.fn(async (id) => ({
      _id: id,
      _rev: '3-rev',
      type: 'Guardian',
      name: { first: 'Gina', last: 'Bravo' },
      flight: { id: 'flight-214', bus: id === 'grd-bravo' ? 'Bravo2' : 'Bravo1' },
    }));
    api.updateVeteran = jest.fn().mockResolvedValue({ ok: true });
    api.updateGuardian = jest.fn().mockResolvedValue({ ok: true });
    api.fixBusMismatches = jest.fn();
  });

  async function openFixDialog(user) {
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Vic Alpha' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fix Bus Mismatches' }));
    expect(await screen.findByRole('heading', { name: 'Fix Bus Mismatches' })).toBeInTheDocument();
  }

  test('updates each changed person through the roster bus edit and refreshes the roster', async () => {
    const user = userEvent.setup();
    await openFixDialog(user);

    expect(screen.getByText('Bravo2 → Alpha1')).toBeInTheDocument();
    expect(screen.getByText('None → Bravo1')).toBeInTheDocument();

    const detailsCallsBefore = api.getFlightDetails.mock.calls.length;
    const assignmentCallsBefore = api.getFlightAssignments.mock.calls.length;
    api.getFlightDetails.mockResolvedValue(flightDetails(fixedBusPairs));

    await user.click(screen.getByRole('button', { name: 'Apply Fixes' }));

    await waitFor(() => {
      expect(api.updateGuardian).toHaveBeenCalledWith(
        'grd-bravo',
        expect.objectContaining({
          _rev: '3-rev',
          type: 'Guardian',
          flight: expect.objectContaining({ id: 'flight-214', bus: 'Alpha1' }),
        })
      );
    });
    expect(api.getGuardian).toHaveBeenCalledWith('grd-bravo');
    expect(api.updateVeteran).toHaveBeenCalledWith(
      'vet-none',
      expect.objectContaining({
        _rev: '5-rev',
        type: 'Veteran',
        flight: expect.objectContaining({ id: 'flight-214', bus: 'Bravo1' }),
      })
    );
    expect(api.getVeteran).toHaveBeenCalledWith('vet-none');
    expect(api.updateVeteran).toHaveBeenCalledTimes(1);
    expect(api.updateGuardian).toHaveBeenCalledTimes(1);
    expect(api.getVeteran).not.toHaveBeenCalledWith('vet-alpha');
    expect(api.getGuardian).not.toHaveBeenCalledWith('grd-bravo1');
    expect(api.fixBusMismatches).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(api.getFlightDetails.mock.calls.length).toBeGreaterThan(detailsCallsBefore);
      expect(api.getFlightAssignments.mock.calls.length).toBeGreaterThan(assignmentCallsBefore);
    });
    expect(api.getFlightDetails).toHaveBeenLastCalledWith('flight-214');
    expect(api.getFlightAssignments).toHaveBeenLastCalledWith('flight-214');
    expect(toast.success).toHaveBeenCalledWith('Bus mismatches fixed successfully');
    expect(screen.queryByRole('button', { name: 'Fix Bus Mismatches', hidden: true })).not.toBeInTheDocument();
  });

  test('shows an error toast and leaves the roster unchanged when a bus update fails', async () => {
    const user = userEvent.setup();
    api.updateGuardian.mockRejectedValue(new Error('Invalid bus'));
    await openFixDialog(user);

    const detailsCallsBefore = api.getFlightDetails.mock.calls.length;

    await user.click(screen.getByRole('button', { name: 'Apply Fixes' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to apply bus mismatch fixes. Please try again later.');
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(api.getFlightDetails.mock.calls.length).toBe(detailsCallsBefore);
    expect(screen.getByRole('button', { name: 'Apply Fixes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fix Bus Mismatches', hidden: true })).toBeInTheDocument();
  });
});

describe('Flight details permission gating', () => {
  beforeEach(() => {
    localStorage.clear();
    api.getFlightDetails.mockResolvedValue({
      flight: {
        name: 'May 2026',
        completed: false,
        flight_date: '2026-05-01',
        capacity: 40,
      },
      stats: { flight: {}, tours: {}, buses: {} },
      pairs: [paired],
    });
    api.getFlightAssignments.mockResolvedValue({
      counts: {
        veterans: 1,
        guardians: 1,
        veteransConfirmed: 1,
        guardiansConfirmed: 1,
        remaining: 10,
      },
    });
  });

  test('shows write and flight-management actions when those permissions are granted', async () => {
    mockCan.mockImplementation(() => true);
    render(<Page />);

    expect(await screen.findByRole('button', { name: 'Add Veterans from Waitlist' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export flight data' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Veteran seat assignment' })).toBeEnabled();
  });

  test('hides FULL-only actions and disables roster edits for a READ user', async () => {
    mockCan.mockImplementation((permission) => permission === 'records:read' || permission === 'exports:read');
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Pat Paired' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Veterans from Waitlist' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export flight data' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Veteran seat assignment' })).toBeDisabled();
  });
});
