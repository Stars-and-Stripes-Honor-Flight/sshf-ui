import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StickyHeader } from '../sticky-header';

describe('StickyHeader', () => {
  const originalEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  afterEach(() => {
    if (originalEnvironment === undefined) {
      delete process.env.NEXT_PUBLIC_ENVIRONMENT;
    } else {
      process.env.NEXT_PUBLIC_ENVIRONMENT = originalEnvironment;
    }
    document.documentElement.style.removeProperty('--App-header-offset');
  });

  test('positions below the app header offset when the environment banner is shown', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Development';
    document.documentElement.style.setProperty('--App-header-offset', '64px');

    render(<StickyHeader name="Jane Doe" type="veteran" />);

    act(() => {
      window.scrollY = 200;
      window.dispatchEvent(new Event('scroll'));
    });

    const bar = await screen.findByTestId('sticky-header-bar');
    expect(bar).toHaveStyle({ top: 'var(--App-header-offset, 0px)' });
  });

  test('shows a compact environment label on small screens when not in production', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Development';

    render(<StickyHeader name="Jane Doe" type="guardian" />);

    act(() => {
      window.scrollY = 200;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(await screen.findByTestId('sticky-header-env-label')).toHaveTextContent(
      /DEVELOPMENT ENVIRONMENT/
    );
  });

  test('does not show the environment label in production', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Production';

    render(<StickyHeader name="Jane Doe" type="veteran" />);

    act(() => {
      window.scrollY = 200;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(screen.queryByTestId('sticky-header-env-label')).not.toBeInTheDocument();
  });
});
