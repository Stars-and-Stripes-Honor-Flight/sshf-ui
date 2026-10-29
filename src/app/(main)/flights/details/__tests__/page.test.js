import React, { Profiler } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { toast } from '@/components/core/toaster';
import { ACTIVITY_PRESET_STORAGE_KEY, ACTIVITY_PRESETS } from '@/components/main/flight/column-configs';
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
    getFlight: jest.fn().mockResolvedValue({
      _id: 'flight-214',
      _rev: '1-rev',
      type: 'Flight',
      name: 'May 2026',
      flight_date: '2026-05-01',
      capacity: 40,
      completed: false,
    }),
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
    veteran({ id: 'vet-paired', name_first: 'Pat', name_last: 'Paired', mail_call_received: true }),
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
    veteran({ id: 'vet-dc', name_first: 'Ned', name_last: 'District', mail_call_received: true }),
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

describe('Flight details roster — training preset (issue #212)', () => {
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

  test('shows mail call checkboxes and switches training headers with guardians focus', async () => {
    const user = userEvent.setup();
    const details = JSON.parse(JSON.stringify(trainingDetails));
    details.pairs[0].people[0].mail_call_received = true;
    details.pairs[0].people[0].mail_call_adopt = false;
    details.pairs[2].people[0].mail_call_received = false;
    details.pairs[2].people[0].mail_call_adopt = true;
    api.getFlightDetails.mockResolvedValue(details);

    await openTrainingPreset(user);

    expect(screen.getByRole('button', { name: 'Guardians focus' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('columnheader', { name: 'Training' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Training notes' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Mail Rcvd / Training' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Mail Adopt / Training Notes' })).not.toBeInTheDocument();

    const umaRow = screen.getByRole('link', { name: 'Uma Unpaired' }).closest('tr');
    expect(within(umaRow).getByRole('checkbox', { name: 'Mail call received' })).toBeEnabled();
    expect(within(umaRow).getByRole('checkbox', { name: 'Mail call received' })).not.toBeChecked();
    expect(within(umaRow).getByRole('checkbox', { name: 'Mail call adoption' })).toBeEnabled();
    expect(within(umaRow).getByRole('checkbox', { name: 'Mail call adoption' })).toBeChecked();

    const gailRow = screen.getByRole('link', { name: 'Gail Main' }).closest('tr');
    expect(within(gailRow).getByText('Main')).toBeInTheDocument();
    expect(within(gailRow).getByRole('checkbox', { name: 'Training complete' })).toBeEnabled();
    expect(within(gailRow).getByRole('checkbox', { name: 'Training complete' })).not.toBeChecked();
    expect(within(gailRow).getByRole('textbox', { name: 'Training notes' })).toHaveValue('Passport later');
    expect(within(gailRow).queryByRole('checkbox', { name: 'Mail call received' })).not.toBeInTheDocument();
    expect(within(gailRow).queryByRole('checkbox', { name: 'Mail call adoption' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardians focus' }));

    expect(screen.getByRole('button', { name: 'Guardians focus' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('columnheader', { name: 'Mail Rcvd / Training' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mail Adopt / Training Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Training' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Training notes' })).not.toBeInTheDocument();

    const dawnRow = screen.getByRole('link', { name: 'Dawn Brust' }).closest('tr');
    const dawnReceived = within(dawnRow).getByRole('checkbox', { name: 'Mail call received' });
    const dawnAdopt = within(dawnRow).getByRole('checkbox', { name: 'Mail call adoption' });
    expect(dawnReceived).toBeChecked();
    expect(dawnReceived).toBeEnabled();
    expect(dawnAdopt).not.toBeChecked();
    expect(dawnAdopt).toBeEnabled();
    expect(dawnReceived.closest('td')).toHaveTextContent('');
    expect(dawnAdopt.closest('td')).toHaveTextContent('');
    expect(within(dawnRow).queryByRole('checkbox', { name: 'Training complete' })).not.toBeInTheDocument();
    expect(within(dawnRow).queryByRole('textbox', { name: 'Training notes' })).not.toBeInTheDocument();

    expect(within(gailRow).getByRole('checkbox', { name: 'Training complete' })).toBeEnabled();
    expect(within(gailRow).getByRole('textbox', { name: 'Training notes' })).toHaveValue('Passport later');
  });
});

describe('Flight details roster — training checkboxes (issue #277)', () => {
  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    api.getFlightDetails.mockResolvedValue(trainingDetails);
    api.getFlightAssignments.mockResolvedValue({
      veterans: [],
      guardians: [],
      counts: { veterans: 0, guardians: 0 },
    });
    api.updateGuardianWaiver = jest.fn().mockResolvedValue({ ok: true });
    api.updateGuardianTrainingSeeDoc = jest.fn().mockResolvedValue({ ok: true });
    api.updateVeteranMailCallReceived = jest.fn().mockResolvedValue({ ok: true });
    api.updateVeteranMailCallAdopt = jest.fn().mockResolvedValue({ ok: true });
    api.getVeteran = jest.fn();
    api.getGuardian = jest.fn();
    api.updateVeteran = jest.fn();
    api.updateGuardian = jest.fn();
  });

  async function openTrainingPreset(user) {
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Uma Unpaired' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Columns' }));
    await user.click(await screen.findByRole('option', { name: 'Training' }));
    await user.click(screen.getByRole('button', { name: 'Guardians focus' }));
  }

  test('saves waiver, see doc, and mail call flags through dedicated PATCH endpoints', async () => {
    const user = userEvent.setup();
    await openTrainingPreset(user);

    const dawnRow = screen.getByRole('link', { name: 'Dawn Brust' }).closest('tr');
    await user.click(within(dawnRow).getByRole('checkbox', { name: 'Mail call received' }));
    await user.click(within(dawnRow).getByRole('checkbox', { name: 'Mail call adoption' }));

    const gailRow = screen.getByRole('link', { name: 'Gail Main' }).closest('tr');
    await user.click(within(gailRow).getByRole('checkbox', { name: 'Waiver' }));
    await user.click(within(gailRow).getByRole('checkbox', { name: 'See doc' }));

    await waitFor(() => {
      expect(api.updateVeteranMailCallReceived).toHaveBeenCalledWith('vet-main', true);
      expect(api.updateVeteranMailCallAdopt).toHaveBeenCalledWith('vet-main', true);
      expect(api.updateGuardianWaiver).toHaveBeenCalledWith('grd-main', false);
      expect(api.updateGuardianTrainingSeeDoc).toHaveBeenCalledWith('grd-main', false);
    });
    expect(api.getVeteran).not.toHaveBeenCalled();
    expect(api.getGuardian).not.toHaveBeenCalled();
    expect(api.updateVeteran).not.toHaveBeenCalled();
    expect(api.updateGuardian).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Mail call received updated');
    expect(toast.success).toHaveBeenCalledWith('Mail call adoption updated');
    expect(toast.success).toHaveBeenCalledWith('Waiver updated');
    expect(toast.success).toHaveBeenCalledWith('See doc updated');
  });
});

describe('Flight details roster — apparel notes (issue #275)', () => {
  const apparelDetails = {
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
        pairId: 'apparel-pair',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          veteran({
            id: 'vet-apparel',
            name_first: 'Vic',
            name_last: 'Veteran',
            apparel_shirt_size: 'L',
            apparel_jacket_size: 'L',
            apparel_notes: 'Needs tall sizes',
          }),
          guardian({
            id: 'grd-apparel',
            name_first: 'Gina',
            name_last: 'Guardian',
            apparel_shirt_size: 'M',
            apparel_jacket_size: 'M',
            apparel_notes: 'Exchange jacket',
          }),
        ],
      },
    ],
  };

  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    api.getFlightDetails.mockResolvedValue(apparelDetails);
    api.getFlightAssignments.mockResolvedValue({
      veterans: [],
      guardians: [],
      counts: { veterans: 0, guardians: 0 },
    });
    api.updateVeteranApparelNotes = jest.fn().mockResolvedValue({ ok: true });
    api.updateGuardianApparelNotes = jest.fn().mockResolvedValue({ ok: true });
    api.updateVeteranApparelShirtSize = jest.fn().mockResolvedValue({ ok: true });
    api.updateGuardianApparelShirtSize = jest.fn().mockResolvedValue({ ok: true });
    api.updateVeteranApparelJacketSize = jest.fn().mockResolvedValue({ ok: true });
    api.updateGuardianApparelJacketSize = jest.fn().mockResolvedValue({ ok: true });
    api.getVeteran = jest.fn();
    api.getGuardian = jest.fn();
    api.updateVeteran = jest.fn();
    api.updateGuardian = jest.fn();
  });

  async function openApparelPreset(user) {
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Vic Veteran' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Columns' }));
    await user.click(await screen.findByRole('option', { name: 'Apparel' }));
    expect(screen.getByRole('columnheader', { name: 'Notes' })).toBeInTheDocument();
  }

  test('saves apparel shirt and jacket sizes through dedicated PATCH endpoints', async () => {
    const user = userEvent.setup();
    await openApparelPreset(user);

    const veteranRow = screen.getByRole('link', { name: 'Vic Veteran' }).closest('tr');
    await user.click(within(veteranRow).getByRole('combobox', { name: 'Shirt size' }));
    await user.click(await screen.findByRole('option', { name: 'XL' }));

    const guardianRow = screen.getByRole('link', { name: 'Gina Guardian' }).closest('tr');
    await user.click(within(guardianRow).getByRole('combobox', { name: 'Jacket size' }));
    await user.click(await screen.findByRole('option', { name: '2XL' }));

    await waitFor(() => {
      expect(api.updateVeteranApparelShirtSize).toHaveBeenCalledWith('vet-apparel', 'XL');
      expect(api.updateGuardianApparelJacketSize).toHaveBeenCalledWith('grd-apparel', '2XL');
    });
    expect(api.getVeteran).not.toHaveBeenCalled();
    expect(api.getGuardian).not.toHaveBeenCalled();
    expect(api.updateVeteran).not.toHaveBeenCalled();
    expect(api.updateGuardian).not.toHaveBeenCalled();
  });

  test('saves veteran and guardian apparel notes through dedicated PATCH endpoints', async () => {
    const user = userEvent.setup();
    await openApparelPreset(user);

    const veteranRow = screen.getByRole('link', { name: 'Vic Veteran' }).closest('tr');
    const veteranNotes = within(veteranRow).getByRole('textbox', { name: 'Apparel notes' });
    expect(veteranNotes.tagName).toBe('TEXTAREA');
    await user.clear(veteranNotes);
    await user.type(veteranNotes, 'Ordered 10/21');
    await user.tab();

    const guardianRow = screen.getByRole('link', { name: 'Gina Guardian' }).closest('tr');
    const guardianNotes = within(guardianRow).getByRole('textbox', { name: 'Apparel notes' });
    await user.clear(guardianNotes);
    await user.type(guardianNotes, 'Shipped 10/22');
    await user.tab();

    await waitFor(() => {
      expect(api.updateVeteranApparelNotes).toHaveBeenCalledWith('vet-apparel', 'Ordered 10/21');
      expect(api.updateGuardianApparelNotes).toHaveBeenCalledWith('grd-apparel', 'Shipped 10/22');
    });
    expect(api.getVeteran).not.toHaveBeenCalled();
    expect(api.getGuardian).not.toHaveBeenCalled();
    expect(api.updateVeteran).not.toHaveBeenCalled();
    expect(api.updateGuardian).not.toHaveBeenCalled();
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

describe('Flight details roster — plane filter and seat sort (issue #259)', () => {
  const multiPlanePairs = [
    {
      pairId: 'alpha-seat',
      busMismatch: false,
      missingPairedPerson: false,
      people: [
        veteran({
          id: 'vet-alpha',
          name_first: 'Al',
          name_last: 'Alpha',
          bus: 'Alpha1',
          seat: '4A',
        }),
        guardian({ id: 'grd-alpha', name_first: 'G', name_last: 'Alpha' }),
      ],
    },
    {
      pairId: 'bravo-seat',
      busMismatch: false,
      missingPairedPerson: false,
      people: [
        veteran({
          id: 'vet-bravo',
          name_first: 'Bea',
          name_last: 'Bravo',
          bus: 'Bravo1',
          seat: '4A',
        }),
        guardian({ id: 'grd-bravo', name_first: 'G', name_last: 'Bravo', bus: 'Bravo1' }),
      ],
    },
    {
      pairId: 'alpha-only-bus',
      busMismatch: false,
      missingPairedPerson: false,
      people: [
        veteran({
          id: 'vet-alpha2',
          name_first: 'Cy',
          name_last: 'Alpha',
          bus: 'Alpha2',
          seat: '1A',
        }),
      ],
    },
  ];

  const alphaOnlyPairs = [
    {
      pairId: 'solo-alpha',
      busMismatch: false,
      missingPairedPerson: false,
      people: [
        veteran({
          id: 'vet-solo',
          name_first: 'Solo',
          name_last: 'Alpha',
          bus: 'Alpha1',
          seat: '2A',
        }),
      ],
    },
  ];

  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    api.getFlightAssignments.mockResolvedValue({
      counts: { veterans: 3, guardians: 2, remaining: 10 },
    });
  });

  test('shows Plane filter on multi-plane flights, filters roster, and persists setting', async () => {
    const user = userEvent.setup();
    api.getFlightDetails.mockResolvedValue(flightDetails(multiPlanePairs));

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Al Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Plane' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Plane' }));
    await user.click(await screen.findByRole('option', { name: 'Bravo' }));

    expect(screen.queryByRole('link', { name: 'Al Alpha' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bea Bravo' })).toBeInTheDocument();
    expect(countInCard('In current view')).toBe('1');

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214'));
      expect(saved.planeFilter).toBe('Bravo');
    });
  });

  test('hides Plane filter when the flight has only one plane', async () => {
    api.getFlightDetails.mockResolvedValue({
      ...flightDetails(alphaOnlyPairs),
      pairs: alphaOnlyPairs,
    });

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Solo Alpha' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Plane' })).not.toBeInTheDocument();
  });

  test('sort by seat groups Alpha before Bravo when seat numbers match', async () => {
    const user = userEvent.setup();
    api.getFlightDetails.mockResolvedValue(flightDetails(multiPlanePairs));

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Al Alpha' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await user.click(await screen.findByRole('option', { name: 'Seat' }));

    const links = screen.getAllByRole('link').map((node) => node.textContent);
    const rosterNames = links.filter((name) =>
      ['Al Alpha', 'Bea Bravo', 'Cy Alpha'].includes(name)
    );
    expect(rosterNames).toEqual(['Cy Alpha', 'Al Alpha', 'Bea Bravo']);
  });

  test('Reset filters clears the plane filter', async () => {
    const user = userEvent.setup();
    api.getFlightDetails.mockResolvedValue(flightDetails(multiPlanePairs));

    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Al Alpha' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Plane' }));
    await user.click(await screen.findByRole('option', { name: 'Alpha' }));
    expect(screen.queryByRole('link', { name: 'Bea Bravo' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));

    expect(await screen.findByRole('link', { name: 'Bea Bravo' })).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214'));
      expect(saved.planeFilter).toBe('all');
    });
  });
});

describe('Flight details roster — Med Exp. Ops column (issue #260)', () => {
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
      stats: { flight: {}, tours: {}, buses: {} },
      pairs: [
        {
          pairId: 'pair-a',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            veteran({ id: 'vet-a', name_first: 'Ann', name_last: 'Alpha' }),
            guardian({ id: 'grd-a', name_first: 'Gina', name_last: 'Alpha', med_exprnc: 'Nurse' }),
          ],
        },
        {
          pairId: 'pair-b',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            veteran({ id: 'vet-b', name_first: 'Bob', name_last: 'Beta' }),
            guardian({ id: 'grd-b', name_first: 'Glen', name_last: 'Beta', med_exprnc: 'false' }),
          ],
        },
      ],
    });
    api.getFlightAssignments.mockResolvedValue({
      counts: { veterans: 2, guardians: 2, remaining: 10 },
    });
  });

  test('shows combined Flt Grp / Med Exp column in Ops layout', async () => {
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Ann Alpha' })).toBeInTheDocument();
    expect(screen.getByText('Flt Grp / Med Exp')).toBeInTheDocument();

    const ginaRow = screen.getByRole('link', { name: 'Gina Alpha' }).closest('tr');
    expect(within(ginaRow).getByText('Nurse')).toBeInTheDocument();

    const glenRow = screen.getByRole('link', { name: 'Glen Beta' }).closest('tr');
    expect(within(glenRow).getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  test('offers Med Exp. sort and persists the selection', async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Ann Alpha' })).toBeInTheDocument();

    await user.click(screen.getByLabelText('Sort by'));
    await user.click(await screen.findByRole('option', { name: 'Med Exp.' }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214'));
      expect(saved.sortBy).toBe('medExprnc');
    });
  });

  test('loads persisted Med Exp. sort from storage', async () => {
    localStorage.setItem(
      'sshf.flightRosterControls.v1.flight-214',
      JSON.stringify({
        version: 1,
        sortBy: 'medExprnc',
        nameFilter: '',
        statusFilter: 'all',
        busFilter: 'all',
        assignedCallerFilter: 'all',
      })
    );

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Ann Alpha' })).toBeInTheDocument();
    expect(screen.getByLabelText('Sort by')).toHaveTextContent('Med Exp.');
  });
});

describe('Flight details roster — Med Lvl column (issue #264)', () => {
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
      stats: { flight: {}, tours: {}, buses: {} },
      pairs: [
        {
          pairId: 'pair-a',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            veteran({
              id: 'vet-a',
              name_first: 'Ann',
              name_last: 'Alpha',
              med_limits: '[2/3] Uses walker',
              medical_level: 'Level 1',
            }),
            guardian({
              id: 'grd-a',
              name_first: 'Gina',
              name_last: 'Alpha',
              medical_level: 'C',
            }),
          ],
        },
      ],
    });
    api.getFlightAssignments.mockResolvedValue({
      counts: { veterans: 1, guardians: 1, remaining: 10 },
    });
  });

  test('shows Med Lvl on veteran and guardian rows in the Ops layout', async () => {
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Ann Alpha' })).toBeInTheDocument();
    expect(screen.getByText('Med Lvl')).toBeInTheDocument();

    const annRow = screen.getByRole('link', { name: 'Ann Alpha' }).closest('tr');
    expect(within(annRow).getByText('[2/3]')).toBeInTheDocument();
    expect(within(annRow).queryByText('Level 1')).not.toBeInTheDocument();
    expect(within(annRow).queryByText(/Uses walker/)).not.toBeInTheDocument();

    const ginaRow = screen.getByRole('link', { name: 'Gina Alpha' }).closest('tr');
    expect(within(ginaRow).getByText('C')).toBeInTheDocument();
  });

  test('does not add a Med Lvl sort option', async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Ann Alpha' })).toBeInTheDocument();
    await user.click(screen.getByLabelText('Sort by'));

    expect(screen.queryByRole('option', { name: 'Med Lvl' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Med Exp.' })).toBeInTheDocument();
  });

  test('Medical layout still uses Med Notes / Med Experience', async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Ann Alpha' })).toBeInTheDocument();
    await user.click(screen.getByLabelText('Columns'));
    await user.click(await screen.findByRole('option', { name: 'Medical' }));

    expect(screen.getByText('Med Notes / Med Experience')).toBeInTheDocument();
    expect(screen.queryByText('Med Lvl')).not.toBeInTheDocument();
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

function flightDocument({ completed }) {
  return {
    _id: 'flight-214',
    _rev: '1-rev',
    type: 'Flight',
    name: 'May 2026',
    flight_date: '2026-05-01',
    capacity: 40,
    completed,
  };
}

// Detail metadata matches FlightDetailResult: name, date, and capacity only.
// The completed flag lives on the flight document, the same boolean the list uses.
const detailWithoutCompletedFlag = {
  flight: {
    id: 'flight-214',
    name: 'May 2026',
    flight_date: '2026-05-01',
    capacity: 40,
  },
  stats: { flight: {}, tours: {}, buses: {} },
  pairs: [],
};

describe('Flight details header status (issue #242)', () => {
  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    api.getFlight.mockClear();
    api.getFlightDetails.mockResolvedValue(detailWithoutCompletedFlag);
    api.getFlightAssignments.mockResolvedValue({
      counts: { veterans: 0, guardians: 0, remaining: 40 },
    });
  });

  function headerStatus(name) {
    const title = screen.getByRole('heading', { level: 4, name });
    return title.parentElement;
  }

  test('shows Completed next to the flight name when the flight document is completed', async () => {
    api.getFlight.mockResolvedValue(flightDocument({ completed: true }));

    render(<Page />);

    expect(await screen.findByRole('heading', { level: 4, name: 'May 2026' })).toBeInTheDocument();
    expect(within(headerStatus('May 2026')).getByText('Completed')).toBeInTheDocument();
    expect(within(headerStatus('May 2026')).queryByText('Active')).not.toBeInTheDocument();
    expect(api.getFlight).toHaveBeenCalledWith('flight-214');
  });

  test('shows Active next to the flight name when the flight document is not completed', async () => {
    api.getFlight.mockResolvedValue(flightDocument({ completed: false }));

    render(<Page />);

    expect(await screen.findByRole('heading', { level: 4, name: 'May 2026' })).toBeInTheDocument();
    expect(within(headerStatus('May 2026')).getByText('Active')).toBeInTheDocument();
    expect(within(headerStatus('May 2026')).queryByText('Completed')).not.toBeInTheDocument();
    expect(api.getFlight).toHaveBeenCalledWith('flight-214');
  });
});

describe('Add Veterans from Waitlist on completed flights (issue #257)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockCan.mockImplementation(() => true);
    api.getFlightDetails.mockResolvedValue({
      flight: {
        name: 'May 2026',
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

  test('disables the waitlist button when the flight document completed is true', async () => {
    api.getFlight.mockResolvedValue(flightDocument({ completed: true }));

    render(<Page />);

    const button = await screen.findByRole('button', { name: 'Add Veterans from Waitlist' });
    expect(button).toBeDisabled();
    expect(screen.queryByRole('dialog', { name: 'Add Veterans from Waitlist' })).not.toBeInTheDocument();
  });

  test('disables the waitlist button when the flight document completed is legacy string true', async () => {
    api.getFlight.mockResolvedValue(flightDocument({ completed: 'true' }));

    render(<Page />);

    const button = await screen.findByRole('button', { name: 'Add Veterans from Waitlist' });
    expect(button).toBeDisabled();
    expect(screen.queryByRole('dialog', { name: 'Add Veterans from Waitlist' })).not.toBeInTheDocument();
  });

  test('enables the waitlist button on an open flight and opens the add dialog on click', async () => {
    const user = userEvent.setup();
    api.getFlight.mockResolvedValue(flightDocument({ completed: false }));

    render(<Page />);

    const button = await screen.findByRole('button', { name: 'Add Veterans from Waitlist' });
    expect(button).toBeEnabled();
    await user.click(button);
    expect(await screen.findByRole('dialog', { name: 'Add Veterans from Waitlist' })).toBeInTheDocument();
  });

  test('hides the waitlist button for users without flight management permission on a completed flight', async () => {
    mockCan.mockImplementation((permission) => permission === 'records:read' || permission === 'exports:read');
    api.getFlight.mockResolvedValue(flightDocument({ completed: true }));

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Pat Paired' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Veterans from Waitlist' })).not.toBeInTheDocument();
  });
});

describe('Print guardian list (issue #262)', () => {
  beforeEach(() => {
    localStorage.clear();
    api.getFlightDetails.mockResolvedValue({
      flight: {
        name: 'May 2026',
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

  test('shows Print guardian list to a records:read user without exports:read', async () => {
    mockCan.mockImplementation((permission) => permission === 'records:read');
    api.getFlight.mockResolvedValue(flightDocument({ completed: false }));

    render(<Page />);

    expect(await screen.findByRole('button', { name: 'Print guardian list' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export flight data' })).not.toBeInTheDocument();
  });

  test('keeps Print guardian list enabled on a completed flight', async () => {
    mockCan.mockImplementation(() => true);
    api.getFlight.mockResolvedValue(flightDocument({ completed: true }));

    render(<Page />);

    expect(await screen.findByRole('button', { name: 'Print guardian list' })).toBeEnabled();
  });

  test('opens the print dialog from the participants actions', async () => {
    const user = userEvent.setup();
    mockCan.mockImplementation(() => true);
    api.getFlight.mockResolvedValue(flightDocument({ completed: false }));

    render(<Page />);

    await user.click(await screen.findByRole('button', { name: 'Print guardian list' }));
    expect(await screen.findByRole('dialog', { name: 'Print guardian list' })).toBeInTheDocument();
  });
});

const completedRosterPairs = [
  {
    pairId: 'completed-pair',
    busMismatch: false,
    missingPairedPerson: false,
    people: [
      veteran({
        id: 'vet-done',
        name_first: 'Vic',
        name_last: 'Done',
        bus: 'Alpha1',
        seat: '1A',
        assigned_to: 'Karyn',
        apparel_shirt_size: 'L',
        apparel_jacket_size: 'L',
        apparel_notes: 'Tall',
        name_middle: 'Alan',
        phone_mbl: '414-555-0101',
        mail_call_received: true,
        mail_call_adopt: false,
      }),
      guardian({
        id: 'grd-done',
        name_first: 'Gina',
        name_last: 'Done',
        bus: 'Alpha1',
        seat: '1B',
        assigned_to: 'Karyn',
        apparel_shirt_size: 'M',
        apparel_jacket_size: 'M',
        apparel_notes: 'Exchange',
        name_middle: 'Marie',
        phone_mbl: '414-555-0102',
        training: 'Main',
        training_complete: true,
        flight_training_notes: 'Bring forms',
        flight_waiver: true,
        flight_training_see_doc: false,
      }),
    ],
  },
  {
    pairId: 'completed-unpaired',
    busMismatch: false,
    missingPairedPerson: true,
    people: [
      veteran({
        id: 'vet-solo',
        name_first: 'Uma',
        name_last: 'Solo',
        bus: 'Alpha2',
        seat: '2A',
        assigned_to: 'Karyn',
        apparel_shirt_size: 'S',
        apparel_jacket_size: 'S',
        apparel_notes: '',
        name_middle: 'Lee',
        phone_mbl: '414-555-0199',
      }),
    ],
  },
];

async function chooseColumns(user, label) {
  await user.click(screen.getByRole('combobox', { name: 'Columns' }));
  await user.click(await screen.findByRole('option', { name: label }));
}

describe('Completed flight roster edits (issue #286)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockCan.mockImplementation(() => true);
    api.getFlightDetails.mockResolvedValue({
      flight: {
        name: 'May 2026',
        flight_date: '2026-05-01',
        capacity: 40,
      },
      stats: { flight: {}, tours: {}, buses: {} },
      pairs: completedRosterPairs,
    });
    api.getFlightAssignments.mockResolvedValue({
      counts: {
        veterans: 2,
        guardians: 1,
        veteransConfirmed: 2,
        guardiansConfirmed: 1,
        remaining: 10,
      },
    });
  });

  test('disables inline edits in every column layout and keeps view, sort, filter, and print', async () => {
    const user = userEvent.setup();
    api.getFlight.mockResolvedValue(flightDocument({ completed: true }));

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Vic Done' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gina Done' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uma Solo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Guardian' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Columns' })).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeEnabled();
    expect(screen.getByPlaceholderText('Search by name, phone, or city...')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Print guardian list' })).toBeEnabled();

    const vicRow = () => screen.getByRole('link', { name: 'Vic Done' }).closest('tr');
    const ginaRow = () => screen.getByRole('link', { name: 'Gina Done' }).closest('tr');

    expect(within(vicRow()).getByRole('textbox', { name: 'Veteran seat assignment' })).toBeDisabled();
    expect(within(vicRow()).getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
    expect(within(ginaRow()).getByRole('textbox', { name: 'Guardian seat assignment' })).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await user.click(await screen.findByRole('option', { name: 'Seat' }));
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Seat');
    expect(screen.getByRole('link', { name: 'Vic Done' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search by name, phone, or city...'), 'Solo');
    expect(screen.getByRole('link', { name: 'Uma Solo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Vic Done' })).not.toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText('Search by name, phone, or city...'));
    expect(await screen.findByRole('link', { name: 'Vic Done' })).toBeInTheDocument();

    await chooseColumns(user, 'Caller');
    expect(within(vicRow()).getByRole('textbox')).toBeDisabled();

    await chooseColumns(user, 'Medical');
    expect(screen.getByRole('columnheader', { name: 'Med Notes / Med Experience' })).toBeInTheDocument();
    const medicalTable = screen.getByRole('table');
    expect(within(medicalTable).queryAllByRole('textbox')).toHaveLength(0);
    expect(within(medicalTable).queryAllByRole('combobox')).toHaveLength(0);
    expect(within(medicalTable).queryAllByRole('checkbox')).toHaveLength(0);

    await chooseColumns(user, 'Apparel');
    const apparelTable = screen.getByRole('table');
    expect(within(apparelTable).getAllByRole('textbox', { name: 'Apparel notes' })).toHaveLength(3);
    within(apparelTable).getAllByRole('textbox', { name: 'Apparel notes' }).forEach((field) => {
      expect(field).toBeDisabled();
    });
    within(apparelTable).getAllByRole('combobox', { name: 'Shirt size' }).forEach((field) => {
      expect(field).toHaveAttribute('aria-disabled', 'true');
    });
    within(apparelTable).getAllByRole('combobox', { name: 'Jacket size' }).forEach((field) => {
      expect(field).toHaveAttribute('aria-disabled', 'true');
    });

    await chooseColumns(user, 'Training');
    await user.click(screen.getByRole('button', { name: 'Guardians focus' }));
    expect(screen.getByRole('button', { name: 'Guardians focus' })).toHaveAttribute('aria-pressed', 'false');
    screen.getAllByRole('textbox', { name: 'Middle name' }).forEach((field) => {
      expect(field).toBeDisabled();
    });
    screen.getAllByRole('textbox', { name: 'Mobile phone' }).forEach((field) => {
      expect(field).toBeDisabled();
    });
    expect(screen.getByRole('checkbox', { name: 'Training complete' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Training notes' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Waiver' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'See doc' })).toBeDisabled();
    expect(within(vicRow()).getByRole('checkbox', { name: 'Mail call received' })).toBeDisabled();
    expect(within(vicRow()).getByRole('checkbox', { name: 'Mail call adoption' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Gina Done' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vic Done' })).toBeInTheDocument();
  });

  test('disables roster edits when the flight document completed flag is the legacy string true', async () => {
    api.getFlight.mockResolvedValue(flightDocument({ completed: 'true' }));

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Vic Done' })).toBeInTheDocument();
    const vicRow = screen.getByRole('link', { name: 'Vic Done' }).closest('tr');
    expect(within(vicRow).getByRole('textbox', { name: 'Veteran seat assignment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Print guardian list' })).toBeEnabled();
  });
});

describe('Flight details column layout persistence (issue #286)', () => {
  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    api.getFlight.mockResolvedValue(flightDocument({ completed: false }));
    api.getFlightDetails.mockResolvedValue({
      flight: {
        name: 'May 2026',
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

  test('mounting does not overwrite a saved column layout with the default', async () => {
    const user = userEvent.setup();
    localStorage.setItem(ACTIVITY_PRESET_STORAGE_KEY, ACTIVITY_PRESETS.APPAREL);

    render(
      <React.StrictMode>
        <Page />
      </React.StrictMode>
    );

    expect(await screen.findByRole('link', { name: 'Pat Paired' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Columns' })).toHaveTextContent('Apparel');
    expect(localStorage.getItem(ACTIVITY_PRESET_STORAGE_KEY)).toBe(ACTIVITY_PRESETS.APPAREL);

    await user.click(screen.getByRole('combobox', { name: 'Columns' }));
    await user.click(await screen.findByRole('option', { name: 'Caller' }));
    expect(localStorage.getItem(ACTIVITY_PRESET_STORAGE_KEY)).toBe(ACTIVITY_PRESETS.CALLER);
  });
});

function mailCallDetails() {
  return {
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
    pairs: [
      {
        pairId: 'missing',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          veteran({
            id: 'vet-zeta',
            name_first: 'Zoe',
            name_last: 'Zeta',
            mail_call_received: false,
            mail_call_adopt: false,
            mail_call_notes: 'Call Tuesday',
          }),
          guardian({
            id: 'grd-zeta',
            name_first: 'Gary',
            name_last: 'Zeta',
            training: 'Main',
            training_complete: true,
          }),
        ],
      },
      {
        pairId: 'received',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          veteran({
            id: 'vet-apple',
            name_first: 'Ann',
            name_last: 'Apple',
            mail_call_received: true,
            mail_call_adopt: true,
            mail_call_notes: 'Delivered',
          }),
          guardian({
            id: 'grd-apple',
            name_first: 'Gail',
            name_last: 'Apple',
            training: 'Main',
            training_complete: true,
          }),
        ],
      },
      {
        pairId: 'crew',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          guardian({
            id: 'grd-crew',
            name_first: 'Casey',
            name_last: 'Crew',
            training: 'Main',
            training_complete: true,
          }),
        ],
      },
      {
        pairId: 'solo',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          veteran({
            id: 'vet-solo',
            name_first: 'Uma',
            name_last: 'Solo',
            mail_call_received: false,
          }),
        ],
      },
    ],
  };
}

describe('Flight details roster — mail call layout (issue #284)', () => {
  beforeEach(() => {
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    toast.success.mockClear();
    toast.error.mockClear();
    api.getFlight.mockResolvedValue(flightDocument({ completed: false }));
    api.getFlightDetails.mockResolvedValue(mailCallDetails());
    api.getFlightAssignments.mockResolvedValue({
      counts: {
        veterans: 3,
        guardians: 3,
        veteransConfirmed: 3,
        guardiansConfirmed: 3,
        remaining: 10,
      },
    });
    api.updateVeteranMailCallReceived = jest.fn().mockResolvedValue({ ok: true });
    api.updateVeteranMailCallAdopt = jest.fn().mockResolvedValue({ ok: true });
    api.updateVeteranMailCallNotes = jest.fn().mockResolvedValue({ ok: true });
    api.getVeteran = jest.fn();
    api.getGuardian = jest.fn();
    api.updateVeteran = jest.fn();
    api.updateGuardian = jest.fn();
  });

  async function openMailCall(user) {
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();
    await chooseColumns(user, 'Mail Call');
  }

  test('shows the Mail Call layout and remembers it', async () => {
    const user = userEvent.setup();
    await openMailCall(user);

    expect(screen.getByRole('columnheader', { name: /^Mail Rcvd$/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^Mail Adopt$/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^Mail Call Notes$/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Columns' })).toHaveTextContent('Mail Call');
    expect(localStorage.getItem(ACTIVITY_PRESET_STORAGE_KEY)).toBe('mailcall');

    const zoeRow = screen.getByRole('link', { name: 'Zoe Zeta' }).closest('tr');
    expect(within(zoeRow).getByRole('checkbox', { name: 'Mail call received' })).toBeEnabled();
    expect(within(zoeRow).getByRole('checkbox', { name: 'Mail call received' })).not.toBeChecked();
    expect(within(zoeRow).getByRole('checkbox', { name: 'Mail call adoption' })).toBeEnabled();
    expect(within(zoeRow).getByRole('textbox', { name: 'Mail call notes' })).toHaveValue('Call Tuesday');

    const garyRow = screen.getByRole('link', { name: 'Gary Zeta' }).closest('tr');
    expect(within(garyRow).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(within(garyRow).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(garyRow).getAllByText('—')).toHaveLength(3);
  });

  test('restores the Mail Call layout after leaving the flight', async () => {
    localStorage.setItem(ACTIVITY_PRESET_STORAGE_KEY, 'mailcall');

    render(
      <React.StrictMode>
        <Page />
      </React.StrictMode>
    );

    expect(await screen.findByRole('columnheader', { name: /^Mail Rcvd$/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Columns' })).toHaveTextContent('Mail Call');
    expect(localStorage.getItem(ACTIVITY_PRESET_STORAGE_KEY)).toBe('mailcall');
  });

  test('saves received and adopt through the training PATCH methods, once each, and refreshes', async () => {
    const user = userEvent.setup();
    await openMailCall(user);

    const detailsBefore = api.getFlightDetails.mock.calls.length;
    const assignmentsBefore = api.getFlightAssignments.mock.calls.length;
    const zoeRow = screen.getByRole('link', { name: 'Zoe Zeta' }).closest('tr');
    await user.click(within(zoeRow).getByRole('checkbox', { name: 'Mail call received' }));

    await waitFor(() => {
      expect(api.updateVeteranMailCallReceived).toHaveBeenCalledWith('vet-zeta', true);
      expect(api.getFlightDetails).toHaveBeenCalledTimes(detailsBefore + 1);
      expect(api.getFlightAssignments).toHaveBeenCalledTimes(assignmentsBefore + 1);
    });
    expect(toast.success.mock.calls.filter(([message]) => message === 'Mail call received updated')).toHaveLength(1);

    await user.click(within(zoeRow).getByRole('checkbox', { name: 'Mail call adoption' }));

    await waitFor(() => {
      expect(api.updateVeteranMailCallAdopt).toHaveBeenCalledWith('vet-zeta', true);
      expect(api.getFlightDetails).toHaveBeenCalledTimes(detailsBefore + 2);
      expect(api.getFlightAssignments).toHaveBeenCalledTimes(assignmentsBefore + 2);
    });
    expect(toast.success.mock.calls.filter(([message]) => message === 'Mail call adoption updated')).toHaveLength(1);
    expect(api.getVeteran).not.toHaveBeenCalled();
    expect(api.updateVeteran).not.toHaveBeenCalled();
    expect(api.getGuardian).not.toHaveBeenCalled();
    expect(api.updateGuardian).not.toHaveBeenCalled();
  });

  test('saves mail call notes through PATCH /veterans/{id}/mail-call-notes and never the PUT fallback', async () => {
    const user = userEvent.setup();
    await openMailCall(user);

    const detailsBefore = api.getFlightDetails.mock.calls.length;
    const assignmentsBefore = api.getFlightAssignments.mock.calls.length;
    const zoeRow = screen.getByRole('link', { name: 'Zoe Zeta' }).closest('tr');
    const notes = within(zoeRow).getByRole('textbox', { name: 'Mail call notes' });
    expect(notes.tagName).toBe('TEXTAREA');
    expect(notes).toHaveAttribute('rows', '2');
    await user.clear(notes);
    await user.type(notes, 'Left at desk');
    await user.tab();

    await waitFor(() => {
      expect(api.updateVeteranMailCallNotes).toHaveBeenCalledWith('vet-zeta', 'Left at desk');
      expect(api.getFlightDetails).toHaveBeenCalledTimes(detailsBefore + 1);
      expect(api.getFlightAssignments).toHaveBeenCalledTimes(assignmentsBefore + 1);
    });
    expect(toast.success.mock.calls.filter(([message]) => message === 'Mail call notes updated')).toHaveLength(1);
    expect(api.getVeteran).not.toHaveBeenCalled();
    expect(api.updateVeteran).not.toHaveBeenCalled();
    expect(api.getGuardian).not.toHaveBeenCalled();
    expect(api.updateGuardian).not.toHaveBeenCalled();
  });

  test('disables mail call controls for a read-only user', async () => {
    const user = userEvent.setup();
    mockCan.mockImplementation((permission) => permission === 'records:read' || permission === 'exports:read');
    await openMailCall(user);

    const zoeRow = screen.getByRole('link', { name: 'Zoe Zeta' }).closest('tr');
    expect(within(zoeRow).getByRole('checkbox', { name: 'Mail call received' })).toBeDisabled();
    expect(within(zoeRow).getByRole('checkbox', { name: 'Mail call adoption' })).toBeDisabled();
    expect(within(zoeRow).getByRole('textbox', { name: 'Mail call notes' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Columns' })).toBeEnabled();
  });

  test('disables mail call controls on a completed flight', async () => {
    const user = userEvent.setup();
    api.getFlight.mockResolvedValue(flightDocument({ completed: true }));
    await openMailCall(user);

    const zoeRow = screen.getByRole('link', { name: 'Zoe Zeta' }).closest('tr');
    expect(within(zoeRow).getByRole('checkbox', { name: 'Mail call received' })).toBeDisabled();
    expect(within(zoeRow).getByRole('checkbox', { name: 'Mail call adoption' })).toBeDisabled();
    expect(within(zoeRow).getByRole('textbox', { name: 'Mail call notes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Print guardian list' })).toBeEnabled();
  });

  test('shows Vet Missing Mail on the veteran row only after the guardian is trained', async () => {
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();
    const zoeRow = screen.getByRole('link', { name: 'Zoe Zeta' }).closest('tr');
    const annRow = screen.getByRole('link', { name: 'Ann Apple' }).closest('tr');
    const umaRow = screen.getByRole('link', { name: 'Uma Solo' }).closest('tr');

    expect(within(zoeRow).getByText('Vet Missing Mail')).toBeInTheDocument();
    expect(within(annRow).getByText('OK')).toBeInTheDocument();
    expect(within(annRow).queryByText('Vet Missing Mail')).not.toBeInTheDocument();
    expect(within(umaRow).queryByText('Vet Missing Mail')).not.toBeInTheDocument();
    expect(within(umaRow).getByText('No Guardian')).toBeInTheDocument();
  });

  test('Issues Only includes a trained veteran who is missing mail', async () => {
    const user = userEvent.setup();
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();

    await user.click(screen.getByText('All Statuses'));
    await user.click(await screen.findByRole('option', { name: 'Issues Only' }));

    expect(screen.getByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uma Solo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ann Apple' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Gail Apple' })).not.toBeInTheDocument();
  });

  test('status sort lists a vet missing mail pair ahead of a ready pair', async () => {
    const user = userEvent.setup();
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Ann Apple' })).toBeInTheDocument();

    await user.click(screen.getByLabelText('Sort by'));
    await user.click(await screen.findByRole('option', { name: 'Status' }));

    const names = screen.getAllByRole('link').map((link) => link.textContent);
    expect(names.indexOf('Zoe Zeta')).toBeGreaterThanOrEqual(0);
    expect(names.indexOf('Zoe Zeta')).toBeLessThan(names.indexOf('Ann Apple'));
  });

  test('still shows Vet Missing Mail on a completed flight', async () => {
    api.getFlight.mockResolvedValue(flightDocument({ completed: true }));
    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();
    const zoeRow = screen.getByRole('link', { name: 'Zoe Zeta' }).closest('tr');
    const annRow = screen.getByRole('link', { name: 'Ann Apple' }).closest('tr');
    expect(within(zoeRow).getByText('Vet Missing Mail')).toBeInTheDocument();
    expect(within(annRow).getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('Missing mail only applies while the Mail Call layout is active and persists per flight', async () => {
    const user = userEvent.setup();
    render(<Page />);
    expect(await screen.findByRole('link', { name: 'Ann Apple' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Missing mail only' })).not.toBeInTheDocument();

    await chooseColumns(user, 'Mail Call');
    const toggle = screen.getByRole('button', { name: 'Missing mail only' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);

    expect(screen.getByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gary Zeta' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uma Solo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ann Apple' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Gail Apple' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Casey Crew' })).not.toBeInTheDocument();

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214'));
      expect(saved.missingMailOnly).toBe(true);
    });

    await chooseColumns(user, 'Ops');
    expect(screen.queryByRole('button', { name: 'Missing mail only' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ann Apple' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Casey Crew' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214')).missingMailOnly).toBe(true);

    await chooseColumns(user, 'Mail Call');
    expect(screen.queryByRole('link', { name: 'Ann Apple' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Casey Crew' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(await screen.findByRole('link', { name: 'Ann Apple' })).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214'));
      expect(saved.missingMailOnly).toBe(false);
    });
  });

  test('restores Missing mail only after leaving and returning to the flight', async () => {
    localStorage.setItem(ACTIVITY_PRESET_STORAGE_KEY, 'mailcall');
    localStorage.setItem(
      'sshf.flightRosterControls.v1.flight-214',
      JSON.stringify({
        version: 1,
        missingMailOnly: true,
        nameFilter: '',
        statusFilter: 'all',
        busFilter: 'all',
        planeFilter: 'all',
        assignedCallerFilter: 'all',
        sortBy: 'name',
        noGuardianOnly: false,
        trainingTypeFilter: [],
        trainingGuardiansFocus: true,
      })
    );

    render(<Page />);

    expect(await screen.findByRole('link', { name: 'Zoe Zeta' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uma Solo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ann Apple' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Casey Crew' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Missing mail only' })).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-214')).missingMailOnly).toBe(true);
  });
});
