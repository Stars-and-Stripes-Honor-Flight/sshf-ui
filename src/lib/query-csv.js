/**
 * Pure CSV helpers for ad-hoc query results (no React).
 */

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * @param {Record<string, unknown>} doc
 * @returns {Record<string, string>}
 */
export function flattenDoc(doc) {
  const result = {};

  function walk(value, prefix) {
    if (value === null || value === undefined) {
      if (prefix) {
        result[prefix] = '';
      }
      return;
    }
    if (Array.isArray(value)) {
      if (prefix) {
        result[prefix] = JSON.stringify(value);
      }
      return;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      if (prefix) {
        result[prefix] = String(value);
      }
      return;
    }
    if (isPlainObject(value)) {
      if (Object.keys(value).length === 0) {
        if (prefix) {
          result[prefix] = '';
        }
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        const childPrefix = prefix ? `${prefix}.${key}` : key;
        walk(child, childPrefix);
      }
      return;
    }
    if (prefix) {
      result[prefix] = String(value);
    }
  }

  for (const [key, value] of Object.entries(doc)) {
    walk(value, key);
  }

  return result;
}

/**
 * @param {string} field
 * @param {string} delimiter
 */
function escapeField(field, delimiter) {
  const str = field;
  const needsQuote =
    str.includes(delimiter) || str.includes('"') || str.includes('\r') || str.includes('\n');
  if (needsQuote) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * @param {Record<string, unknown>[]} docs
 */
function discoverColumns(docs) {
  const seen = new Set();
  const columns = [];

  for (const doc of docs) {
    const flat = flattenDoc(doc);
    for (const key of Object.keys(flat)) {
      if (key === '_rev') {
        continue;
      }
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const ordered = [];
  if (seen.has('_id')) {
    ordered.push('_id');
  }
  if (seen.has('type')) {
    ordered.push('type');
  }
  for (const col of columns) {
    if (col !== '_id' && col !== 'type') {
      ordered.push(col);
    }
  }
  return ordered;
}

/**
 * @param {Record<string, unknown>[]} docs
 * @param {{ columns?: string[], delimiter?: string }} [options]
 */
export function docsToCsv(docs, { columns: columnsOverride, delimiter = ',' } = {}) {
  const columns = columnsOverride ?? discoverColumns(docs);

  const header = columns.map((col) => escapeField(col, delimiter)).join(delimiter);

  const bodyRows = docs.map((doc) => {
    const flat = flattenDoc(doc);
    return columns.map((col) => escapeField(flat[col] ?? '', delimiter)).join(delimiter);
  });

  const body = bodyRows.join('\r\n');
  const text = `${header}\r\n${body}`;

  return { columns, header, body, text };
}

/**
 * @param {string} text
 * @returns {Promise<void>}
 */
export function copyText(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    return Promise.reject(new Error('Clipboard is not available'));
  }
  return navigator.clipboard.writeText(text);
}
