import * as React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { authClient } from '@/lib/auth/domain/client';

import { SignInForm } from '../sign-in-form';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/use-user', () => ({
  useUser: () => ({ checkSession: jest.fn() }),
}));

jest.mock('@/lib/auth/domain/client', () => ({
  authClient: { signInWithOAuth: jest.fn() },
}));

jest.mock('@/components/core/toaster', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('@/components/core/logo', () => ({
  DynamicLogo: () => <div data-testid="auth-progress-logo" />,
}));

describe('SignInForm auth progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows progress instead of Continue with Google while OAuth is pending', async () => {
    const user = userEvent.setup();
    let resolveOAuth;
    authClient.signInWithOAuth.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveOAuth = resolve;
        })
    );

    render(<SignInForm />);

    await user.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    expect(screen.getByText(/signing you in/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue with google/i })).not.toBeInTheDocument();

    await act(async () => {
      resolveOAuth({ data: { token: 'test' }, error: null });
    });
  });
});

describe('SignInForm environment banner', () => {
  const originalEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  afterEach(() => {
    if (originalEnvironment === undefined) {
      delete process.env.NEXT_PUBLIC_ENVIRONMENT;
    } else {
      process.env.NEXT_PUBLIC_ENVIRONMENT = originalEnvironment;
    }
  });

  test('shows the environment name in the banner for non-production environments', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Development';

    render(<SignInForm />);

    expect(await screen.findByText(/DEVELOPMENT ENVIRONMENT/)).toBeInTheDocument();
  });

  test('hides the banner in the Production environment', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Production';

    render(<SignInForm />);

    await waitFor(() => {
      expect(screen.queryByText(/ENVIRONMENT/)).not.toBeInTheDocument();
    });
  });
});
