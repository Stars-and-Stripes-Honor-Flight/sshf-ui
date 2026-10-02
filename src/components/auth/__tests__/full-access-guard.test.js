import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PERMISSIONS } from '@/lib/auth/permissions';

const mockUsePathname = jest.fn();
const mockUsePermissions = jest.fn();
const mockUseMembershipProbeFailed = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockUsePermissions(),
  useMembershipProbeFailed: () => mockUseMembershipProbeFailed(),
}));

import { FullAccessGuard } from '../full-access-guard';

function permissionsFor(allowed, hasAccess = allowed.length > 0) {
  return {
    can: (permission) => allowed.includes(permission),
    hasAccess,
    permissions: allowed,
  };
}

describe('FullAccessGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMembershipProbeFailed.mockReturnValue(false);
  });

  test('renders read pages for a READ user without full-access permissions', () => {
    mockUsePermissions.mockReturnValue(
      permissionsFor([PERMISSIONS.RECORDS_READ, PERMISSIONS.EXPORTS_READ])
    );
    mockUsePathname.mockReturnValue('/search');

    render(
      <FullAccessGuard>
        <div>Protected content</div>
      </FullAccessGuard>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText(/not authorized/i)).not.toBeInTheDocument();
  });

  test('renders review pages for a REVIEW user', () => {
    mockUsePermissions.mockReturnValue(
      permissionsFor([PERMISSIONS.APPLICATIONS_REVIEW, PERMISSIONS.APPLICATIONS_ACCEPT])
    );
    mockUsePathname.mockReturnValue('/review/applications');

    render(
      <FullAccessGuard>
        <div>Review queue</div>
      </FullAccessGuard>
    );

    expect(screen.getByText('Review queue')).toBeInTheDocument();
  });

  test('blocks a FULL-only route for a WRITE user', () => {
    mockUsePermissions.mockReturnValue(
      permissionsFor([PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_WRITE, PERMISSIONS.EXPORTS_READ])
    );
    mockUsePathname.mockReturnValue('/flights/create');

    render(
      <FullAccessGuard>
        <div>Create flight</div>
      </FullAccessGuard>
    );

    expect(screen.queryByText('Create flight')).not.toBeInTheDocument();
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
    expect(screen.getByText(/flights:manage/i)).toBeInTheDocument();
  });

  test('shows the no-access panel when the user has an empty permission summary', () => {
    mockUsePermissions.mockReturnValue(permissionsFor([]));
    mockUsePathname.mockReturnValue('/search');

    render(
      <FullAccessGuard>
        <div>Protected content</div>
      </FullAccessGuard>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /not authorized/i })).toBeInTheDocument();
    expect(screen.getByText(/contact an administrator/i)).toBeInTheDocument();
  });

  test('shows an API/connectivity message when the permissions probe failed', () => {
    mockUsePermissions.mockReturnValue(permissionsFor([]));
    mockUseMembershipProbeFailed.mockReturnValue(true);
    mockUsePathname.mockReturnValue('/search');

    render(
      <FullAccessGuard>
        <div>Protected content</div>
      </FullAccessGuard>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByText(/could not verify your permissions/i)).toBeInTheDocument();
    expect(screen.queryByText(/contact an administrator/i)).not.toBeInTheDocument();
  });

  test('still renders children on settings routes without permissions', () => {
    mockUsePermissions.mockReturnValue(permissionsFor([]));
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
