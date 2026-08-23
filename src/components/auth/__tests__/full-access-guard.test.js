import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockUsePathname = jest.fn();
const mockUseHasFullAccess = jest.fn();
const mockUseMembershipProbeFailed = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/hooks/use-permissions', () => ({
  useHasFullAccess: () => mockUseHasFullAccess(),
  useMembershipProbeFailed: () => mockUseMembershipProbeFailed(),
}));

import { FullAccessGuard } from '../full-access-guard';

describe('FullAccessGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMembershipProbeFailed.mockReturnValue(false);
  });

  test('renders children when the user has full access', () => {
    mockUseHasFullAccess.mockReturnValue(true);
    mockUsePathname.mockReturnValue('/search');

    render(
      <FullAccessGuard>
        <div>Protected content</div>
      </FullAccessGuard>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText(/not authorized/i)).not.toBeInTheDocument();
  });

  test('shows unauthorized panel for business routes without full access', () => {
    mockUseHasFullAccess.mockReturnValue(false);
    mockUsePathname.mockReturnValue('/flights/create');

    render(
      <FullAccessGuard>
        <div>Protected content</div>
      </FullAccessGuard>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
    expect(screen.getByText(/contact an administrator/i)).toBeInTheDocument();
  });

  test('shows an API/connectivity message when the membership probe failed', () => {
    mockUseHasFullAccess.mockReturnValue(false);
    mockUseMembershipProbeFailed.mockReturnValue(true);
    mockUsePathname.mockReturnValue('/search');

    render(
      <FullAccessGuard>
        <div>Protected content</div>
      </FullAccessGuard>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByText(/could not verify access group membership/i)).toBeInTheDocument();
    expect(screen.queryByText(/contact an administrator/i)).not.toBeInTheDocument();
  });

  test('still renders children on settings routes without full access', () => {
    mockUseHasFullAccess.mockReturnValue(false);
    mockUsePathname.mockReturnValue('/settings/account');

    render(
      <FullAccessGuard>
        <div>Settings content</div>
      </FullAccessGuard>
    );

    expect(screen.getByText('Settings content')).toBeInTheDocument();
    expect(screen.queryByText(/not authorized/i)).not.toBeInTheDocument();
  });
});
