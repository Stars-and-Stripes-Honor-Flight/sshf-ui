import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { VeteranCreateForm } from '../veteran-create-form';
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

async function selectMuiOption(user, container, fieldName, optionName) {
  const hiddenInput = container.querySelector(`[name="${fieldName}"]`);
  const selectDisplay = hiddenInput.closest('.MuiFormControl-root').querySelector('.MuiSelect-select');
  fireEvent.mouseDown(selectDisplay);
  await user.click(await screen.findByRole('option', { name: optionName }));
}

describe('VeteranCreateForm', () => {
  const mockPush = jest.fn();
  const mockCreateVeteran = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useRouter.mockReturnValue({
      push: mockPush
    });

    api.createVeteran = mockCreateVeteran;
  });

  async function fillValidForm(user, container) {
    await user.type(container.querySelector('input[name="name.first"]'), 'John');
    await user.type(container.querySelector('input[name="name.last"]'), 'Smith');

    await selectMuiOption(user, container, 'service.branch', 'Army');
    await selectMuiOption(user, container, 'vet_type', 'Vietnam');

    await user.type(container.querySelector('input[name="address.street"]'), '123 Main St');
    await user.type(container.querySelector('input[name="address.city"]'), 'Madison');
    await user.type(container.querySelector('input[name="address.county"]'), 'Dane');
    await user.type(container.querySelector('input[name="address.state"]'), 'WI');
    await user.type(container.querySelector('input[name="address.zip"]'), '53703');
    await user.type(container.querySelector('input[name="address.phone_day"]'), '608-555-1234');
  }

  test('renders basic info, address fields, and the Create button', () => {
    const { container } = render(<VeteranCreateForm />);

    expect(container.querySelector('input[name="name.first"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="name.last"]')).toBeInTheDocument();
    expect(container.querySelector('[name="service.branch"]')).toBeInTheDocument();
    expect(container.querySelector('[name="vet_type"]')).toBeInTheDocument();

    expect(container.querySelector('input[name="address.street"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.city"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.county"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.state"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.zip"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.phone_day"]')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /create veteran/i })).toBeInTheDocument();
  });

  test('submits valid data and creates a veteran', async () => {
    const user = userEvent.setup();
    mockCreateVeteran.mockResolvedValue({ _id: 'veteran-123' });

    const { container } = render(<VeteranCreateForm />);
    await fillValidForm(user, container);

    await user.click(screen.getByRole('button', { name: /create veteran/i }));

    await waitFor(() => {
      expect(mockCreateVeteran).toHaveBeenCalledTimes(1);
    });

    const payload = mockCreateVeteran.mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        type: 'Veteran',
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
      expect(toast.success).toHaveBeenCalledWith('Veteran created');
      expect(mockPush).toHaveBeenCalledWith('/veterans/details?id=veteran-123');
    });
  });

  test('blocks submit when first name is empty and shows a validation error', async () => {
    const user = userEvent.setup();
    const { container } = render(<VeteranCreateForm />);

    // Fill everything except first name
    await user.type(container.querySelector('input[name="name.last"]'), 'Smith');
    await selectMuiOption(user, container, 'service.branch', 'Army');
    await selectMuiOption(user, container, 'vet_type', 'Vietnam');
    await user.type(container.querySelector('input[name="address.street"]'), '123 Main St');
    await user.type(container.querySelector('input[name="address.city"]'), 'Madison');
    await user.type(container.querySelector('input[name="address.county"]'), 'Dane');
    await user.type(container.querySelector('input[name="address.state"]'), 'WI');
    await user.type(container.querySelector('input[name="address.zip"]'), '53703');
    await user.type(container.querySelector('input[name="address.phone_day"]'), '608-555-1234');

    await user.click(screen.getByRole('button', { name: /create veteran/i }));

    await waitFor(() => {
      const errorMessage = container.querySelector('.MuiFormHelperText-root.Mui-error');
      expect(errorMessage).toBeInTheDocument();
    });

    expect(mockCreateVeteran).not.toHaveBeenCalled();
  });

  test('shows an error toast and does not navigate when the API call fails', async () => {
    const user = userEvent.setup();
    mockCreateVeteran.mockRejectedValue(new Error('Network error occurred'));

    const { container } = render(<VeteranCreateForm />);
    await fillValidForm(user, container);

    await user.click(screen.getByRole('button', { name: /create veteran/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create veteran: Network error occurred');
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
