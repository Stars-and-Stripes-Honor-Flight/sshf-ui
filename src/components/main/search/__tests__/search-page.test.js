import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const mockReplace = jest.fn();
const mockSearchParamsGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}));

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({
    hasRole: jest.fn(() => true),
    isInGroup: jest.fn(() => true),
  }),
}));

import { getFlights, formatFlightNameForDisplay, ensureFlightPrefix } from '@/lib/flights';

const mockGetFlights = jest.fn(() => []);

jest.mock('@/lib/flights', () => ({
  getFlights: (...args) => mockGetFlights(...args),
  formatFlightNameForDisplay: jest.fn((name) => name),
  ensureFlightPrefix: jest.fn((name) => name),
}));

jest.mock('@/config', () => ({
  config: { site: { name: 'SSHF' } },
}));

jest.mock('@/components/core/table/api-table', () => ({
  ApiTable: ({ filters }) => (
    <div data-testid="api-table">
      {filters
        .filter((f) => !f.hidden)
        .map((f) => (
          <span key={f.property}>{f.propertyFriendlyName}</span>
        ))}
    </div>
  ),
}));

import Page from '@/app/(main)/search/page';

describe('Search page', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParamsGet.mockImplementation(() => null);
    mockGetFlights.mockReturnValue([]);
  });

  test('renders Phone filter in filter bar alongside Status', async () => {
    render(<Page />);

    expect(await screen.findByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('renders Phone filter after Flight when flights are loaded', async () => {
    mockGetFlights.mockReturnValue([{ _id: 'f1', name: 'SSHF-Test02' }]);

    render(<Page />);

    await screen.findByText('Flight');

    const filterLabels = screen.getByTestId('api-table').querySelectorAll('span');
    const labels = [...filterLabels].map((node) => node.textContent);
    expect(labels).toEqual(['Status', 'Flight', 'Phone']);
  });

  test('typing in last name clears phoneNum from URL', async () => {
    mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'phoneNum') return '414817';
      return null;
    });

    const user = userEvent.setup();
    render(<Page />);

    const lastNameInput = screen.getByPlaceholderText('Quick search by last name...');
    await user.type(lastNameInput, 'S');

    await waitFor(() => {
      const replaceCalls = mockReplace.mock.calls.map((call) => call[0]);
      expect(replaceCalls.some((url) => !url.includes('phoneNum='))).toBe(true);
    }, { timeout: 1000 });
  });

  test('allows continued typing in last name after phone filter was active', async () => {
    mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'phoneNum') return '414817';
      return null;
    });

    const user = userEvent.setup();
    render(<Page />);

    const lastNameInput = screen.getByPlaceholderText('Quick search by last name...');
    await user.type(lastNameInput, 'Smi');

    expect(lastNameInput).toHaveValue('Smi');
  });
});
