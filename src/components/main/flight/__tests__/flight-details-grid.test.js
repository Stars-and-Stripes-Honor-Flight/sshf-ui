import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FlightDetailsGrid } from '../flight-details-grid';
import { ACTIVITY_PRESETS } from '../column-configs';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

jest.mock('@/lib/api', () => ({
  api: {},
}));

jest.mock('@/components/core/toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/main/flight/veteran-guardian-search-dialog', () => ({
  VeteranGuardianSearchDialog: () => null,
}));

function buildPair({ veteranAssignedTo, guardianAssignedTo } = {}) {
  return {
    pairId: 'pair-1',
    busMismatch: false,
    missingPairedPerson: false,
    people: [
      {
        type: 'Veteran',
        id: 'vet-1',
        name_first: 'Daniel',
        name_last: 'Schneider',
        bus: 'Alpha4',
        seat: '09E',
        assigned_to: veteranAssignedTo,
        confirmed: true,
        medical_form: true,
        medical_level: 'Level 1',
        nofly: false,
      },
      {
        type: 'Guardian',
        id: 'guard-1',
        name_first: 'Tracy',
        name_last: 'Stouffer',
        bus: 'Alpha4',
        seat: 'NF',
        assigned_to: guardianAssignedTo,
        confirmed: true,
        medical_form: true,
        training_complete: true,
        training: 'Complete',
        nofly: false,
      },
    ],
  };
}

describe('FlightDetailsGrid - assigned_to display', () => {
  const callerGridProps = { activityPreset: ACTIVITY_PRESETS.CALLER };

  test('shows flat assigned_to from flight detail API on veteran and guardian rows', () => {
    render(
      <FlightDetailsGrid
        pairs={[buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' })]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
        {...callerGridProps}
      />
    );

    expect(screen.getByDisplayValue('Karyn')).toBeInTheDocument();
    expect(screen.getByText('Karyn', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('falls back to nested call.assigned_to when flat field is absent', () => {
    const pair = buildPair({});
    pair.people[0].call = { assigned_to: 'Jim K' };
    pair.people[1].call = { assigned_to: 'Jim K' };

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
        {...callerGridProps}
      />
    );

    expect(screen.getByDisplayValue('Jim K')).toBeInTheDocument();
    expect(screen.getByText('Jim K', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('shows sync control when veteran and guardian assigned_to values differ', () => {
    render(
      <FlightDetailsGrid
        pairs={[buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Other' })]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
        {...callerGridProps}
      />
    );

    expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
  });

  test('renders editable seat fields for veteran and guardian (issue #158)', () => {
    render(
      <FlightDetailsGrid
        pairs={[buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' })]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.getByDisplayValue('09E')).toBeInTheDocument();
    expect(screen.getByDisplayValue('NF')).toBeInTheDocument();
  });

  test('updates guardian seat independently via onUpdate (issue #158)', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn().mockResolvedValue(undefined);

    render(
      <FlightDetailsGrid
        pairs={[buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' })]}
        onUpdate={onUpdate}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    const guardianSeatInput = screen.getByDisplayValue('NF');
    await user.clear(guardianSeatInput);
    await user.type(guardianSeatInput, '25B');
    await user.tab();

    expect(onUpdate).toHaveBeenCalledWith('guard-1', 'Guardian', {
      flight: { seat: '25B' },
    });
  });

  test('writes nested call.assigned_to when veteran assignment is edited', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn().mockResolvedValue(undefined);

    render(
      <FlightDetailsGrid
        pairs={[buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' })]}
        onUpdate={onUpdate}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
        {...callerGridProps}
      />
    );

    const input = screen.getByDisplayValue('Karyn');
    await user.clear(input);
    await user.type(input, 'New Caller');
    await user.tab();

    expect(onUpdate).toHaveBeenCalledWith('vet-1', 'Veteran', {
      call: { assigned_to: 'New Caller' },
    });
    expect(onUpdate).toHaveBeenCalledWith('guard-1', 'Guardian', {
      call: { assigned_to: 'New Caller' },
    });
  });
});

describe('FlightDetailsGrid - ops flight group column (issue #165)', () => {
  test('shows veteran flight group on ops preset and em dash on guardian row', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.people[0].group = '  Alpha Flight  ';

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
        activityPreset={ACTIVITY_PRESETS.OPS}
      />
    );

    expect(screen.getByText('Alpha Flight')).toBeInTheDocument();
    expect(screen.getByText('Flt Grp')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Karyn')).not.toBeInTheDocument();
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});

describe('FlightDetailsGrid - issue #141: OK status with validation issues', () => {
  test('never shows OK status chip when pair has bus mismatch', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = true;

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Bus Mismatch', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('never shows OK status chip when pair has missing paired person', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.missingPairedPerson = true;

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Missing Person', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('never shows OK when veteran not confirmed', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = false;
    pair.missingPairedPerson = false;
    pair.people[0].confirmed = false;

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Vet Not Confirmed', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('never shows OK when veteran missing medical form', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = false;
    pair.missingPairedPerson = false;
    pair.people[0].medical_form = false;

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Vet Medical Form', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('never shows OK when veteran missing medical level', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = false;
    pair.missingPairedPerson = false;
    pair.people[0].medical_level = '';

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Vet Medical Level', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('never shows OK when veteran has no bus', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = false;
    pair.missingPairedPerson = false;
    pair.people[0].bus = 'None';

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Vet No Bus', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('never shows OK when guardian not confirmed', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = false;
    pair.missingPairedPerson = false;
    pair.people[1].confirmed = false;

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Grd Not Confirmed', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('never shows OK when guardian training incomplete', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = false;
    pair.missingPairedPerson = false;
    pair.people[1].training_complete = false;

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Grd Training', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });

  test('shows OK status only when pair has no validation issues', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = false;
    pair.missingPairedPerson = false;
    pair.people[0].confirmed = true;
    pair.people[0].medical_form = true;
    pair.people[0].medical_level = 'Level 1';
    pair.people[0].bus = 'Alpha4';
    pair.people[1].confirmed = true;
    pair.people[1].medical_form = true;
    pair.people[1].training_complete = true;
    pair.people[1].training = 'Complete';
    pair.people[1].bus = 'Alpha4';

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.getByText('OK', { selector: '.MuiChip-label' })).toBeInTheDocument();
    expect(screen.queryByText('Bus Mismatch', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.queryByText('Missing Person', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
  });

  test('shows multiple issue chips when pair has multiple validation issues', () => {
    const pair = buildPair({ veteranAssignedTo: 'Karyn', guardianAssignedTo: 'Karyn' });
    pair.busMismatch = true;
    pair.missingPairedPerson = true;
    pair.people[0].confirmed = false;
    pair.people[1].training_complete = false;

    render(
      <FlightDetailsGrid
        pairs={[pair]}
        onUpdate={jest.fn()}
        nameFilter=""
        statusFilter="all"
        busFilter="all"
        flightId="flight-1"
        flightName="Test Flight"
      />
    );

    expect(screen.queryByText('OK', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
    expect(screen.getByText('Bus Mismatch', { selector: '.MuiChip-label' })).toBeInTheDocument();
    expect(screen.getByText('Missing Person', { selector: '.MuiChip-label' })).toBeInTheDocument();
    expect(screen.getByText('Vet Not Confirmed', { selector: '.MuiChip-label' })).toBeInTheDocument();
    expect(screen.getByText('Grd Training', { selector: '.MuiChip-label' })).toBeInTheDocument();
  });
});
