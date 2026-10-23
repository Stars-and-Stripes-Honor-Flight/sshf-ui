import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { toast } from '@/components/core/toaster';
import { openGuardianListPdf } from '@/components/main/flight/guardian-list-pdf';

import { GuardianListPrintDialog } from '../guardian-list-print-dialog';

jest.mock('@/components/core/toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/main/flight/guardian-list-pdf', () => ({
  openGuardianListPdf: jest.fn(),
}));

function guardian(id, last, first) {
  return { type: 'Guardian', id, name_last: last, name_first: first };
}

function veteran(id, last) {
  return { type: 'Veteran', id, name_last: last, name_first: 'Val' };
}

const pairs = [
  {
    people: [veteran('vet-a', 'Anderson'), guardian('ada', 'Adams', 'Ann')],
  },
  {
    people: [guardian('zoe', 'Zulu', 'Zoe')],
  },
];

function renderDialog(props) {
  return render(
    <GuardianListPrintDialog
      open
      onClose={jest.fn()}
      pairs={pairs}
      flightName="SSHF-May 2026"
      flightDate="2026-05-01"
      {...props}
    />
  );
}

describe('GuardianListPrintDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    openGuardianListPdf.mockResolvedValue(undefined);
    window.open = jest.fn(() => ({ close: jest.fn(), closed: false }));
  });

  test('defaults From and To to A and Z and shows the full guardian count', () => {
    renderDialog();

    expect(screen.getByRole('combobox', { name: 'From' })).toHaveTextContent('A');
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveTextContent('Z');
    expect(screen.getByText('2 guardians')).toBeInTheDocument();
  });

  test('updates the count when the letter range changes', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('combobox', { name: 'To' }));
    await user.click(await screen.findByRole('option', { name: 'A' }));

    expect(screen.getByText('1 guardian')).toBeInTheDocument();
  });

  test('disables Print and explains when From is after To', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('combobox', { name: 'To' }));
    await user.click(await screen.findByRole('option', { name: 'A' }));
    await user.click(screen.getByRole('combobox', { name: 'From' }));
    await user.click(await screen.findByRole('option', { name: 'M' }));

    expect(screen.getByText('From is after To.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print' })).toBeDisabled();
    expect(openGuardianListPdf).not.toHaveBeenCalled();
  });

  test('disables Print when no guardian falls in range', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('combobox', { name: 'From' }));
    await user.click(await screen.findByRole('option', { name: 'Q' }));
    await user.click(screen.getByRole('combobox', { name: 'To' }));
    await user.click(await screen.findByRole('option', { name: 'Q' }));

    expect(screen.getByText('No guardians in this range.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print' })).toBeDisabled();
  });

  test('asks the opener for the filtered guardians and has no roster-filter props', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('combobox', { name: 'To' }));
    await user.click(await screen.findByRole('option', { name: 'B' }));
    await user.click(screen.getByRole('button', { name: 'Print' }));

    expect(openGuardianListPdf).toHaveBeenCalledTimes(1);
    const request = openGuardianListPdf.mock.calls[0][0];
    expect(request.guardians.map((entry) => entry.person.id)).toEqual(['ada']);
    expect(request.guardians.some((entry) => entry.person.type === 'Veteran')).toBe(false);
    expect(request.from).toBe('A');
    expect(request.to).toBe('B');
    expect(request.flightName).toBe('SSHF-May 2026');
    expect(request.flightDate).toBe('2026-05-01');
    expect(request).not.toHaveProperty('nameFilter');
    expect(request).not.toHaveProperty('busFilter');
    expect(request).not.toHaveProperty('statusFilter');
    expect(window.open).toHaveBeenCalledWith('', '_blank');
  });

  test('shows a safe toast and stays open when PDF generation fails', async () => {
    const user = userEvent.setup();
    openGuardianListPdf.mockRejectedValue(new Error('boom: secret detail'));
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Print' }));

    expect(toast.error).toHaveBeenCalledWith('Could not prepare the guardian list. Please try again.');
    expect(screen.queryByText(/secret detail/)).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Print guardian list' })).toBeInTheDocument();
  });

  test('closes when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderDialog({ onClose });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('disables Print while the PDF is being prepared', async () => {
    const user = userEvent.setup();
    let resolvePrint;
    openGuardianListPdf.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePrint = resolve;
        })
    );
    renderDialog();

    const pending = user.click(screen.getByRole('button', { name: 'Print' }));
    const preparing = await screen.findByRole('button', { name: 'Preparing…' });
    expect(preparing).toBeDisabled();

    resolvePrint();
    await pending;
    await waitFor(() => expect(screen.getByRole('button', { name: 'Print' })).toBeEnabled());
  });
});
