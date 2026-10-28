import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  renderSeatCell,
  renderBusCell,
  renderGroupCell,
  renderMedExprncCell,
  renderFltGrpMedExpCell,
  renderMedLvlCell,
  renderMedicalLevelCell,
  renderActivityCell,
  renderBirthDateCell,
  renderMiddleNameCell,
  renderMobilePhoneCell,
  renderTrainingCell,
  renderTrainingNotesCell,
  renderNotesCell,
  renderShirtSizeCell,
  renderJacketSizeCell,
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

describe('renderFltGrpMedExpCell', () => {
  test('shows veteran flight group', () => {
    render(renderFltGrpMedExpCell({ type: 'Veteran', group: 'Alpha' }, 'Veteran'));

    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  test('shows guardian med experience', () => {
    render(renderFltGrpMedExpCell({ med_exprnc: 'RN' }, 'Guardian'));

    expect(screen.getByText('RN')).toBeInTheDocument();
  });

  test('shows em dash for empty guardian med experience', () => {
    render(renderFltGrpMedExpCell({ med_exprnc: 'false' }, 'Guardian'));

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('renderMedExprncCell', () => {
  test('shows guardian med experience', () => {
    render(renderMedExprncCell({ med_exprnc: 'RN, ICU' }, 'Guardian'));

    expect(screen.getByText('RN, ICU')).toBeInTheDocument();
  });

  test('shows em dash for veteran row', () => {
    render(renderMedExprncCell({ med_exprnc: 'RN' }, 'Veteran'));

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('treats empty and false as em dash for guardian', () => {
    const { rerender } = render(renderMedExprncCell({ med_exprnc: '' }, 'Guardian'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedExprncCell({ med_exprnc: 'false' }, 'Guardian'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedExprncCell({ med_exprnc: ' FALSE ' }, 'Guardian'));
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('renderMedLvlCell', () => {
  test('shows the veteran bracket and drops the limitations text', () => {
    render(renderMedLvlCell({ med_limits: '[2/3] Uses walker' }, 'Veteran'));

    expect(screen.getByText('[2/3]')).toBeInTheDocument();
    expect(screen.queryByText(/Uses walker/)).not.toBeInTheDocument();
  });

  test('trims whitespace around and inside the veteran bracket', () => {
    const { rerender } = render(
      renderMedLvlCell({ med_limits: '  [ 2 / 3 ]   Uses walker  ' }, 'Veteran')
    );
    expect(screen.getByText('[2/3]')).toBeInTheDocument();

    rerender(renderMedLvlCell({ med_limits: '[2/ ] walker' }, 'Veteran'));
    expect(screen.getByText('[2/]')).toBeInTheDocument();

    rerender(renderMedLvlCell({ med_limits: '[ /3]' }, 'Veteran'));
    expect(screen.getByText('[/3]')).toBeInTheDocument();
  });

  test('shows an em dash when the veteran level is blank or missing', () => {
    const { rerender } = render(renderMedLvlCell({ med_limits: '[ / ]' }, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ med_limits: '[/]' }, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ med_limits: '[   /   ] oxygen' }, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ med_limits: '' }, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ med_limits: '   ' }, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({}, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ med_limits: 'Uses walker' }, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ medical_level: '2', med_limits: '' }, 'Veteran'));
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  test('shows the guardian medical level letter', () => {
    render(renderMedLvlCell({ medical_level: 'B' }, 'Guardian'));

    expect(screen.getByText('B')).toBeInTheDocument();
  });

  test('trims the guardian letter and shows an em dash when it is empty', () => {
    const { rerender } = render(renderMedLvlCell({ medical_level: '  D  ' }, 'Guardian'));
    expect(screen.getByText('D')).toBeInTheDocument();

    rerender(renderMedLvlCell({ medical_level: '' }, 'Guardian'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ medical_level: '   ' }, 'Guardian'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({}, 'Guardian'));
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(renderMedLvlCell({ medical_level: '', med_limits: '[2/3] walker' }, 'Guardian'));
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('[2/3]')).not.toBeInTheDocument();
  });

  test('routes med_lvl through renderActivityCell', () => {
    render(
      renderActivityCell('med_lvl', { med_limits: '[1/2] cane' }, null, 'Veteran', {}, null, false)
    );

    expect(screen.getByText('[1/2]')).toBeInTheDocument();
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

const apparelHandlers = {
  EditableField: MockTrainingField,
  handleApparelNotesChange: jest.fn(),
};

function MockApparelSizeSelect({ value, onChange, personId, personType, disabled, ariaLabel }) {
  return (
    <select
      aria-label={ariaLabel}
      value={value || 'None'}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value, personId, personType)}
    >
      <option value="None">None</option>
      <option value="M">M</option>
      <option value="L">L</option>
    </select>
  );
}

const apparelSizeHandlers = {
  ApparelShirtSizeSelect: (props) => <MockApparelSizeSelect {...props} ariaLabel="Shirt size" />,
  ApparelJacketSizeSelect: (props) => <MockApparelSizeSelect {...props} ariaLabel="Jacket size" />,
  handleApparelShirtSizeChange: jest.fn(),
  handleApparelJacketSizeChange: jest.fn(),
};

describe('apparel size roster cells (issue #275)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses apparel_shirt_size only and ignores application shirt field', async () => {
    const user = userEvent.setup();
    render(
      renderShirtSizeCell(
        { id: 'vet-1', shirt: 'XL', apparel_shirt_size: 'M' },
        'Veteran',
        apparelSizeHandlers
      )
    );

    const shirt = screen.getByLabelText('Shirt size');
    expect(shirt).toHaveValue('M');
    await user.selectOptions(shirt, 'L');
    expect(apparelSizeHandlers.handleApparelShirtSizeChange).toHaveBeenCalledWith('L', 'vet-1', 'Veteran');
  });

  test('defaults empty apparel shirt size to None without using application shirt', () => {
    render(
      renderShirtSizeCell(
        { id: 'vet-2', shirt: 'XL' },
        'Veteran',
        apparelSizeHandlers
      )
    );

    expect(screen.getByLabelText('Shirt size')).toHaveValue('None');
  });

  test('saves jacket size on change for guardians', async () => {
    const user = userEvent.setup();
    render(
      renderJacketSizeCell(
        { id: 'grd-1', apparel_jacket_size: 'M' },
        'Guardian',
        apparelSizeHandlers
      )
    );

    const jacket = screen.getByLabelText('Jacket size');
    expect(jacket).toHaveValue('M');
    await user.selectOptions(jacket, 'L');
    expect(apparelSizeHandlers.handleApparelJacketSizeChange).toHaveBeenCalledWith('L', 'grd-1', 'Guardian');
  });
});

describe('apparel notes roster cell (issue #275)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses a multiline apparel notes field for veterans and guardians', async () => {
    const user = userEvent.setup();

    render(
      renderNotesCell(
        { id: 'vet-1', apparel_notes: 'Jacket exchange pending' },
        'Veteran',
        apparelHandlers
      )
    );

    const veteranNotes = screen.getByRole('textbox', { name: 'Apparel notes' });
    expect(veteranNotes.tagName).toBe('TEXTAREA');
    expect(veteranNotes).toHaveValue('Jacket exchange pending');
    await user.clear(veteranNotes);
    await user.type(veteranNotes, 'Ordered 10/21');
    await user.tab();
    expect(apparelHandlers.handleApparelNotesChange).toHaveBeenCalledWith('Ordered 10/21', 'vet-1', 'Veteran');
  });

  test('saves guardian apparel notes on blur', async () => {
    const user = userEvent.setup();
    render(
      renderNotesCell(
        { id: 'grd-1', apparel_notes: 'Needs XL shirt' },
        'Guardian',
        apparelHandlers
      )
    );

    const guardianNotes = screen.getByRole('textbox', { name: 'Apparel notes' });
    expect(guardianNotes).toHaveValue('Needs XL shirt');
    await user.clear(guardianNotes);
    await user.type(guardianNotes, 'Shipped');
    await user.tab();
    expect(apparelHandlers.handleApparelNotesChange).toHaveBeenCalledWith('Shipped', 'grd-1', 'Guardian');
  });
});

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

  test('shows training type and an editable complete checkbox for guardians', async () => {
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
        { id: 'vet-1', training: 'Main', training_complete: true, mail_call_received: false },
        'Veteran',
        trainingHandlers
      )
    );
    expect(screen.queryByText('Main')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Training complete' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Mail call received' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Mail call received' })).not.toBeChecked();
  });

  test('uses a multiline training notes field for guardians and a mail call checkbox for veterans', async () => {
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

    rerender(
      renderTrainingNotesCell(
        { id: 'vet-1', flight_training_notes: 'nope', mail_call_adopt: true },
        'Veteran',
        trainingHandlers
      )
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('nope')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Mail call adoption' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Mail call adoption' })).toBeChecked();
  });

  test('shows a read-only mail call received checkbox for veterans, checked and unchecked', () => {
    const { rerender } = render(
      renderTrainingCell({ id: 'vet-1', mail_call_received: true }, 'Veteran', trainingHandlers)
    );

    const checked = screen.getByRole('checkbox', { name: 'Mail call received' });
    expect(checked).toBeChecked();
    expect(checked).toBeDisabled();
    expect(checked).toHaveAttribute('readonly');
    expect(screen.queryByText('Mail call received')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Training complete' })).not.toBeInTheDocument();

    rerender(renderTrainingCell({ id: 'vet-2', mail_call_received: false }, 'Veteran', trainingHandlers));
    const unchecked = screen.getByRole('checkbox', { name: 'Mail call received' });
    expect(unchecked).not.toBeChecked();
    expect(unchecked).toBeDisabled();
    expect(unchecked).toHaveAttribute('readonly');
    expect(screen.queryByText('Mail call received')).not.toBeInTheDocument();
  });

  test('shows a read-only mail call adoption checkbox for veterans, checked and unchecked', () => {
    const { rerender } = render(
      renderTrainingNotesCell({ id: 'vet-1', mail_call_adopt: false }, 'Veteran', trainingHandlers)
    );

    const unchecked = screen.getByRole('checkbox', { name: 'Mail call adoption' });
    expect(unchecked).not.toBeChecked();
    expect(unchecked).toBeDisabled();
    expect(unchecked).toHaveAttribute('readonly');
    expect(screen.queryByText('Mail call adoption')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Training notes' })).not.toBeInTheDocument();

    rerender(renderTrainingNotesCell({ id: 'vet-2', mail_call_adopt: true }, 'Veteran', trainingHandlers));
    const checked = screen.getByRole('checkbox', { name: 'Mail call adoption' });
    expect(checked).toBeChecked();
    expect(checked).toBeDisabled();
    expect(checked).toHaveAttribute('readonly');
  });

  test('keeps guardian training controls when mail call flags are present', () => {
    const { rerender } = render(
      renderTrainingCell(
        {
          id: 'grd-1',
          training: 'Phone',
          training_complete: false,
          mail_call_received: true,
          mail_call_adopt: true,
        },
        'Guardian',
        trainingHandlers
      )
    );

    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Training complete' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Training complete' })).not.toBeChecked();
    expect(screen.queryByRole('checkbox', { name: 'Mail call received' })).not.toBeInTheDocument();

    rerender(
      renderTrainingNotesCell(
        { id: 'grd-1', flight_training_notes: 'Passport later', mail_call_adopt: true },
        'Guardian',
        trainingHandlers
      )
    );
    expect(screen.getByRole('textbox', { name: 'Training notes' })).toHaveValue('Passport later');
    expect(screen.queryByRole('checkbox', { name: 'Mail call adoption' })).not.toBeInTheDocument();
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
