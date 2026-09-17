import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderSeatCell, renderBusCell, renderGroupCell } from '../roster-cell-renderers';

function MockEditableField({ value, onBlur, placeholder, maxWidth, minWidth, inputProps }) {
  return (
    <input
      data-testid="editable-seat"
      data-max-width={maxWidth}
      data-min-width={minWidth}
      aria-label={placeholder}
      defaultValue={value}
      onBlur={(e) => onBlur(e.target.value)}
      {...inputProps}
    />
  );
}

const baseHandlers = {
  EditableField: MockEditableField,
  handleSeatChange: jest.fn(),
  BusSelector: () => <div data-testid="bus-selector" />,
  handleBusChange: jest.fn(),
};

describe('renderSeatCell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders editable seat field for veteran', () => {
    render(
      renderSeatCell(
        { id: 'vet-1', seat: '21F' },
        'Veteran',
        baseHandlers
      )
    );

    expect(screen.getByDisplayValue('21F')).toBeInTheDocument();
    expect(screen.getByTestId('editable-seat')).toHaveAttribute('data-min-width');
  });

  test('renders editable seat field for guardian (issue #158)', () => {
    render(
      renderSeatCell(
        { id: 'grd-1', seat: '25B' },
        'Guardian',
        baseHandlers
      )
    );

    expect(screen.getByDisplayValue('25B')).toBeInTheDocument();
    expect(screen.queryByText('25B')).not.toBeInTheDocument();
  });

  test('calls handleSeatChange with guardian id when guardian seat is edited', async () => {
    const user = userEvent.setup();
    const handleSeatChange = jest.fn();

    render(
      renderSeatCell(
        { id: 'grd-1', seat: '25B' },
        'Guardian',
        { ...baseHandlers, handleSeatChange }
      )
    );

    const input = screen.getByDisplayValue('25B');
    await user.clear(input);
    await user.type(input, '21F');
    await user.tab();

    expect(handleSeatChange).toHaveBeenCalledWith('21F', 'grd-1', 'Guardian');
  });
});

describe('renderBusCell', () => {
  test('guardian bus remains read-only display', () => {
    render(renderBusCell({ bus: 'Alpha3' }, 'Guardian', baseHandlers));

    expect(screen.queryByTestId('bus-selector')).not.toBeInTheDocument();
    expect(screen.getByText('Alpha3')).toBeInTheDocument();
  });
});

describe('renderGroupCell', () => {
  test('shows trimmed group for veteran', () => {
    render(renderGroupCell({ type: 'Veteran', group: '  Bravo  ' }, 'Veteran'));

    expect(screen.getByText('Bravo')).toBeInTheDocument();
  });

  test('shows em dash for empty veteran group', () => {
    render(renderGroupCell({ type: 'Veteran', group: ' ' }, 'Veteran'));

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('shows em dash for guardian row', () => {
    render(renderGroupCell({ type: 'Guardian', group: 'Alpha' }, 'Guardian'));

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
