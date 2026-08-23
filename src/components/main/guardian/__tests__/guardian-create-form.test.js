import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { GuardianCreateForm } from '../guardian-create-form';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/core/toaster';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next/navigation');
jest.mock('@/components/core/toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('GuardianCreateForm', () => {
  const mockPush = jest.fn();
  const mockCreateGuardian = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useRouter.mockReturnValue({
      push: mockPush
    });

    api.createGuardian = mockCreateGuardian;
  });

  async function fillValidForm(user, container) {
    await user.type(container.querySelector('input[name="name.first"]'), 'John');
    await user.type(container.querySelector('input[name="name.last"]'), 'Smith');
    await user.type(container.querySelector('input[name="birth_date"]'), '1950-01-01');
    // gender defaults to "M"

    await user.type(container.querySelector('input[name="address.street"]'), '123 Main St');
    await user.type(container.querySelector('input[name="address.city"]'), 'Madison');
    await user.type(container.querySelector('input[name="address.county"]'), 'Dane');
    await user.type(container.querySelector('input[name="address.state"]'), 'WI');
    await user.type(container.querySelector('input[name="address.zip"]'), '53703');
    await user.type(container.querySelector('input[name="address.phone_day"]'), '608-555-1234');
  }

  test('renders basic info, address fields, and the Create button', () => {
    const { container } = render(<GuardianCreateForm />);

    expect(container.querySelector('input[name="name.first"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="name.last"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="birth_date"]')).toBeInTheDocument();

    expect(container.querySelector('input[name="address.street"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.city"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.county"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.state"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.zip"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.phone_day"]')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /create guardian/i })).toBeInTheDocument();
  });

  test('submits valid data and creates a guardian', async () => {
    const user = userEvent.setup();
    mockCreateGuardian.mockResolvedValue({ _id: 'guardian-123' });

    const { container } = render(<GuardianCreateForm />);
    await fillValidForm(user, container);

    await user.click(screen.getByRole('button', { name: /create guardian/i }));

    await waitFor(() => {
      expect(mockCreateGuardian).toHaveBeenCalledTimes(1);
    });

    const payload = mockCreateGuardian.mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        type: 'Guardian',
        name: expect.objectContaining({ first: 'John', last: 'Smith' }),
        address: expect.objectContaining({
          street: '123 Main St',
          city: 'Madison',
          county: 'Dane',
          state: 'WI',
          zip: '53703',
          phone_day: '608-555-1234'
        })
      })
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Guardian created');
      expect(mockPush).toHaveBeenCalledWith('/guardians/details?id=guardian-123');
    });
  });

  test('blocks submit when first name is empty and shows a validation error', async () => {
    const user = userEvent.setup();
    const { container } = render(<GuardianCreateForm />);

    // Fill everything except first name
    await user.type(container.querySelector('input[name="name.last"]'), 'Smith');
    await user.type(container.querySelector('input[name="birth_date"]'), '1950-01-01');
    await user.type(container.querySelector('input[name="address.street"]'), '123 Main St');
    await user.type(container.querySelector('input[name="address.city"]'), 'Madison');
    await user.type(container.querySelector('input[name="address.county"]'), 'Dane');
    await user.type(container.querySelector('input[name="address.state"]'), 'WI');
    await user.type(container.querySelector('input[name="address.zip"]'), '53703');
    await user.type(container.querySelector('input[name="address.phone_day"]'), '608-555-1234');

    await user.click(screen.getByRole('button', { name: /create guardian/i }));

    await waitFor(() => {
      const errorMessage = container.querySelector('.MuiFormHelperText-root.Mui-error');
      expect(errorMessage).toBeInTheDocument();
    });

    expect(mockCreateGuardian).not.toHaveBeenCalled();
  });

  test('shows an error toast and does not navigate when the API call fails', async () => {
    const user = userEvent.setup();
    mockCreateGuardian.mockRejectedValue(new Error('Network error occurred'));

    const { container } = render(<GuardianCreateForm />);
    await fillValidForm(user, container);

    await user.click(screen.getByRole('button', { name: /create guardian/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create guardian: Network error occurred');
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
