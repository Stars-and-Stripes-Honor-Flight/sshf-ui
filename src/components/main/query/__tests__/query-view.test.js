import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

import { api } from '@/lib/api';
import * as queryStorage from '@/lib/query-storage';
import { QueryView } from '../query-view';

describe('QueryView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render editor and controls', () => {
    render(<QueryView />);
    
    expect(screen.getByText('Run Query')).toBeInTheDocument();
    expect(screen.getByText('Save Query')).toBeInTheDocument();
    expect(screen.getByText('Load Query')).toBeInTheDocument();
  });

  it('should initialize with saved queries', () => {
    const mockQueries = [
      { name: 'Test Query', query: { selector: {} }, savedAt: '2024-01-01' }
    ];
    queryStorage.initializeQueriesIfEmpty.mockReturnValue(mockQueries);

    render(<QueryView />);

    expect(queryStorage.initializeQueriesIfEmpty).toHaveBeenCalled();
  });

  it('should load last query on mount if available', () => {
    const lastQuery = { selector: { type: 'Veteran' }, limit: 25 };
    queryStorage.getLastQuery.mockReturnValue(lastQuery);

    render(<QueryView />);

    expect(queryStorage.getLastQuery).toHaveBeenCalled();
  });

  it('should call API when query is run', async () => {
    const user = userEvent.setup();
    const mockResults = {
      docs: [{ _id: 'vet-1', type: 'Veteran' }],
      bookmark: 'next-token'
    };
    api.postQuery.mockResolvedValue(mockResults);

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{"type":"Veteran"},"limit":25}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(api.postQuery).toHaveBeenCalledWith({
        selector: { type: 'Veteran' },
        limit: 25
      });
    });
  });

  it('should display results after successful query', async () => {
    const user = userEvent.setup();
    const mockResults = {
      docs: [
        { _id: 'vet-1', type: 'Veteran', name: { first: 'John', last: 'Doe' } }
      ]
    };
    api.postQuery.mockResolvedValue(mockResults);

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{},"limit":25}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });
  });

  it('should show loading indicator during query execution', async () => {
    const user = userEvent.setup();
    api.postQuery.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{}}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle pagination with bookmark', async () => {
    const user = userEvent.setup();
    const mockResults = {
      docs: Array(25).fill(null).map((_, i) => ({ _id: `doc-${i}`, type: 'Veteran' })),
      bookmark: 'next-page-token'
    };
    api.postQuery.mockResolvedValue(mockResults);

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{"type":"Veteran"},"limit":25}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(screen.getByText('Next Page')).toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByText('Next Page');
    await user.click(nextButton);

    await waitFor(() => {
      expect(api.postQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: { type: 'Veteran' },
          bookmark: 'next-page-token'
        })
      );
    });
  });

  it('should not show Next button if results are less than limit', async () => {
    const user = userEvent.setup();
    const mockResults = {
      docs: [{ _id: 'doc-1', type: 'Veteran' }]
    };
    api.postQuery.mockResolvedValue(mockResults);

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{},"limit":25}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Next Page')).not.toBeInTheDocument();
  });

  it('should persist last query to storage', async () => {
    const user = userEvent.setup();
    api.postQuery.mockResolvedValue({ docs: [] });

    render(<QueryView />);

    const query = { selector: { type: 'Guardian' }, limit: 10 };
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: JSON.stringify(query) } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(queryStorage.saveLastQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: { type: 'Guardian' }
        })
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    api.postQuery.mockRejectedValue(new Error('API Error'));

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{}}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(api.postQuery).toHaveBeenCalled();
    });

    // Should not show results
    expect(screen.queryByText('Document 1')).not.toBeInTheDocument();
  });

  it('should display warning from API', async () => {
    const user = userEvent.setup();
    const mockResults = {
      docs: [{ _id: 'doc-1' }],
      warning: 'No matching index found, using primary index'
    };
    api.postQuery.mockResolvedValue(mockResults);

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{"custom_field":"value"}}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/No matching index found/i)).toBeInTheDocument();
    });
  });

  it('should display execution stats when returned', async () => {
    const user = userEvent.setup();
    const mockResults = {
      docs: [{ _id: 'doc-1' }],
      execution_stats: {
        results_returned: 1,
        total_docs_examined: 100,
        execution_time_ms: 45
      }
    };
    api.postQuery.mockResolvedValue(mockResults);

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{}}' } });

    const statsCheckbox = screen.getByRole('checkbox', { name: /execution statistics/i });
    await user.click(statsCheckbox);

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/Execution Stats/i)).toBeInTheDocument();
      expect(screen.getByText(/Results: 1/i)).toBeInTheDocument();
    });
  });
});
