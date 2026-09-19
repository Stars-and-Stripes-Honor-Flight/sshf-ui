import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StickyHeader } from '../sticky-header';

function showStickyHeader() {
  Object.defineProperty(window, 'scrollY', {
    value: 200,
    writable: true,
    configurable: true,
  });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

describe('StickyHeader', () => {
  const originalEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  afterEach(() => {
    if (originalEnvironment === undefined) {
      delete process.env.NEXT_PUBLIC_ENVIRONMENT;
    } else {
      process.env.NEXT_PUBLIC_ENVIRONMENT = originalEnvironment;
    }
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
  });

  test('stays at top: 0 when visible', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Development';

    render(<StickyHeader name="Jane Doe" type="veteran" />);
    showStickyHeader();

    const bar = await screen.findByTestId('sticky-header-bar');
    expect(bar).toHaveStyle({ top: '0px' });
  });

  test('is translucent when the environment banner is shown', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Development';

    render(<StickyHeader name="Jane Doe" type="veteran" />);
    showStickyHeader();

    expect(await screen.findByTestId('sticky-header-bar')).toHaveAttribute(
      'data-translucent',
      'true'
    );
  });

  test('is not translucent in production', async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Production';

    render(<StickyHeader name="Jane Doe" type="veteran" />);
    showStickyHeader();

    expect(await screen.findByTestId('sticky-header-bar')).toHaveAttribute(
      'data-translucent',
      'false'
    );
  });
});
