/**
 * QueryCsvView contract for the implementer.
 *
 * File: src/components/main/query/query-csv-view.js
 * Export: QueryCsvView
 *
 * Props:
 * - docs {object[]} Required. The current page of documents.
 * - columns {string[] | null | undefined} Optional locked column list.
 *   Omit it (null or undefined) to discover columns with docsToCsv: first-seen
 *   flattened keys, `_id` and `type` first, `_rev` excluded.
 *   When provided, use this list exactly, including its order. `_rev` is
 *   included only when it appears here.
 * - onColumnsLocked {(columns: string[]) => void} Optional. Call it with the
 *   discovered column list when `columns` is omitted. Do not call it when
 *   `columns` is provided, so the parent lock is left alone.
 *
 * UI:
 * - Read-only textbox with accessible name "CSV". Its value is the docsToCsv
 *   `text` for the active delimiter (CRLF, no trailing CRLF).
 * - Toggle buttons named "Comma" (default) and "Tab-separated".
 * - Button "Copy CSV" copies the full text (header and body).
 * - Button "Copy rows only (no header)" copies the body only.
 * - Success toasts from `@/components/core/toaster`:
 *   `Copied N rows with header` and `Copied N rows`, where N is docs.length.
 * - Failure toast: `Could not copy to the clipboard`.
 * - Always show the hint: "Use fields for a fixed column list."
 * - When `columns` is provided and a document has flattened keys, other than
 *   `_rev`, that are not in that list, show:
 *   "Some documents have fields outside the locked columns: <keys>"
 *   Keys are first-seen dot paths, separated by ", ". Do not mention `_rev`.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { toast } from '@/components/core/toaster';

import { QueryCsvView } from '../query-csv-view';

jest.mock('@/components/core/toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const docs = [
  { _id: 'vet-1', type: 'Veteran', city: 'Austin, TX' },
  { _id: 'vet-2', type: 'Veteran', city: 'Dallas' },
];

const commaText = '_id,type,city\r\nvet-1,Veteran,"Austin, TX"\r\nvet-2,Veteran,Dallas';
const tabText = '_id\ttype\tcity\r\nvet-1\tVeteran\tAustin, TX\r\nvet-2\tVeteran\tDallas';
const commaBody = 'vet-1,Veteran,"Austin, TX"\r\nvet-2,Veteran,Dallas';

function setupUser() {
  // user-event installs its own clipboard stub during setup(). Replace writeText after that.
  const user = userEvent.setup();
  const writeText = jest.fn().mockResolvedValue(undefined);
  navigator.clipboard.writeText = writeText;
  return { user, writeText };
}

function expectCsvTextareaValue(element, expected) {
  expect(element.value.replace(/\r\n/g, '\n')).toBe(expected.replace(/\r\n/g, '\n'));
}

describe('QueryCsvView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a read-only text area with the CSV text and a fields hint', () => {
    render(<QueryCsvView docs={docs} />);

    const csv = screen.getByRole('textbox', { name: 'CSV' });
    expect(csv).toHaveProperty('readOnly', true);
    expectCsvTextareaValue(csv, commaText);
    expect(screen.getByText(/use fields for a fixed column list/i)).toBeInTheDocument();
  });

  it('switches between comma and tab delimiters', async () => {
    const { user } = setupUser();
    render(<QueryCsvView docs={docs} />);

    await user.click(screen.getByRole('button', { name: 'Tab-separated' }));
    expectCsvTextareaValue(screen.getByRole('textbox', { name: 'CSV' }), tabText);

    await user.click(screen.getByRole('button', { name: 'Comma' }));
    expectCsvTextareaValue(screen.getByRole('textbox', { name: 'CSV' }), commaText);
  });

  it('copies the full text and confirms how many rows included the header', async () => {
    const { user, writeText } = setupUser();
    render(<QueryCsvView docs={docs} />);

    await user.click(screen.getByRole('button', { name: 'Copy CSV' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(commaText);
    });
    expect(toast.success).toHaveBeenCalledWith('Copied 2 rows with header');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('copies the tab-separated text after the delimiter changes', async () => {
    const { user, writeText } = setupUser();
    render(<QueryCsvView docs={docs} />);

    await user.click(screen.getByRole('button', { name: 'Tab-separated' }));
    await user.click(screen.getByRole('button', { name: 'Copy CSV' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(tabText);
    });
    expect(toast.success).toHaveBeenCalledWith('Copied 2 rows with header');
  });

  it('copies the body without the header', async () => {
    const { user, writeText } = setupUser();
    render(<QueryCsvView docs={docs} />);

    await user.click(screen.getByRole('button', { name: 'Copy rows only (no header)' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(commaBody);
    });
    expect(writeText.mock.calls[0][0]).not.toContain('_id');
    expect(toast.success).toHaveBeenCalledWith('Copied 2 rows');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error toast when the copy fails', async () => {
    const user = userEvent.setup();
    navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('denied'));
    render(<QueryCsvView docs={docs} />);

    await user.click(screen.getByRole('button', { name: 'Copy CSV' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Could not copy to the clipboard');
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('uses locked columns and warns about flattened keys outside them', () => {
    const lockedDocs = [
      { _id: 'vet-1', _rev: '1-aa', type: 'Veteran', city: 'Austin', note: 'hello' },
      { _id: 'vet-2', _rev: '2-bb', type: 'Veteran', note: 'there' },
    ];

    render(<QueryCsvView docs={lockedDocs} columns={['_id', 'type']} />);

    expectCsvTextareaValue(
      screen.getByRole('textbox', { name: 'CSV' }),
      '_id,type\r\nvet-1,Veteran\r\nvet-2,Veteran'
    );
    const warning = screen.getByText(/Some documents have fields outside the locked columns: city, note/);
    expect(warning).not.toHaveTextContent('_rev');
    expect(screen.getByText(/use fields for a fixed column list/i)).toBeInTheDocument();
  });

  it('does not warn when the locked columns cover every flattened key except _rev', () => {
    render(
      <QueryCsvView
        docs={[{ _id: 'vet-1', _rev: '1-aa', type: 'Veteran', city: 'Austin' }]}
        columns={['_id', 'type', 'city']}
      />
    );

    expectCsvTextareaValue(
      screen.getByRole('textbox', { name: 'CSV' }),
      '_id,type,city\r\nvet-1,Veteran,Austin'
    );
    expect(screen.queryByText(/outside the locked columns/i)).not.toBeInTheDocument();
  });

  it('reports discovered columns through onColumnsLocked', async () => {
    const onColumnsLocked = jest.fn();
    const discovered = [{ city: 'Austin', _id: 'vet-1', type: 'Veteran' }];

    render(<QueryCsvView docs={discovered} onColumnsLocked={onColumnsLocked} />);

    expectCsvTextareaValue(
      screen.getByRole('textbox', { name: 'CSV' }),
      '_id,type,city\r\nvet-1,Veteran,Austin'
    );
    await waitFor(() => {
      expect(onColumnsLocked).toHaveBeenCalledWith(['_id', 'type', 'city']);
    });
  });

  it('does not call onColumnsLocked when columns are provided', () => {
    const onColumnsLocked = jest.fn();

    render(<QueryCsvView docs={docs} columns={['_id', 'type']} onColumnsLocked={onColumnsLocked} />);

    expectCsvTextareaValue(
      screen.getByRole('textbox', { name: 'CSV' }),
      '_id,type\r\nvet-1,Veteran\r\nvet-2,Veteran'
    );
    expect(onColumnsLocked).not.toHaveBeenCalled();
  });
});
