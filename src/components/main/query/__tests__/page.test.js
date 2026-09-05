import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/lib/api', () => ({
  api: {
    postQuery: jest.fn(),
  },
}));

jest.mock('@/lib/query-storage', () => ({
  getSavedQueries: jest.fn(() => []),
  saveQuery: jest.fn(),
  deleteQuery: jest.fn(),
  getLastQuery: jest.fn(() => null),
  saveLastQuery: jest.fn(),
  initializeQueriesIfEmpty: jest.fn(() => []),
}));

jest.mock('@/components/core/code-highlighter', () => ({
  CodeHighlighter: ({ code }) => <pre data-testid="code-highlighter">{code}</pre>,
}));

import Page from '../../../../app/(main)/tools/query/page';

describe('Query Page', () => {
  const originalFlag = process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY;

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY;
    } else {
      process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = originalFlag;
    }
  });

  describe('when the ad-hoc query flag is on', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'true';
    });

    it('should render page with correct title', () => {
      render(<Page />);

      expect(screen.getByText('Ad-hoc Query')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<Page />);

      expect(screen.getByText('Run CouchDB Mango queries and view results')).toBeInTheDocument();
    });

    it('should render QueryView component', () => {
      render(<Page />);

      expect(screen.getByText('Run Query')).toBeInTheDocument();
      expect(screen.getByText('Save Query')).toBeInTheDocument();
      expect(screen.getByText('Load Query')).toBeInTheDocument();
    });
  });

  describe('when the ad-hoc query flag is off', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'false';
    });

    it('shows an unavailable message instead of the query editor', () => {
      render(<Page />);

      expect(screen.getByText('Not available')).toBeInTheDocument();
      expect(screen.getByText(/Ad-hoc Query is not enabled in this environment/i)).toBeInTheDocument();
      expect(screen.queryByText('Run Query')).not.toBeInTheDocument();
    });
  });
});
