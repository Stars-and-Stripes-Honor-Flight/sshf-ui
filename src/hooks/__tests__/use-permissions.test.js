import { renderHook } from '@testing-library/react';

const mockUseUser = jest.fn();

jest.mock('../use-user', () => ({
  useUser: () => mockUseUser(),
}));

describe('useHasFullAccess', () => {
  const originalRole = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS = 'sshf_app_dev_full_access@example.com';
    jest.resetModules();
  });

  afterEach(() => {
    if (originalRole === undefined) {
      delete process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
    } else {
      process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS = originalRole;
    }
  });

  test('returns true when the user is in the full-access group', () => {
    mockUseUser.mockReturnValue({
      user: {
        roles: [{ email: 'sshf_app_dev_full_access@example.com', name: 'full' }],
      },
    });

    let result;
    jest.isolateModules(() => {
      const { useHasFullAccess } = require('../use-permissions');
      result = renderHook(() => useHasFullAccess()).result;
    });

    expect(result.current).toBe(true);
  });

  test('returns false when the user is not in the full-access group', () => {
    mockUseUser.mockReturnValue({
      user: { roles: [] },
    });

    let result;
    jest.isolateModules(() => {
      const { useHasFullAccess } = require('../use-permissions');
      result = renderHook(() => useHasFullAccess()).result;
    });

    expect(result.current).toBe(false);
  });

  test('reports a failed membership probe separately from non-membership', () => {
    mockUseUser.mockReturnValue({
      user: { roles: [], membershipProbeFailed: true },
    });

    let result;
    jest.isolateModules(() => {
      const { useMembershipProbeFailed } = require('../use-permissions');
      result = renderHook(() => useMembershipProbeFailed()).result;
    });

    expect(result.current).toBe(true);
  });
});
