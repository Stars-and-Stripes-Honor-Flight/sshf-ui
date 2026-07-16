import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockSearchParamsGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
    toString: () => '',
  }),
}));

const mockSearch = jest.fn();

jest.mock('@/lib/api', () => ({
  api: {
    search: (...args) => mockSearch(...args),
  },
}));

jest.mock('@/components/core/toaster', () => ({
  toast: { error: jest.fn() },
}));

import { ApiTable } from '@/components/core/table/api-table';

const columns = [
  { field: 'name', name: 'Name', formatter: (row) => row.name },
];

const rows = [
  { id: '1', name: 'Paired Vet', pairing: 'Some Guardian' },
  { id: '2', name: 'Unpaired Vet', pairing: 'None' },
  { id: '3', name: 'Unpaired Guardian', pairing: null },
];

describe('ApiTable pairing filter', () => {
  beforeEach(() => {
    mockSearch.mockReset();
    mockSearch.mockResolvedValue({ rows: rows.map(r => ({ id: r.id, value: r })), total_rows: rows.length });
    mockSearchParamsGet.mockImplementation(() => null);
  });

  test('shows all rows when pairing filter is not set to Unpaired', async () => {
    render(
      <ApiTable
        entity="VeteransAndGuardians"
        columns={columns}
        filters={[{ property: 'pairing', propertyFriendlyName: 'Pairing', filterType: 'combo', options: [] }]}
      />
    );

    await waitFor(() => expect(screen.getByText('Paired Vet')).toBeInTheDocument());
    expect(screen.getByText('Unpaired Vet')).toBeInTheDocument();
    expect(screen.getByText('Unpaired Guardian')).toBeInTheDocument();
  });

  test('filters out paired rows when pairing filter is Unpaired', async () => {
    mockSearchParamsGet.mockImplementation((key) => (key === 'pairing' ? 'Unpaired' : null));

    render(
      <ApiTable
        entity="VeteransAndGuardians"
        columns={columns}
        filters={[{ property: 'pairing', propertyFriendlyName: 'Pairing', filterType: 'combo', options: [] }]}
      />
    );

    await waitFor(() => expect(screen.getByText('Unpaired Vet')).toBeInTheDocument());
    expect(screen.getByText('Unpaired Guardian')).toBeInTheDocument();
    expect(screen.queryByText('Paired Vet')).not.toBeInTheDocument();
  });
});
