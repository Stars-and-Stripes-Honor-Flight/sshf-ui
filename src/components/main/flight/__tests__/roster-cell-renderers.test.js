import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  renderSeatCell,
  renderBusCell,
  renderGroupCell,
  renderMedicalLevelCell,
  renderBirthDateCell,
  renderMiddleNameCell,
  renderMobilePhoneCell,
  renderTrainingCell,
  renderTrainingNotesCell,
  renderWaiverCell,
  renderSeeDocCell,
} from '../roster-cell-renderers';

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

describe('renderMedicalLevelCell', () => {
  test('shows veteran medical review notes', () => {
    render(
      renderMedicalLevelCell(
        { medical_review: 'Needs wheelchair assist at gate', medical_level: '2' },
        'Veteran'
      )
    );

    expect(screen.getByText('Needs wheelchair assist at gate')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  test('shows em dash when veteran has no medical review notes', () => {
    render(renderMedicalLevelCell({ medical_level: '2' }, 'Veteran'));

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('shows guardian medical experience unchanged', () => {
    render(renderMedicalLevelCell({ med_exprnc: 'RN, ICU experience' }, 'Guardian'));

    expect(screen.getByText('RN, ICU experience')).toBeInTheDocument();
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

function MockTrainingField({ value, onBlur, multiline, inputProps }) {
  const shared = {
    'aria-label': inputProps?.['aria-label'],
    defaultValue: value,
    onBlur: (event) => onBlur(event.target.value),
  };

  if (multiline) {
    return <textarea data-testid="training-notes" {...shared} />;
  }

  return <input {...shared} />;
}

function MockTrainingCheckbox({ checked, onChange, ariaLabel }) {
  return (
    <input
      type="checkbox"
      aria-label={ariaLabel}
      defaultChecked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

const trainingHandlers = {
  EditableField: MockTrainingField,
  EditableCheckbox: MockTrainingCheckbox,
  handleMiddleNameChange: jest.fn(),
  handleMobilePhoneChange: jest.fn(),
  handleTrainingCompleteChange: jest.fn(),
  handleTrainingNotesChange: jest.fn(),
};

describe('training roster cells (issue #212)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('formats date of birth for both roles and leaves it read-only', () => {
    const { rerender } = render(
      renderBirthDateCell({ birth_date: '1969-05-07' }, 'Guardian')
    );
    expect(screen.getByText('05/07/1969')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    rerender(renderBirthDateCell({ birth_date: '1945-01-02' }, 'Veteran'));
    expect(screen.getByText('01/02/1945')).toBeInTheDocument();
  });

  test('shows an em dash when date of birth is missing', () => {
    render(renderBirthDateCell({}, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('edits middle name for a guardian', async () => {
    const user = userEvent.setup();
    render(
      renderMiddleNameCell(
        { id: 'grd-1', name_middle: 'Marie' },
        'Guardian',
        trainingHandlers
      )
    );

    const input = screen.getByRole('textbox', { name: 'Middle name' });
    await user.clear(input);
    await user.type(input, 'Renee');
    await user.tab();

    expect(trainingHandlers.handleMiddleNameChange).toHaveBeenCalledWith('Renee', 'grd-1', 'Guardian');
  });

  test('edits mobile phone for a veteran', async () => {
    const user = userEvent.setup();
    render(
      renderMobilePhoneCell(
        { id: 'vet-1', phone_mbl: '414-111-0000' },
        'Veteran',
        trainingHandlers
      )
    );

    const input = screen.getByRole('textbox', { name: 'Mobile phone' });
    await user.clear(input);
    await user.type(input, '414-507-0565');
    await user.tab();

    expect(trainingHandlers.handleMobilePhoneChange).toHaveBeenCalledWith(
      '414-507-0565',
      'vet-1',
      'Veteran'
    );
  });

  test('shows training type and an editable complete checkbox for guardians only', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      renderTrainingCell(
        { id: 'grd-1', training: 'Main', training_complete: false },
        'Guardian',
        trainingHandlers
      )
    );

    expect(screen.getByText('Main')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox', { name: 'Training complete' });
    await user.click(checkbox);
    expect(trainingHandlers.handleTrainingCompleteChange).toHaveBeenCalledWith(true, 'grd-1');

    rerender(
      renderTrainingCell(
        { id: 'vet-1', training: 'Main', training_complete: true },
        'Veteran',
        trainingHandlers
      )
    );
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  test('uses a multiline training notes field for guardians and an em dash for veterans', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      renderTrainingNotesCell(
        { id: 'grd-1', flight_training_notes: 'Passport later' },
        'Guardian',
        trainingHandlers
      )
    );

    const notes = screen.getByRole('textbox', { name: 'Training notes' });
    expect(notes.tagName).toBe('TEXTAREA');
    await user.clear(notes);
    await user.type(notes, 'Lives in MN');
    await user.tab();
    expect(trainingHandlers.handleTrainingNotesChange).toHaveBeenCalledWith('Lives in MN', 'grd-1');

    rerender(renderTrainingNotesCell({ id: 'vet-1', flight_training_notes: 'nope' }, 'Veteran', trainingHandlers));
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('shows read-only waiver and see doc checkboxes for guardians only', () => {
    const { rerender } = render(
      <div>
        {renderWaiverCell({ flight_waiver: true }, 'Guardian')}
        {renderSeeDocCell({ flight_training_see_doc: false }, 'Guardian')}
      </div>
    );

    expect(screen.getByRole('checkbox', { name: 'Waiver' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Waiver' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'See doc' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'See doc' })).not.toBeChecked();

    rerender(
      <div>
        {renderWaiverCell({ flight_waiver: true }, 'Veteran')}
        {renderSeeDocCell({ flight_training_see_doc: true }, 'Veteran')}
      </div>
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
