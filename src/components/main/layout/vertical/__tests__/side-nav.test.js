import { readFileSync } from 'node:fs';
import path from 'node:path';

import * as React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import { resetApiVersionCache } from '@/lib/api-version';

import { SideNav } from '../side-nav';

const packageVersion = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).version;

const mockGetPublicApiVersion = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/search',
}));

jest.mock('@/components/core/logo', () => ({
  Logo: () => <div data-testid="logo" />,
}));

jest.mock('@/lib/api', () => ({
  api: {
    getPublicApiVersion: (...args) => mockGetPublicApiVersion(...args),
  },
}));

describe('SideNav version line', () => {
  beforeEach(() => {
    resetApiVersionCache();
    mockGetPublicApiVersion.mockReset();
  });

  test('shows the package.json UI version and the fetched API version', async () => {
    mockGetPublicApiVersion.mockResolvedValue('2.4.6');

    render(<SideNav items={[]} />);

    expect(packageVersion).not.toBe('0.0.0');
    expect(await screen.findByText(`UI ${packageVersion} · API 2.4.6`)).toBeInTheDocument();
    expect(screen.queryByText(/0\.0\.0/)).not.toBeInTheDocument();
    expect(mockGetPublicApiVersion).toHaveBeenCalledTimes(1);
  });

  test('keeps the UI version and marks the API unknown when the lookup fails', async () => {
    mockGetPublicApiVersion.mockRejectedValue(new Error('network down'));

    render(<SideNav items={[]} />);

    expect(await screen.findByText(`UI ${packageVersion} · API unknown`)).toBeInTheDocument();
    expect(screen.queryByText(/0\.0\.0/)).not.toBeInTheDocument();
  });
});
