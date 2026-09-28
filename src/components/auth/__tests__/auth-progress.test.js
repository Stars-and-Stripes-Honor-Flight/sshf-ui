import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/components/core/logo', () => ({
  DynamicLogo: () => <div data-testid="auth-progress-logo" />,
}));

import { AuthProgress } from '../auth-progress';

describe('AuthProgress', () => {
  test('renders logo, spinner, and status message', () => {
    render(<AuthProgress message="Signing you in…" />);

    expect(screen.getByTestId('auth-progress-logo')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Signing you in…')).toBeInTheDocument();
  });

  test('uses a default status message when none is provided', () => {
    render(<AuthProgress />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
