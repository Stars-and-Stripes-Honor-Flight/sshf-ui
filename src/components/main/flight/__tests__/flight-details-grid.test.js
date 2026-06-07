import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FlightDetailsGrid } from '../flight-details-grid';

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
        nofly: false,
      },
    ],
  };
}

describe('FlightDetailsGrid - assigned_to display', () => {
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
      />
    );

    expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
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
