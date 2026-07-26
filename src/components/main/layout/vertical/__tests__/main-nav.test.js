import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { MainNav } from '../main-nav';

jest.mock('@/hooks/use-user', () => ({
  useUser: () => ({ user: { avatar: null } }),
}));

jest.mock('@/components/main/layout/mobile-nav', () => ({
  MobileNav: () => null,
}));

jest.mock('@/components/main/layout/user-popover/user-popover', () => ({
  UserPopover: () => null,
}));

describe('MainNav environment banner', () => {
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

    render(<MainNav items={[]} />);

    expect(await screen.findByText(/DEVELOPMENT ENVIRONMENT/)).toBeInTheDocument();
  });

  test('hides the banner in the Production environment', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Production';

    render(<MainNav items={[]} />);

    await waitFor(() => {
      expect(screen.queryByText(/ENVIRONMENT/)).not.toBeInTheDocument();
    });
  });
});
