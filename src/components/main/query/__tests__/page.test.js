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
