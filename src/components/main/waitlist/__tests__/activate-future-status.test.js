import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { api } from '@/lib/api';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { toast } from '@/components/core/toaster';
import { WaitlistView } from '@/components/main/waitlist/waitlist-view';

// Flight Status options are copied in the veteran form, the guardian form, and search.
// There is no shared dropdown source to import. These are the Future-* values those
// dropdowns share, in the same order.
const FUTURE_STATUSES = ['Future-Spring', 'Future-Fall', 'Future-PostRestriction'];

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
    activateFutureStatus: jest.fn(),
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

function toastText() {
  return ['success', 'error', 'warning']
    .flatMap((level) => toast[level].mock.calls.map((call) => call[0]))
    .filter((message) => typeof message === 'string')
    .join('\n');
}

function closestCommonAncestor(first, second) {
  const seen = new Set();
  let node = first;
  while (node) {
    seen.add(node);
    node = node.parentElement;
  }
  node = second;
  while (node) {
    if (seen.has(node)) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

// The existing Waitlist Type select's accessible name is empty; its visible label is the
// stable hook. The Future status control is found the same way.
function labelElement(text) {
  return screen.getByText(text, { selector: 'label' });
}

function selectForLabel(text) {
  let node = labelElement(text).parentElement;
  while (node) {
    const combos = within(node).queryAllByRole('combobox');
    if (combos.length === 1) {
      return combos[0];
    }
    node = node.parentElement;
  }
  throw new Error(`No single select for label ${text}`);
}

function futureStatusSelect() {
  return selectForLabel(/future status/i);
}

function activateButton() {
  return screen.getByRole('button', { name: 'Activate' });
}

function expectRequired(select) {
  const native = select.parentElement?.querySelector('input');
  const required =
    select.hasAttribute('required') ||
    select.getAttribute('aria-required') === 'true' ||
    Boolean(native?.required) ||
    native?.getAttribute('aria-required') === 'true';
  expect(required).toBe(true);
}

async function renderLoadedWaitlist() {
  render(<WaitlistView />);
  expect(await screen.findByText('Rachel Stubner')).toBeInTheDocument();
}

async function chooseStatus(user, status) {
  fireEvent.mouseDown(futureStatusSelect());
  const listbox = await screen.findByRole('listbox');
  await user.click(within(listbox).getByRole('option', { name: status }));
}

async function openActivateDialog(status = 'Future-Fall') {
  const user = userEvent.setup();
  await chooseStatus(user, status);
  await user.click(activateButton());
  const dialog = await screen.findByRole('dialog');
  return { user, dialog };
}

describe('Activate Future status on the waitlist (issue #252)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'type') {
        return 'guardians';
      }
      if (key === 'page') {
        return '2';
      }
      return null;
    });
    mockCan.mockImplementation(() => true);
    api.getWaitlist.mockReset();
    api.activateFutureStatus.mockReset();
    api.getWaitlist.mockResolvedValue([makeGuardian()]);
    api.activateFutureStatus.mockResolvedValue({
      status: 200,
      body: { counts: { changed: 12, failed: 0 } },
    });
    toast.success.mockClear();
    toast.error.mockClear();
    toast.warning.mockClear();

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

  test('hides Future status activation without flights:manage', async () => {
    mockCan.mockImplementation((permission) => permission !== PERMISSIONS.FLIGHTS_MANAGE);

    await renderLoadedWaitlist();

    expect(labelElement('Waitlist Type')).toBeInTheDocument();
    expect(screen.queryByText(/future status/i, { selector: 'label' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
  });

  test('offers exactly the shared Future-* statuses and keeps Activate disabled until one is selected', async () => {
    const user = userEvent.setup();
    await renderLoadedWaitlist();

    const statusSelect = futureStatusSelect();
    const filterGroup = closestCommonAncestor(labelElement('Waitlist Type'), labelElement(/future status/i));
    expect(filterGroup).not.toBeNull();
    expect(within(filterGroup).queryByRole('table')).not.toBeInTheDocument();
    expectRequired(statusSelect);
    expect(activateButton()).toBeDisabled();

    fireEvent.mouseDown(statusSelect);
    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    const labels = options.map((option) => option.textContent);
    const values = options.map((option) => option.getAttribute('data-value') ?? option.textContent);
    expect(labels).toEqual(FUTURE_STATUSES);
    expect(values).toEqual(FUTURE_STATUSES);

    await user.click(within(listbox).getByRole('option', { name: 'Future-Spring' }));

    expect(activateButton()).toBeEnabled();
  });

  test('confirm dialog names the selected status and says those people become Active', async () => {
    await renderLoadedWaitlist();
    const { dialog } = await openActivateDialog('Future-Fall');

    expect(dialog).toHaveTextContent('Future-Fall');
    expect(dialog).toHaveTextContent(/active/i);
    expect(api.activateFutureStatus).not.toHaveBeenCalled();
  });

  test('confirm posts the selected status, refetches the current type and page, and toasts the changed count', async () => {
    api.activateFutureStatus.mockResolvedValue({
      status: 200,
      body: { counts: { changed: 12, failed: 0 } },
    });
    await renderLoadedWaitlist();
    const callsBeforeConfirm = api.getWaitlist.mock.calls.length;
    const initialRequest = api.getWaitlist.mock.calls[0][0];
    expect(initialRequest).toMatchObject({ type: 'guardians', offset: 200 });
    const { user, dialog } = await openActivateDialog('Future-PostRestriction');

    await user.click(within(dialog).getByRole('button', { name: 'Activate' }));

    await waitFor(() => {
      expect(api.getWaitlist.mock.calls.length).toBeGreaterThan(callsBeforeConfirm);
      expect(api.activateFutureStatus).toHaveBeenCalledTimes(1);
      expect(api.activateFutureStatus).toHaveBeenCalledWith('Future-PostRestriction');
      expect(api.getWaitlist.mock.calls.at(-1)[0]).toEqual(initialRequest);
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('12'));
    });
  });

  test('a 207 refetches and shows a warning or error toast with the failed count and a retry note', async () => {
    api.activateFutureStatus.mockResolvedValue({
      status: 207,
      body: {
        counts: { changed: 4, failed: 3 },
        failed: [{ id: 'grd-8', type: 'guardian', error: 'conflict' }],
        assignedToFlight: [],
      },
    });
    await renderLoadedWaitlist();
    const callsBeforeConfirm = api.getWaitlist.mock.calls.length;
    const initialRequest = api.getWaitlist.mock.calls[0][0];
    const { user, dialog } = await openActivateDialog('Future-Spring');

    await user.click(within(dialog).getByRole('button', { name: 'Activate' }));

    await waitFor(() => {
      expect(api.getWaitlist.mock.calls.length).toBeGreaterThan(callsBeforeConfirm);
      expect(api.getWaitlist.mock.calls.at(-1)[0]).toEqual(initialRequest);
      const messages = [...toast.error.mock.calls, ...toast.warning.mock.calls].map((call) => call[0]);
      expect(
        messages.some((message) => typeof message === 'string' && message.includes('3') && /retry/i.test(message))
      ).toBe(true);
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  test('mentions people already assigned to a flight when assignedToFlight is non-empty', async () => {
    api.activateFutureStatus.mockResolvedValue({
      status: 200,
      body: {
        counts: { changed: 8, failed: 0 },
        assignedToFlight: ['person-assigned-1', 'person-assigned-2'],
      },
    });
    await renderLoadedWaitlist();
    const { user, dialog } = await openActivateDialog('Future-Fall');

    await user.click(within(dialog).getByRole('button', { name: 'Activate' }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('8'));
      const messages = toastText();
      expect(messages).toMatch(/assign/i);
      expect(messages).toContain('person-assigned-1');
      expect(messages).toContain('person-assigned-2');
    });
  });

  test.each([
    [400, 'status is missing or does not begin with "Future-"'],
    [500, 'Database unreachable'],
  ])('HTTP %s toasts the API message and does not refetch', async (status, message) => {
    api.activateFutureStatus.mockRejectedValue(Object.assign(new Error(message), { status }));
    await renderLoadedWaitlist();
    const callsBeforeConfirm = api.getWaitlist.mock.calls.length;
    const { user, dialog } = await openActivateDialog('Future-Fall');

    await user.click(within(dialog).getByRole('button', { name: 'Activate' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(message));
    });
    expect(api.getWaitlist).toHaveBeenCalledTimes(callsBeforeConfirm);
    expect(toast.success).not.toHaveBeenCalled();
  });
});
