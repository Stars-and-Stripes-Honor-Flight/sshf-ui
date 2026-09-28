import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/lib/default-logger', () => ({
  logger: { debug: jest.fn(), error: jest.fn() },
}));

jest.mock('@/components/core/logo', () => ({
  DynamicLogo: () => <div data-testid="auth-progress-logo" />,
}));

const mockUseUser = jest.fn();

jest.mock('@/hooks/use-user', () => ({
  useUser: () => mockUseUser(),
}));

import { paths } from '@/paths';
import { AuthGuard } from '../auth-guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows progress while session is loading instead of a blank screen', () => {
    mockUseUser.mockReturnValue({ user: null, error: null, isLoading: true });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  test('shows progress while redirecting unauthenticated visitors to sign-in', async () => {
    mockUseUser.mockReturnValue({ user: null, error: null, isLoading: false });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(paths.auth.domain.signIn);
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  test('renders children when the user is authenticated', async () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com' },
      error: null,
      isLoading: false,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
