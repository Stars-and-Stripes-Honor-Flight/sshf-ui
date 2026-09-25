import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/domain/client';
import { UserProvider } from '@/contexts/auth/user-context';
import { useUser } from '@/hooks/use-user';
import { AuthGuard } from '@/components/auth/auth-guard';
import { FullAccessGuard } from '@/components/auth/full-access-guard';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => '/search',
}));

jest.mock('@/lib/auth/domain/client', () => ({
  authClient: {
    getUser: jest.fn(),
  },
}));

jest.mock('@/lib/api', () => ({
  api: {
    listFlights: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@/lib/default-logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const FULL_ACCESS_ROLE = 'full-access@example.com';

function SessionStatus() {
  const { isLoading, user } = useUser();

  return (
    <div>
      <span data-testid="session-loading">{String(isLoading)}</span>
      <span data-testid="session-user">{user ? 'present' : 'absent'}</span>
    </div>
  );
}

function renderProtectedPage() {
  return render(
    <UserProvider>
      <SessionStatus />
      <AuthGuard>
        <FullAccessGuard>
          <div>Protected content</div>
        </FullAccessGuard>
      </AuthGuard>
    </UserProvider>
  );
}

describe('UserProvider checkSession', () => {
  const originalRole = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS = FULL_ACCESS_ROLE;
  });

  afterEach(() => {
    if (originalRole === undefined) {
      delete process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
    } else {
      process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS = originalRole;
    }
  });

  test('does not render protected content from cached user-data before getUser settles', async () => {
    localStorage.setItem(
      'user-data',
      JSON.stringify({
        id: 'cached-user',
        email: 'cached@example.com',
        roles: [{ email: FULL_ACCESS_ROLE, name: 'full' }],
      })
    );

    let resolveGetUser;
    authClient.getUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGetUser = resolve;
        })
    );

    renderProtectedPage();

    await waitFor(() => {
      expect(authClient.getUser).toHaveBeenCalled();
    });

    expect(screen.getByTestId('session-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('session-user')).toHaveTextContent('absent');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.queryByText(/not authorized/i)).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(localStorage.getItem('user-data')).not.toBeNull();

    resolveGetUser({ data: null });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(paths.auth.domain.signIn);
    });

    expect(localStorage.getItem('user-data')).toBeNull();
    expect(screen.getByTestId('session-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('session-user')).toHaveTextContent('absent');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  test('clears the cached user and redirects to sign-in when getUser fails', async () => {
    localStorage.setItem(
      'user-data',
      JSON.stringify({
        id: 'cached-user',
        email: 'cached@example.com',
        roles: [{ email: FULL_ACCESS_ROLE, name: 'full' }],
      })
    );
    localStorage.setItem('flights-list', JSON.stringify([{ id: 'flight-1' }]));
    authClient.getUser.mockResolvedValue({ error: 'Unable to load user' });

    renderProtectedPage();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(paths.auth.domain.signIn);
    });

    expect(localStorage.getItem('user-data')).toBeNull();
    expect(localStorage.getItem('flights-list')).toBeNull();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  test('renders protected content only after getUser returns a user', async () => {
    authClient.getUser.mockResolvedValue({
      data: {
        id: 'server-user',
        email: 'server@example.com',
        roles: [{ email: FULL_ACCESS_ROLE, name: 'full' }],
      },
    });

    renderProtectedPage();

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(screen.getByTestId('session-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('session-user')).toHaveTextContent('present');
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
