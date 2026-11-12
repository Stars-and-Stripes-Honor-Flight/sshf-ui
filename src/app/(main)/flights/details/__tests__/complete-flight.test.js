import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { api } from '@/lib/api';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { toast } from '@/components/core/toaster';

import Page from '../page';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key) => (key === 'id' ? 'flight-214' : null),
  }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api', () => ({
  api: {
    getFlight: jest.fn(),
    getFlightDetails: jest.fn(),
    getFlightAssignments: jest.fn(),
    completeFlight: jest.fn(),
  },
}));

jest.mock('@/components/core/toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
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

// Local calendar dates. Enabled only when today's local date is after flight_date.
const FLIGHT_DAY = { year: 2026, monthIndex: 5, day: 15 };
const COMPLETE_FLIGHT = 'Complete Flight';
const MISSING_FLIGHT_DATE = /flight date is missing/i;
const INVALID_FLIGHT_DATE = /flight date is invalid/i;

jest.setTimeout(15000);

function localDate(year, monthIndex, day, hours, minutes) {
  return new Date(year, monthIndex, day, hours, minutes, 0, 0);
}

function useLocalClock(date) {
  jest.useFakeTimers({
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'nextTick',
      'queueMicrotask',
      'performance',
      'hrtime',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
    now: date,
  });
}

function mockFlight({ name = 'May 2026', completed = false, flightDate, includeFlightDate = true } = {}) {
  const dateFields = includeFlightDate ? { flight_date: flightDate } : {};
  api.getFlight.mockResolvedValue({
    _id: 'flight-214',
    _rev: '1-rev',
    type: 'Flight',
    name,
    capacity: 40,
    completed,
    ...dateFields,
  });
  api.getFlightDetails.mockResolvedValue({
    flight: {
      name,
      capacity: 40,
      ...dateFields,
    },
    stats: { flight: {}, tours: {}, buses: {} },
    pairs: [],
  });
  api.getFlightAssignments.mockResolvedValue({
    counts: {
      veterans: 0,
      guardians: 0,
      veteransConfirmed: 0,
      guardiansConfirmed: 0,
      remaining: 40,
    },
  });
}

function statusHeader() {
  return screen.getByRole('heading', { level: 4, name: 'May 2026' }).parentElement;
}

function completeFlightButton() {
  return within(statusHeader()).getByRole('button', { name: COMPLETE_FLIGHT });
}

function explanationText(button) {
  const describedBy = button.getAttribute('aria-describedby') || '';
  const described = describedBy
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent || '')
    .join(' ');
  const visible = screen
    .queryAllByText(/flight date/i)
    .map((node) => node.textContent || '')
    .join(' ');
  return [
    button.getAttribute('title') || '',
    button.getAttribute('aria-description') || '',
    button.parentElement?.getAttribute('title') || '',
    button.parentElement?.getAttribute('aria-label') || '',
    described,
    visible,
    screen.queryByRole('tooltip')?.textContent || '',
  ].join(' ');
}

async function expectDateExplanation(pattern) {
  const button = completeFlightButton();
  expect(button).toBeDisabled();
  let text = explanationText(button);
  if (!pattern.test(text)) {
    const user = userEvent.setup();
    await user.hover(button.parentElement ?? button);
    text = explanationText(button);
  }
  expect(text).toMatch(pattern);
}

async function renderLoadedFlight() {
  render(<Page />);
  expect(await screen.findByRole('heading', { level: 4, name: 'May 2026' })).toBeInTheDocument();
}

async function openCompleteDialog() {
  const user = userEvent.setup();
  await user.click(completeFlightButton());
  const dialog = await screen.findByRole('dialog');
  return { user, dialog };
}

describe('Complete Flight on flight details (issue #252)', () => {
  beforeEach(() => {
    useLocalClock(localDate(FLIGHT_DAY.year, FLIGHT_DAY.monthIndex, FLIGHT_DAY.day, 12, 0));
    mockCan.mockImplementation(() => true);
    localStorage.clear();
    api.getFlight.mockReset();
    api.getFlightDetails.mockReset();
    api.getFlightAssignments.mockReset();
    api.completeFlight.mockReset();
    toast.success.mockClear();
    toast.error.mockClear();
    toast.warning.mockClear();
    mockFlight({ flightDate: '2026-06-14' });
    api.completeFlight.mockResolvedValue({
      status: 200,
      body: { counts: { changed: 12, failed: 0 } },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('hides Complete Flight without flights:manage', async () => {
    mockCan.mockImplementation((permission) => permission !== PERMISSIONS.FLIGHTS_MANAGE);

    await renderLoadedFlight();

    expect(within(statusHeader()).getByText('Active')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: COMPLETE_FLIGHT })).not.toBeInTheDocument();
  });

  test('hides Complete Flight when the flight document completed flag is true', async () => {
    mockFlight({ flightDate: '2026-06-14', completed: true });

    await renderLoadedFlight();

    expect(within(statusHeader()).getByText('Completed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: COMPLETE_FLIGHT })).not.toBeInTheDocument();
  });

  test('hides Complete Flight when completed is the legacy string true', async () => {
    mockFlight({ flightDate: '2026-06-14', completed: 'true' });

    await renderLoadedFlight();

    expect(within(statusHeader()).getByText('Completed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: COMPLETE_FLIGHT })).not.toBeInTheDocument();
  });

  test('disables Complete Flight on the flight date', async () => {
    mockFlight({ flightDate: '2026-06-15' });

    await renderLoadedFlight();

    expect(completeFlightButton()).toBeDisabled();
  });

  test('disables Complete Flight before the flight date', async () => {
    mockFlight({ flightDate: '2026-06-16' });

    await renderLoadedFlight();

    expect(completeFlightButton()).toBeDisabled();
  });

  test('enables Complete Flight starting the day after the flight date', async () => {
    mockFlight({ flightDate: '2026-06-14' });

    await renderLoadedFlight();

    expect(completeFlightButton()).toBeEnabled();
  });

  test('stays disabled at 00:30 local time on the flight date', async () => {
    jest.setSystemTime(localDate(2026, 5, 15, 0, 30));
    mockFlight({ flightDate: '2026-06-15' });

    await renderLoadedFlight();

    expect(completeFlightButton()).toBeDisabled();
  });

  test('stays disabled at 23:30 local time on the flight date', async () => {
    jest.setSystemTime(localDate(2026, 5, 15, 23, 30));
    mockFlight({ flightDate: '2026-06-15' });

    await renderLoadedFlight();

    expect(completeFlightButton()).toBeDisabled();
  });

  test('enables Complete Flight at 00:30 local time the day after the flight date', async () => {
    jest.setSystemTime(localDate(2026, 5, 16, 0, 30));
    mockFlight({ flightDate: '2026-06-15' });

    await renderLoadedFlight();

    expect(completeFlightButton()).toBeEnabled();
  });

  test.each([
    ['omitted', { includeFlightDate: false }],
    ['null', { flightDate: null }],
    ['blank', { flightDate: '' }],
  ])('disables Complete Flight and explains a %s flight date', async (_label, flight) => {
    mockFlight(flight);

    await renderLoadedFlight();

    await expectDateExplanation(MISSING_FLIGHT_DATE);
  });

  test('disables Complete Flight and explains an invalid flight date', async () => {
    mockFlight({ flightDate: 'not-a-date' });

    await renderLoadedFlight();

    await expectDateExplanation(INVALID_FLIGHT_DATE);
  });

  test('confirm dialog names the flight and states that Active people become Flown', async () => {
    await renderLoadedFlight();
    const { dialog } = await openCompleteDialog();

    expect(dialog).toHaveTextContent('May 2026');
    expect(dialog).toHaveTextContent(/active/i);
    expect(dialog).toHaveTextContent(/flown/i);
    expect(dialog).toHaveTextContent(/completed/i);
    expect(api.completeFlight).not.toHaveBeenCalled();
  });

  test('cancel closes the dialog and does not call the API', async () => {
    await renderLoadedFlight();
    const { user, dialog } = await openCompleteDialog();

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(api.completeFlight).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('confirm calls completeFlight, refetches, and success-toasts the changed count on 200', async () => {
    api.completeFlight.mockResolvedValue({
      status: 200,
      body: { counts: { changed: 12, failed: 0 } },
    });
    await renderLoadedFlight();
    api.getFlight.mockClear();
    api.getFlightDetails.mockClear();
    api.getFlightAssignments.mockClear();
    const { user, dialog } = await openCompleteDialog();

    await user.click(within(dialog).getByRole('button', { name: COMPLETE_FLIGHT }));

    await waitFor(() => {
      expect(api.completeFlight).toHaveBeenCalledTimes(1);
      expect(api.completeFlight).toHaveBeenCalledWith('flight-214');
      expect(api.getFlight).toHaveBeenCalledWith('flight-214');
      expect(api.getFlightDetails).toHaveBeenCalledWith('flight-214');
      expect(api.getFlightAssignments).toHaveBeenCalledWith('flight-214');
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('12'));
    });
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
  });

  test('a 207 refetches and shows a warning or error toast with the failed count and a retry note', async () => {
    api.completeFlight.mockResolvedValue({
      status: 207,
      body: {
        counts: { changed: 4, failed: 3 },
        failed: [{ id: 'vet-9', type: 'veteran', error: 'conflict' }],
      },
    });
    await renderLoadedFlight();
    api.getFlight.mockClear();
    api.getFlightDetails.mockClear();
    api.getFlightAssignments.mockClear();
    const { user, dialog } = await openCompleteDialog();

    await user.click(within(dialog).getByRole('button', { name: COMPLETE_FLIGHT }));

    await waitFor(() => {
      expect(api.getFlight).toHaveBeenCalledWith('flight-214');
      expect(api.getFlightDetails).toHaveBeenCalledWith('flight-214');
      expect(api.getFlightAssignments).toHaveBeenCalledWith('flight-214');
      const messages = [...toast.error.mock.calls, ...toast.warning.mock.calls].map((call) => call[0]);
      expect(
        messages.some((message) => typeof message === 'string' && message.includes('3') && /retry/i.test(message))
      ).toBe(true);
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  test('a 409 toast uses the API message and does not refetch', async () => {
    const message = 'Flight is already completed';
    api.completeFlight.mockRejectedValue(Object.assign(new Error(message), { status: 409 }));
    await renderLoadedFlight();
    api.getFlight.mockClear();
    api.getFlightDetails.mockClear();
    api.getFlightAssignments.mockClear();
    const { user, dialog } = await openCompleteDialog();

    await user.click(within(dialog).getByRole('button', { name: COMPLETE_FLIGHT }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(message));
    });
    expect(api.completeFlight).toHaveBeenCalledWith('flight-214');
    expect(api.getFlight).not.toHaveBeenCalled();
    expect(api.getFlightDetails).not.toHaveBeenCalled();
    expect(api.getFlightAssignments).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  test('other API errors toast the API message and do not refetch', async () => {
    const message = 'Flight not found';
    api.completeFlight.mockRejectedValue(Object.assign(new Error(message), { status: 404 }));
    await renderLoadedFlight();
    api.getFlight.mockClear();
    api.getFlightDetails.mockClear();
    api.getFlightAssignments.mockClear();
    const { user, dialog } = await openCompleteDialog();

    await user.click(within(dialog).getByRole('button', { name: COMPLETE_FLIGHT }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(message));
    });
    expect(api.getFlight).not.toHaveBeenCalled();
    expect(api.getFlightDetails).not.toHaveBeenCalled();
    expect(api.getFlightAssignments).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
