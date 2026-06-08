import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
import { FlightGroupField } from '../flight-group-field';
import { api } from '@/lib/api';
import { toast } from '@/components/core/toaster';

jest.mock('@/lib/api', () => ({
  api: {
    getWaitlistVeteranGroups: jest.fn(),
  },
}));

jest.mock('@/components/core/toaster', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockGroups = [
  { group: '853-3', names: ['William Mathias (SSHF-Mark1)', 'Robert Kossow (SSHF-Mark1)'] },
  { group: '855-2', names: ['Philip Schultz'] },
];

function TestWrapper({ children, defaultValues = {} }) {
  const { control, watch } = useForm({ defaultValues });
  return (
    <>
      {React.cloneElement(children, { control })}
      <span data-testid="field-value">{watch('flight.group') ?? ''}</span>
    </>
  );
}

describe('FlightGroupField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getWaitlistVeteranGroups.mockResolvedValue(mockGroups);
  });

  test('renders Flight Group label with existing value', () => {
    render(
      <TestWrapper defaultValues={{ 'flight.group': '853-3' }}>
        <FlightGroupField />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Flight Group')).toHaveValue('853-3');
  });

  test('does not render a clear button when field has a value', () => {
    render(
      <TestWrapper defaultValues={{ 'flight.group': '853-3' }}>
        <FlightGroupField />
      </TestWrapper>
    );

    expect(screen.queryByTitle('Clear')).not.toBeInTheDocument();
  });

  test('displays the full group value in the input', () => {
    render(
      <TestWrapper defaultValues={{ 'flight.group': '898-3' }}>
        <FlightGroupField />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Flight Group');
    expect(input).toHaveValue('898-3');
    expect(input).toHaveAttribute('maxLength', '15');
  });

  test('opening dropdown triggers api.getWaitlistVeteranGroups once', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper defaultValues={{ 'flight.group': '' }}>
        <FlightGroupField />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Flight Group');
    await user.click(input);

    await waitFor(() => {
      expect(api.getWaitlistVeteranGroups).toHaveBeenCalledTimes(1);
    });

    await user.click(input);
    expect(api.getWaitlistVeteranGroups).toHaveBeenCalledTimes(1);
  });

  test('selecting an option sets input to group string', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper defaultValues={{ 'flight.group': '' }}>
        <FlightGroupField />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Flight Group');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /853-3/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: /853-3/i }));

    expect(input).toHaveValue('853-3');
    expect(screen.getByTestId('field-value')).toHaveTextContent('853-3');
  });

  test('typing a custom value updates the field without selecting an option', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper defaultValues={{ 'flight.group': '' }}>
        <FlightGroupField />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Flight Group');
    await user.type(input, 'CUSTOM-GRP');

    expect(input).toHaveValue('CUSTOM-GRP');
    expect(screen.getByTestId('field-value')).toHaveTextContent('CUSTOM-GRP');
  });

  test('respects disabled prop', () => {
    render(
      <TestWrapper defaultValues={{ 'flight.group': '' }}>
        <FlightGroupField disabled />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Flight Group')).toBeDisabled();
  });

  test('shows error helper text when error prop provided', () => {
    render(
      <TestWrapper defaultValues={{ 'flight.group': '' }}>
        <FlightGroupField error={{ message: 'Group is invalid' }} />
      </TestWrapper>
    );

    expect(screen.getByText('Group is invalid')).toBeInTheDocument();
  });

  test('on API failure user can still type manually', async () => {
    const user = userEvent.setup();
    api.getWaitlistVeteranGroups.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper defaultValues={{ 'flight.group': '' }}>
        <FlightGroupField />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Flight Group');
    await user.click(input);

    await waitFor(() => {
      expect(api.getWaitlistVeteranGroups).toHaveBeenCalled();
    });

    await user.type(input, 'MANUAL-VAL');

    expect(input).toHaveValue('MANUAL-VAL');
    expect(screen.getByTestId('field-value')).toHaveTextContent('MANUAL-VAL');
  });
});
