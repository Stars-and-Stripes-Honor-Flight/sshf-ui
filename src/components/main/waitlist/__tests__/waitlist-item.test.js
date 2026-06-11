import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { WaitlistItem } from '@/components/main/waitlist/waitlist-item';

const renderRow = (ui) => render(<table><tbody>{ui}</tbody></table>);

const veteranEntry = {
  id: 'vet-1',
  name: 'James Weimer',
  age: 90,
  city: 'Schiller Park',
  appdate: '2024-07-25',
  birth_date: '1935-04-01',
  prefs: 'Guardian fee waiver.mm',
  status: 'Future-Fall',
  vet_type: 'Korea',
  group: '855-1',
  pairings: [{ id: 'grd-9', name: 'James Weimer Jr' }],
};

const guardianEntry = {
  id: 'grd-1',
  name: 'Rachel Stubner',
  age: 56,
  city: 'Menasha',
  appdate: '2023-06-12',
  birth_date: '1970-02-15',
  prefs: 'Good for GRB',
  status: 'Active',
  vet_type: '',
  group: '',
  pairings: [
    { id: 'vet-2', name: 'Gary Stubner' },
    { id: 'vet-3', name: 'Vernin Tretow' },
  ],
};

describe('WaitlistItem', () => {
  test('renders veteran row with position, conflict chip, flight group and guardian link', () => {
    renderRow(<WaitlistItem entry={veteranEntry} type="veterans" position={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'James Weimer' })).toHaveAttribute(
      'href',
      '/veterans/details?id=vet-1'
    );
    expect(screen.getByText('Korea')).toBeInTheDocument();
    expect(screen.getByText('855-1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'James Weimer Jr' })).toHaveAttribute(
      'href',
      '/guardians/details?id=grd-9'
    );
    expect(screen.getByText('Guardian fee waiver.mm')).toBeInTheDocument();
  });

  test('shows status chip with color when status is not Active', () => {
    renderRow(<WaitlistItem entry={veteranEntry} type="veterans" position={1} />);

    const chip = screen.getByText('Future-Fall');
    expect(chip).toBeInTheDocument();
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
  });

  test.each([
    ['Future-Spring', 'MuiChip-colorSuccess'],
    ['Future-Fall', 'MuiChip-colorWarning'],
    ['Future-PostRestriction', 'MuiChip-colorError'],
  ])('maps status %s to %s', (status, expectedClass) => {
    renderRow(
      <WaitlistItem entry={{ ...veteranEntry, status }} type="veterans" position={1} />
    );

    expect(screen.getByText(status).closest('.MuiChip-root')).toHaveClass(expectedClass);
  });

  test('does not render a status chip when status is Active', () => {
    renderRow(
      <WaitlistItem entry={{ ...veteranEntry, status: 'Active' }} type="veterans" position={1} />
    );

    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });

  test('renders guardian row with veteran pairing links and no conflict or group cells', () => {
    renderRow(<WaitlistItem entry={guardianEntry} type="guardians" position={7} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gary Stubner' })).toHaveAttribute(
      'href',
      '/veterans/details?id=vet-2'
    );
    expect(screen.getByRole('link', { name: 'Vernin Tretow' })).toHaveAttribute(
      'href',
      '/veterans/details?id=vet-3'
    );
    expect(screen.queryByText('Korea')).not.toBeInTheDocument();
    // Guardian rows: position, name, age, birth date, city, app date, veterans, notes = 8 cells
    expect(screen.getAllByRole('cell')).toHaveLength(8);
  });

  test('veteran rows have 10 cells', () => {
    renderRow(<WaitlistItem entry={veteranEntry} type="veterans" position={1} />);

    expect(screen.getAllByRole('cell')).toHaveLength(10);
  });

  test('shows em-dash for missing pairing, conflict and group', () => {
    renderRow(
      <WaitlistItem
        entry={{ ...veteranEntry, pairings: [], vet_type: '', group: '', prefs: '' }}
        type="veterans"
        position={1}
      />
    );

    // conflict, group, pairing and notes cells all fall back to em-dash
    expect(screen.getAllByText('—')).toHaveLength(4);
  });
});
