import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { ReviewApplicationEditForm } from '@/components/main/review/review-application-edit-form';
import { api } from '@/lib/api';
import { toast } from '@/components/core/toaster';

jest.mock('@/lib/api', () => ({
  api: {
    updateReviewApplication: jest.fn(),
    updateReviewApplicationStatus: jest.fn(),
    acceptReviewApplication: jest.fn(),
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

const baseApplication = {
  _id: 'review-app-1',
  _rev: '1-abc',
  type: 'VeteranApp',
  app_status: 'New',
  app_status_note: '',
  date_time: '2024-01-01T12:00:00Z',
  app_date: '2024-01-01',
  name: {
    first: 'John',
    middle: '',
    last: 'Public',
    nickname: '',
  },
  address: {
    street: '1 Main St',
    city: 'Madison',
    county: 'Dane',
    state: 'WI',
    zip: '53703',
    phone_day: '555-0100',
    phone_mbl: '',
    email: 'john@example.com',
  },
  birth_date: '1940-01-01',
  gender: 'M',
  shirt: { size: 'L' },
  emerg_contact: {
    name: 'Jane Public',
    address: { phone: '555-0101', email: '' },
  },
  vet_type: 'WWII',
  service: { branch: 'Army', dates: '1942-1945', rank: 'PFC' },
  guardian: { pref_notes: '', pref_phone: '', pref_email: '' },
  medical: { usesWheelchair: false, requiresOxygen: false },
};

describe('ReviewApplicationEditForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCan.mockImplementation(() => true);
  });

  test('re-enables actions when pre-save fails during Accept on a dirty form', async () => {
    const saveError = Object.assign(new Error('Network error'), { status: 500 });
    api.updateReviewApplication.mockRejectedValue(saveError);

    const user = userEvent.setup();
    render(<ReviewApplicationEditForm application={baseApplication} />);

    const firstName = screen.getByDisplayValue('John');
    await user.clear(firstName);
    await user.type(firstName, 'Jonathan');

    const acceptButton = screen.getByRole('button', { name: /accept into logistics/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(api.updateReviewApplication).toHaveBeenCalled();
    });

    expect(api.acceptReviewApplication).not.toHaveBeenCalled();
    expect(screen.getByText('Network error')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save corrections/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /accept into logistics/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /^hold$/i })).toBeEnabled();
    });
  });

  test('saves dirty fields then accepts when pre-save succeeds', async () => {
    const updatedApp = { ...baseApplication, _rev: '2-def', name: { ...baseApplication.name, first: 'Jonathan' } };
    api.updateReviewApplication.mockResolvedValue(updatedApp);
    api.acceptReviewApplication.mockResolvedValue({
      application: { ...updatedApp, app_status: 'Accepted' },
      record: { _id: 'vet-1' },
    });

    const user = userEvent.setup();
    render(<ReviewApplicationEditForm application={baseApplication} />);

    const firstName = screen.getByDisplayValue('John');
    await user.clear(firstName);
    await user.type(firstName, 'Jonathan');

    await user.click(screen.getByRole('button', { name: /accept into logistics/i }));

    await waitFor(() => {
      expect(api.updateReviewApplication).toHaveBeenCalled();
      expect(api.acceptReviewApplication).toHaveBeenCalledWith('review-app-1', {
        app_status_note: '',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Application accepted into logistics');
  });

  test('hides accept and disables review actions without those permissions', () => {
    mockCan.mockImplementation(() => false);

    render(<ReviewApplicationEditForm application={baseApplication} />);

    expect(screen.queryByRole('button', { name: /accept into logistics/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save corrections/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^hold$/i })).toBeDisabled();
  });
});
