import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { WaitlistMobileCard } from '@/components/main/waitlist/waitlist-mobile-card';

const veteranEntry = {
  id: 'vet-1',
  name: 'James Weimer',
  age: 90,
  city: 'Schiller Park',
  appdate: '2024-07-25',
  birth_date: '1935-04-01',
  prefs: 'Guardian fee waiver',
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
  pairings: [{ id: 'vet-2', name: 'Gary Stubner' }],
};

describe('WaitlistMobileCard', () => {
  test('renders veteran card with position, status chip, conflict, group and guardian link', () => {
    render(<WaitlistMobileCard entry={veteranEntry} type="veterans" position={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Future-Fall')).toBeInTheDocument();
    expect(screen.getByText('Korea')).toBeInTheDocument();
    expect(screen.getByText('855-1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'James Weimer Jr' })).toHaveAttribute(
      'href',
      '/guardians/details?id=grd-9'
    );
  });

  test('renders guardian card with veteran pairing and no conflict or group labels', () => {
    render(<WaitlistMobileCard entry={guardianEntry} type="guardians" position={7} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gary Stubner' })).toHaveAttribute(
      'href',
      '/veterans/details?id=vet-2'
    );
    expect(screen.queryByText('Conflict')).not.toBeInTheDocument();
    expect(screen.queryByText('Flight Group')).not.toBeInTheDocument();
    // Active status renders no chip
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });
});
