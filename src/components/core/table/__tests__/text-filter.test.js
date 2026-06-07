import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TextFilterButton } from '@/components/core/table/text-filter';

describe('TextFilterButton', () => {
  test('phone mode shows helper text and does not apply while typing', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <TextFilterButton
        label="Phone"
        value=""
        handleChange={handleChange}
        applyMode="explicit"
        helperText="Enter at least 3 digits"
        placeholder="Phone number..."
        validate={(val) => ({
          valid: (val || '').replace(/\D/g, '').length >= 3,
          message: 'Enter at least 3 digits',
        })}
      />
    );

    await user.click(screen.getByText('Phone'));

    const input = screen.getByRole('textbox');
    await user.type(input, '41');

    await waitFor(() => {
      expect(handleChange).not.toHaveBeenCalled();
    }, { timeout: 800 });

    expect(screen.getByText('Enter at least 3 digits')).toBeInTheDocument();
  });

  test('phone mode applies on Apply when valid', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <TextFilterButton
        label="Phone"
        value=""
        handleChange={handleChange}
        applyMode="explicit"
        helperText="Enter at least 3 digits"
        placeholder="Phone number..."
        validate={(val) => ({
          valid: (val || '').replace(/\D/g, '').length >= 3,
          message: 'Enter at least 3 digits',
        })}
      />
    );

    await user.click(screen.getByText('Phone'));

    const input = screen.getByRole('textbox');
    await user.type(input, '414-817');

    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(handleChange).toHaveBeenCalledWith('414-817');
  });

  test('phone mode does not apply when fewer than 3 digits on Apply click', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <TextFilterButton
        label="Phone"
        value=""
        handleChange={handleChange}
        applyMode="explicit"
        helperText="Enter at least 3 digits"
        validate={(val) => ({
          valid: (val || '').replace(/\D/g, '').length >= 3,
          message: 'Enter at least 3 digits',
        })}
      />
    );

    await user.click(screen.getByText('Phone'));

    const input = screen.getByRole('textbox');
    await user.type(input, '41');

    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByText('Enter at least 3 digits')).toBeInTheDocument();
  });

  test('default text mode still debounces apply while typing', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <TextFilterButton
        label="Name"
        value=""
        handleChange={handleChange}
      />
    );

    await user.click(screen.getByText('Name'));

    const input = screen.getByRole('textbox');
    await user.type(input, 'Smi');

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});
