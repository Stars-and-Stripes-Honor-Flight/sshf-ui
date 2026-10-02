import { renderHook } from '@testing-library/react';

import { PERMISSIONS } from '@/lib/auth/permissions';

const mockUseUser = jest.fn();

jest.mock('../use-user', () => ({
  useUser: () => mockUseUser(),
}));

const { useHasFullAccess, useMembershipProbeFailed, usePermissions } = require('../use-permissions');

describe('usePermissions', () => {
  test('can() follows the permission summary, including READ without FULL', () => {
    mockUseUser.mockReturnValue({
      user: {
        hasAccess: true,
        roles: ['READ'],
        permissions: [PERMISSIONS.RECORDS_READ, PERMISSIONS.EXPORTS_READ],
      },
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.can(PERMISSIONS.RECORDS_READ)).toBe(true);
    expect(result.current.can(PERMISSIONS.RECORDS_WRITE)).toBe(false);
    expect(result.current.can(PERMISSIONS.FLIGHTS_MANAGE)).toBe(false);
    expect(result.current.hasAccess).toBe(true);
  });

  test('lets a REVIEW user reach review permissions without logistics permissions', () => {
    mockUseUser.mockReturnValue({
      user: {
        hasAccess: true,
        roles: ['REVIEW'],
        permissions: [PERMISSIONS.APPLICATIONS_REVIEW, PERMISSIONS.APPLICATIONS_ACCEPT],
      },
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.can(PERMISSIONS.APPLICATIONS_REVIEW)).toBe(true);
    expect(result.current.can(PERMISSIONS.APPLICATIONS_ACCEPT)).toBe(true);
    expect(result.current.can(PERMISSIONS.RECORDS_READ)).toBe(false);
  });

  test('reports no permissions when the user summary is empty', () => {
    mockUseUser.mockReturnValue({ user: { hasAccess: false, permissions: [], roles: [] } });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.can(PERMISSIONS.RECORDS_READ)).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });
});

describe('useHasFullAccess', () => {
  test('is true only when the user holds the FULL-only permissions', () => {
    mockUseUser.mockReturnValue({
      user: {
        permissions: [
          PERMISSIONS.RECORDS_READ,
          PERMISSIONS.RECORDS_WRITE,
          PERMISSIONS.EXPORTS_READ,
          PERMISSIONS.RECORDS_DELETE,
          PERMISSIONS.DOCUMENTS_ADMIN,
          PERMISSIONS.FLIGHTS_MANAGE,
        ],
      },
    });

    expect(renderHook(() => useHasFullAccess()).result.current).toBe(true);
  });

  test('is false for WRITE, which does not include flight management or deletes', () => {
    mockUseUser.mockReturnValue({
      user: {
        permissions: [PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_WRITE, PERMISSIONS.EXPORTS_READ],
      },
    });

    expect(renderHook(() => useHasFullAccess()).result.current).toBe(false);
  });
});

describe('useMembershipProbeFailed', () => {
  test('reports a failed permissions probe separately from an empty summary', () => {
    mockUseUser.mockReturnValue({
      user: { permissions: [], membershipProbeFailed: true },
    });

    expect(renderHook(() => useMembershipProbeFailed()).result.current).toBe(true);
  });
});
