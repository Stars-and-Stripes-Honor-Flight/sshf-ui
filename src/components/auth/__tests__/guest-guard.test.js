import * as React from 'react';
import { render, screen } from '@testing-library/react';
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

import { GuestGuard } from '../guest-guard';

describe('GuestGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows progress while session is loading instead of guest content', () => {
    mockUseUser.mockReturnValue({ user: null, error: null, isLoading: true });

    render(
      <GuestGuard>
        <button type="button">Continue with Google</button>
      </GuestGuard>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
  });

  test('shows progress when a logged-in user is being redirected', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com' },
      error: null,
      isLoading: false,
    });

    render(
      <GuestGuard>
        <button type="button">Continue with Google</button>
      </GuestGuard>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalled();
  });

  test('renders children when the visitor is a confirmed guest', async () => {
    mockUseUser.mockReturnValue({ user: null, error: null, isLoading: false });

    render(
      <GuestGuard>
        <button type="button">Continue with Google</button>
      </GuestGuard>
    );

    expect(await screen.findByText('Continue with Google')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('shows an error alert when session check fails', async () => {
    mockUseUser.mockReturnValue({ user: null, error: 'Session error', isLoading: false });

    render(
      <GuestGuard>
        <button type="button">Continue with Google</button>
      </GuestGuard>
    );

    expect(await screen.findByText('Session error')).toBeInTheDocument();
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
  });
});
