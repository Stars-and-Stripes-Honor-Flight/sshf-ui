import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ListPageLayout, listPageContentSx } from '../list-page-layout';

describe('ListPageLayout', () => {
  test('applies the shared list page content shell styles', () => {
    const { container } = render(
      <ListPageLayout title="Test List" description="Subtitle">
        <div data-testid="child">content</div>
      </ListPageLayout>
    );

    const shell = container.firstChild;
    expect(shell).toHaveStyle({
      maxWidth: 'var(--Content-maxWidth)',
      margin: 'var(--Content-margin)',
      padding: 'var(--Content-padding)',
      width: 'var(--Content-width)',
    });
    expect(screen.getByRole('heading', { name: 'Test List' })).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('exports listPageContentSx for pages that share the same scroll container', () => {
    expect(listPageContentSx).toMatchObject({
      maxWidth: 'var(--Content-maxWidth)',
      width: 'var(--Content-width)',
    });
  });
});
