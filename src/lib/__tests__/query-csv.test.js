/**
 * Contract for src/lib/query-csv.js (pure; no React).
 *
 * flattenDoc(doc) -> { [dotPath]: string }
 *   Nested plain objects become dot paths. Arrays become one compact
 *   JSON.stringify cell (not one column per element). null, undefined, and
 *   empty objects become ''. Numbers and booleans become String(value).
 *
 * docsToCsv(docs, { columns, delimiter = ',' } = {}) -> { columns, header, body, text }
 *   columns, when passed, is used exactly (order included) and may contain _rev.
 *   Otherwise columns are first-seen flattened keys, with _id and type moved
 *   first when present, and _rev left out.
 *   header and body are RFC 4180 (quote a field that contains the delimiter
 *   or a double quote; embedded CR/LF in cell values become spaces before
 *   quoting so row count matches the document count). Rows use CRLF.
 *   There is no trailing CRLF after the last row.
 *   text === header + '\r\n' + body, including when there are no documents.
 *   Do not prefix formula-like values (+, =, and similar). Staff data such as
 *   phone numbers must round-trip unchanged.
 *
 * copyText(text) -> Promise
 *   Calls navigator.clipboard.writeText(text). Rejects with an Error whose
 *   message mentions "clipboard" when clipboard or writeText is missing.
 *   A writeText rejection is returned to the caller.
 */

import { copyText, docsToCsv, flattenDoc } from '@/lib/query-csv';

function expectCsv(result, { columns, header, body }) {
  expect(result).toEqual({
    columns,
    header,
    body,
    text: `${header}\r\n${body}`,
  });
}

describe('flattenDoc', () => {
  it('flattens nested objects into dot paths', () => {
    expect(
      flattenDoc({
        address: {
          city: 'Chicago',
          contact: { phone: '555-1234' },
        },
      })
    ).toEqual({
      'address.city': 'Chicago',
      'address.contact.phone': '555-1234',
    });
  });

  it('writes each array as one JSON cell', () => {
    expect(
      flattenDoc({
        tags: ['tag1', 'tag2'],
        items: [{ id: 1, label: 'a' }],
        empty: [],
      })
    ).toEqual({
      tags: '["tag1","tag2"]',
      items: '[{"id":1,"label":"a"}]',
      empty: '[]',
    });
  });

  it('writes null, undefined, and empty objects as empty cells', () => {
    expect(
      flattenDoc({
        missing: null,
        absent: undefined,
        meta: {},
        nested: { note: null, extra: {} },
        name: { first: 'Ann' },
      })
    ).toEqual({
      missing: '',
      absent: '',
      meta: '',
      'nested.note': '',
      'nested.extra': '',
      'name.first': 'Ann',
    });
  });

  it('stringifies numbers and booleans', () => {
    expect(
      flattenDoc({
        count: 0,
        ratio: 1.5,
        active: false,
        confirmed: true,
      })
    ).toEqual({
      count: '0',
      ratio: '1.5',
      active: 'false',
      confirmed: 'true',
    });
  });
});

describe('docsToCsv', () => {
  it('quotes fields per RFC 4180 and joins rows with CRLF', () => {
    const result = docsToCsv([
      {
        _id: '1',
        type: 'Note',
        comma: 'hello, world',
        quote: 'say "hi"',
        both: 'a,"b"',
        cr: 'line1\rline2',
        lf: 'line1\nline2',
      },
    ]);

    expectCsv(result, {
      columns: ['_id', 'type', 'comma', 'quote', 'both', 'cr', 'lf'],
      header: '_id,type,comma,quote,both,cr,lf',
      body: '1,Note,"hello, world","say ""hi""","a,""b""",line1 line2,line1 line2',
    });
    expect(result.text.endsWith('\r\n')).toBe(false);
  });

  it('replaces runs of line breaks inside a cell with a single space', () => {
    expectCsv(docsToCsv([{ _id: '1', a: 'a\n\nb' }]), {
      columns: ['_id', 'a'],
      header: '_id,a',
      body: '1,a b',
    });

    expectCsv(docsToCsv([{ _id: '2', a: 'a\r\nb' }]), {
      columns: ['_id', 'a'],
      header: '_id,a',
      body: '2,a b',
    });
  });

  it('keeps a multi-paragraph value with a comma on one data row', () => {
    const notes = 'Paragraph one.\n\nParagraph two, with comma.';
    const result = docsToCsv(
      [{ _id: 'vet-1', type: 'Veteran', notes: { other: notes } }],
      { columns: ['_id', 'type', 'notes.other'] }
    );

    expect(result.body.split('\r\n')).toHaveLength(1);
    expect(result.body).toBe('vet-1,Veteran,"Paragraph one. Paragraph two, with comma."');
  });

  it('emits one body line per document when one doc has multi-paragraph notes', () => {
    const docs = Array.from({ length: 10 }, (_, index) => ({
      _id: `doc-${index}`,
      type: 'Veteran',
    }));
    docs[3] = {
      ...docs[3],
      notes: { other: 'First paragraph.\n\nSecond paragraph.' },
    };

    const result = docsToCsv(docs);
    expect(result.body.split('\r\n')).toHaveLength(10);
  });

  it('collapses line breaks inside cells for tab-delimited output', () => {
    const result = docsToCsv(
      [
        { _id: '1', note: 'line1\nline2' },
        { _id: '2', note: 'a\n\nb, tail' },
      ],
      { delimiter: '\t' }
    );

    expect(result.body.split('\r\n')).toHaveLength(2);
    expect(result.body).toBe('1\tline1 line2\r\n2\ta b, tail');
  });

  it('quotes a header name that contains the delimiter', () => {
    const result = docsToCsv([{ _id: '1' }], { columns: ['last, first', '_id'] });

    expectCsv(result, {
      columns: ['last, first', '_id'],
      header: '"last, first",_id',
      body: ',1',
    });
  });

  it('orders columns first-seen, with _id and type first, and omits _rev', () => {
    const result = docsToCsv([
      { city: 'Austin', name: { first: 'Ann' }, _rev: '1-aaa', _id: '1', type: 'Veteran' },
      { _id: '2', type: 'Guardian', name: { last: 'Lee' }, note: 'hi', _rev: '2-bbb' },
    ]);

    expectCsv(result, {
      columns: ['_id', 'type', 'city', 'name.first', 'name.last', 'note'],
      header: '_id,type,city,name.first,name.last,note',
      body: '1,Veteran,Austin,Ann,,\r\n2,Guardian,,,Lee,hi',
    });
  });

  it('puts _id and type first even when only a later document has them', () => {
    const result = docsToCsv([{ city: 'Austin' }, { _id: '2', type: 'Veteran', city: 'Dallas' }]);

    expectCsv(result, {
      columns: ['_id', 'type', 'city'],
      header: '_id,type,city',
      body: ',,Austin\r\n2,Veteran,Dallas',
    });
  });

  it('honors a columns override, including _rev, and leaves missing cells empty', () => {
    const result = docsToCsv([{ _id: '1', _rev: '9-z', type: 'Veteran', city: 'Austin', count: 0, active: false }], {
      columns: ['type', '_rev', 'missing', 'count', 'active'],
    });

    expectCsv(result, {
      columns: ['type', '_rev', 'missing', 'count', 'active'],
      header: 'type,_rev,missing,count,active',
      body: 'Veteran,9-z,,0,false',
    });
    expect(result.columns).not.toContain('_id');
    expect(result.columns).not.toContain('city');
  });

  it('quotes embedded tabs when the delimiter is a tab and leaves commas bare', () => {
    const result = docsToCsv([{ _id: '1', type: 'Veteran', note: 'hello\tworld', city: 'Austin, TX' }], {
      delimiter: '\t',
    });

    expectCsv(result, {
      columns: ['_id', 'type', 'note', 'city'],
      header: '_id\ttype\tnote\tcity',
      body: '1\tVeteran\t"hello\tworld"\tAustin, TX',
    });
  });

  it('returns a header-only sheet when there are no documents', () => {
    expectCsv(docsToCsv([]), {
      columns: [],
      header: '',
      body: '',
    });

    expectCsv(docsToCsv([], { columns: ['_id', 'type'] }), {
      columns: ['_id', 'type'],
      header: '_id,type',
      body: '',
    });
  });

  it('does not prefix formula-like values', () => {
    const result = docsToCsv([{ _id: '1', type: 'Phone', mobile: '+15551212', formula: '=1+1' }]);

    expect(result.body).toBe('1,Phone,+15551212,=1+1');
    expect(result.text).toBe(`${result.header}\r\n${result.body}`);
  });
});

describe('copyText', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    } else {
      delete navigator.clipboard;
    }
  });

  it('calls navigator.clipboard.writeText with the given text', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    await copyText('a,b\r\n1,2');
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('a,b\r\n1,2');
  });

  it('rejects when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    await expect(copyText('hello')).rejects.toThrow(/clipboard/i);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: {},
    });

    await expect(copyText('hello')).rejects.toThrow(/clipboard/i);
  });

  it('rejects when writeText rejects', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    await expect(copyText('hello')).rejects.toThrow(/denied/);
  });
});
