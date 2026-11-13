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
  CodeHighlighter: ({ children, className }) => (
    <pre data-testid="code-highlighter" className={className}>{children}</pre>
  ),
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

  it('should display JSON content in Raw JSON tab', async () => {
    const user = userEvent.setup();
    const mockResults = {
      docs: [
        { _id: 'vet-123', type: 'Veteran', name: { first: 'John' } },
        { _id: 'vet-456', type: 'Veteran', name: { first: 'Jane' } }
      ]
    };
    api.postQuery.mockResolvedValue(mockResults);

    render(<QueryView />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"selector":{}}' } });

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });

    // Click Raw JSON tab
    const rawJsonTab = screen.getByRole('tab', { name: /Raw JSON/i });
    await user.click(rawJsonTab);

    // Should show the JSON content with document IDs
    await waitFor(() => {
      const codeHighlighter = screen.getByTestId('code-highlighter');
      expect(codeHighlighter.textContent).toContain('vet-123');
      expect(codeHighlighter.textContent).toContain('vet-456');
      expect(codeHighlighter.textContent).toContain('"type": "Veteran"');
      expect(codeHighlighter.className).toContain('language-json');
    });
  });

  it('should load saved query into editor when selected', async () => {
    const user = userEvent.setup();
    const mockQueries = [
      { 
        name: 'All Veterans (25)', 
        query: { selector: { type: 'Veteran' }, limit: 25 },
        savedAt: '2024-01-01'
      },
      { 
        name: 'All Guardians (25)', 
        query: { selector: { type: 'Guardian' }, limit: 25 },
        savedAt: '2024-01-02'
      }
    ];
    queryStorage.initializeQueriesIfEmpty.mockReturnValue(mockQueries);
    queryStorage.getSavedQueries.mockReturnValue(mockQueries);

    render(<QueryView />);

    // Open Load Query dialog
    const loadButton = screen.getByText('Load Query');
    await user.click(loadButton);

    // Click on the first saved query
    const savedQueryItem = screen.getByText('All Veterans (25)');
    await user.click(savedQueryItem);

    // Editor should now contain the loaded query
    await waitFor(() => {
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toContain('"type": "Veteran"');
      expect(textarea.value).toContain('"selector"');
      expect(textarea.value).toContain('"limit": 25');
    });

    // Results should be cleared
    expect(screen.queryByText('Document 1')).not.toBeInTheDocument();
  });
});

/**
 * CSV tab and paging contract. QueryView keeps the selected tab across Next
 * Page, because the results panel unmounts while a page is loading.
 *
 * The CSV textbox accessible name is "CSV". Page text is exactly "Page N"
 * and sits with "Showing N documents".
 *
 * Column lock: the first page's flattened columns (_id and type first, _rev
 * omitted) are reused for later pages of that run. A later page that has
 * other flattened keys shows
 * "Some documents have fields outside the locked columns: <keys>".
 * `_rev` is not one of those keys. A query `fields` array is the locked
 * list from the first page, in that order, so `_rev` is included only when
 * fields asks for it.
 *
 * Next Page compares the number of docs with the limit that was sent, capped
 * at 100. The request still sends the limit the user wrote. A new Run Query
 * returns to Page 1 and discovers columns again.
 */
describe('QueryView CSV tab and paging', () => {
  function expectCsvTextareaValue(element, expected) {
    expect(element.value.replace(/\r\n/g, '\n')).toBe(expected.replace(/\r\n/g, '\n'));
  }

  function queryEditor() {
    const editor = screen.getAllByRole('textbox').find((element) => !element.readOnly);
    if (!editor) {
      throw new Error('Query editor textbox was not found');
    }
    return editor;
  }

  async function runQuery(user, query) {
    fireEvent.change(queryEditor(), { target: { value: JSON.stringify(query) } });
    await user.click(screen.getByRole('button', { name: 'Run Query' }));
  }

  it('shows a CSV tab beside Cards and Raw JSON', async () => {
    const user = userEvent.setup();
    api.postQuery.mockResolvedValue({
      docs: [{ _id: 'vet-1', type: 'Veteran' }],
    });

    render(<QueryView />);
    await runQuery(user, { selector: { type: 'Veteran' }, limit: 25 });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cards' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Raw JSON' })).toBeInTheDocument();
    });
    expect(screen.getByRole('tab', { name: 'CSV' })).toBeInTheDocument();
  });

  it('keeps the CSV tab selected after Next Page', async () => {
    const user = userEvent.setup();
    api.postQuery
      .mockResolvedValueOnce({
        docs: [{ _id: 'p1', type: 'Veteran' }],
        bookmark: 'page-2',
      })
      .mockResolvedValueOnce({
        docs: [{ _id: 'p2', type: 'Veteran' }],
      });

    render(<QueryView />);
    await runQuery(user, { selector: { type: 'Veteran' }, limit: 1 });

    await user.click(await screen.findByRole('tab', { name: 'CSV' }));
    expectCsvTextareaValue(await screen.findByRole('textbox', { name: 'CSV' }), '_id,type\r\np1,Veteran');

    await user.click(screen.getByRole('button', { name: 'Next Page' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'CSV' })).toHaveAttribute('aria-selected', 'true');
      expectCsvTextareaValue(screen.getByRole('textbox', { name: 'CSV' }), '_id,type\r\np2,Veteran');
    });
    expect(screen.queryByText('Document 1')).not.toBeInTheDocument();
  });

  it('reuses page 1 columns on page 2 and warns about new keys', async () => {
    const user = userEvent.setup();
    api.postQuery
      .mockResolvedValueOnce({
        docs: [
          {
            _id: 'p1',
            _rev: '1-aaa',
            type: 'Veteran',
            name: { first: 'Ann' },
          },
        ],
        bookmark: 'page-2',
      })
      .mockResolvedValueOnce({
        docs: [
          {
            _id: 'p2',
            _rev: '2-bbb',
            type: 'Veteran',
            name: { first: 'Bob' },
            city: 'Austin',
          },
        ],
        bookmark: 'page-3',
      });

    render(<QueryView />);
    await runQuery(user, { selector: { type: 'Veteran' }, limit: 1 });

    await user.click(await screen.findByRole('tab', { name: 'CSV' }));
    expectCsvTextareaValue(
      screen.getByRole('textbox', { name: 'CSV' }),
      '_id,type,name.first\r\np1,Veteran,Ann'
    );
    expect(screen.queryByText(/outside the locked columns/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next Page' }));

    await waitFor(() => {
      expectCsvTextareaValue(
        screen.getByRole('textbox', { name: 'CSV' }),
        '_id,type,name.first\r\np2,Veteran,Bob'
      );
    });
    const warning = screen.getByText(/Some documents have fields outside the locked columns: city/);
    expect(warning).not.toHaveTextContent('_rev');
    const csv = screen.getByRole('textbox', { name: 'CSV' });
    expect(csv.value).not.toContain('Austin');
    expect(csv.value).not.toContain('_rev');
  });

  it('shows a Page N indicator beside the document count', async () => {
    const user = userEvent.setup();
    api.postQuery
      .mockResolvedValueOnce({
        docs: [{ _id: 'p1', type: 'Veteran' }],
        bookmark: 'page-2',
      })
      .mockResolvedValueOnce({
        docs: [
          { _id: 'p2', type: 'Veteran' },
          { _id: 'p3', type: 'Veteran' },
        ],
      });

    render(<QueryView />);
    await runQuery(user, { selector: { type: 'Veteran' }, limit: 1 });

    await waitFor(() => {
      expect(screen.getByText('Showing 1 document')).toBeInTheDocument();
    });
    expect(screen.getByText('Page 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next Page' }));

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
      expect(screen.getByText('Showing 2 documents')).toBeInTheDocument();
    });
    expect(screen.queryByText('Page 1')).not.toBeInTheDocument();
  });

  it('shows Next Page when the sent limit is over 100 and 100 docs return with a bookmark', async () => {
    const user = userEvent.setup();
    const docs = Array.from({ length: 100 }, (_, index) => ({
      _id: `doc-${index}`,
      type: 'Veteran',
    }));
    api.postQuery.mockResolvedValue({ docs, bookmark: 'more' });

    render(<QueryView />);
    await runQuery(user, { selector: { type: 'Veteran' }, limit: 150 });

    await waitFor(() => {
      expect(screen.getByText('Showing 100 documents')).toBeInTheDocument();
    }, { timeout: 10000 });
    // The API clamps limits above 100. The UI still sends 150 and compares
    // the row count with min(150, 100).
    expect(api.postQuery).toHaveBeenCalledWith({
      selector: { type: 'Veteran' },
      limit: 150,
    });
    expect(screen.getByRole('button', { name: 'Next Page' })).toBeInTheDocument();
  });

  it('resets the page and locked columns when a new query runs', async () => {
    const user = userEvent.setup();
    api.postQuery
      .mockResolvedValueOnce({
        docs: [{ _id: 'p1', _rev: '1-aaa', type: 'Veteran', name: { first: 'Ann' } }],
        bookmark: 'page-2',
      })
      .mockResolvedValueOnce({
        docs: [{ _id: 'p2', _rev: '2-bbb', type: 'Veteran', name: { first: 'Bob' }, city: 'Austin' }],
        bookmark: 'page-3',
      })
      .mockResolvedValueOnce({
        docs: [{ _id: 'n1', _rev: '9-zzz', type: 'Guardian', city: 'Dallas' }],
      });

    render(<QueryView />);
    await runQuery(user, { selector: { type: 'Veteran' }, limit: 1 });

    await user.click(await screen.findByRole('tab', { name: 'CSV' }));
    await user.click(await screen.findByRole('button', { name: 'Next Page' }));
    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    await runQuery(user, { selector: { type: 'Guardian' }, limit: 1 });

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });
    expect(screen.queryByText('Page 2')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'CSV' }));
    await waitFor(() => {
      expectCsvTextareaValue(
        screen.getByRole('textbox', { name: 'CSV' }),
        '_id,type,city\r\nn1,Guardian,Dallas'
      );
    });
    expect(screen.queryByText(/outside the locked columns/i)).not.toBeInTheDocument();
    const csv = screen.getByRole('textbox', { name: 'CSV' });
    expect(csv.value).not.toContain('name.first');
    expect(csv.value).not.toContain('_rev');
  });

  it('uses query fields as the locked columns and includes _rev when requested', async () => {
    const user = userEvent.setup();
    api.postQuery.mockResolvedValue({
      docs: [
        {
          _id: 'vet-1',
          _rev: '3-abc',
          type: 'Veteran',
          city: 'Austin',
        },
      ],
    });

    render(<QueryView />);
    await runQuery(user, {
      selector: { type: 'Veteran' },
      fields: ['type', '_rev', '_id'],
      limit: 25,
    });

    await user.click(await screen.findByRole('tab', { name: 'CSV' }));
    expectCsvTextareaValue(
      screen.getByRole('textbox', { name: 'CSV' }),
      'type,_rev,_id\r\nVeteran,3-abc,vet-1'
    );
    expect(screen.getByText(/Some documents have fields outside the locked columns: city/)).toBeInTheDocument();
  });
});
