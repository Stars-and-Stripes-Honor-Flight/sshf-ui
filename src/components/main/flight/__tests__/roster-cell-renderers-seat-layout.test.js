import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderSeatCell } from '../roster-cell-renderers';
import { getColumnConfig, ACTIVITY_PRESETS } from '../column-configs';

function CapturingEditableField(props) {
  return (
    <div
      data-testid="seat-field-props"
      data-max-width={props.maxWidth}
      data-min-width={props.minWidth}
      data-input-min-width={props.inputProps?.style?.minWidth}
    >
      <input aria-label="seat" defaultValue={props.value} readOnly />
    </div>
  );
}

describe('seat column layout (issue #158)', () => {
  test('ops seat column has enough width for typical seat codes', () => {
    const seatColumn = getColumnConfig(ACTIVITY_PRESETS.OPS).find((col) => col.id === 'seat');
    expect(seatColumn.width).toBeGreaterThanOrEqual(112);
  });

  test('seat cell passes min width so short codes like 21F are not clipped', () => {
    render(
      renderSeatCell(
        { id: 'vet-1', seat: '21F' },
        'Veteran',
        {
          EditableField: CapturingEditableField,
          handleSeatChange: jest.fn(),
        }
      )
    );

    const propsNode = screen.getByTestId('seat-field-props');
    expect(Number(propsNode.getAttribute('data-min-width'))).toBeGreaterThanOrEqual(72);
    expect(propsNode.getAttribute('data-input-min-width')).toMatch(/ch/);
  });
});
