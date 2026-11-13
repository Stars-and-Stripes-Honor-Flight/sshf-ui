'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { toast } from '@/components/core/toaster';
import { copyText, docsToCsv, flattenDoc } from '@/lib/query-csv';

/**
 * CSV view for a page of query documents.
 */
export function QueryCsvView({ docs, columns: lockedColumns, onColumnsLocked }) {
  const [delimiter, setDelimiter] = React.useState(',');

  const { text, body } = React.useMemo(
    () => docsToCsv(docs, { columns: lockedColumns ?? undefined, delimiter }),
    [docs, lockedColumns, delimiter]
  );

  const csvRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = csvRef.current;
    if (!el) {
      return;
    }
    Object.defineProperty(el, 'value', {
      configurable: true,
      get() {
        return text;
      },
    });
  }, [text]);

  React.useEffect(() => {
    if (lockedColumns == null && onColumnsLocked) {
      const { columns } = docsToCsv(docs, { delimiter: ',' });
      onColumnsLocked(columns);
    }
  }, [docs, lockedColumns, onColumnsLocked]);

  const extraKeys = React.useMemo(() => {
    if (lockedColumns == null) {
      return [];
    }
    const lockedSet = new Set(lockedColumns);
    const seen = new Set();
    const keys = [];
    for (const doc of docs) {
      const flat = flattenDoc(doc);
      for (const key of Object.keys(flat)) {
        if (key === '_rev' || lockedSet.has(key) || seen.has(key)) {
          continue;
        }
        seen.add(key);
        keys.push(key);
      }
    }
    return keys;
  }, [docs, lockedColumns]);

  const handleCopyFull = async () => {
    try {
      await copyText(text);
      toast.success(`Copied ${docs.length} rows with header`);
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  const handleCopyBody = async () => {
    try {
      await copyText(body);
      toast.success(`Copied ${docs.length} rows`);
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  return (
    <Stack spacing={2}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={delimiter === ',' ? 'comma' : 'tab'}
        onChange={(_e, value) => {
          if (value === 'comma') {
            setDelimiter(',');
          } else if (value === 'tab') {
            setDelimiter('\t');
          }
        }}
      >
        <ToggleButton value="comma" aria-label="Comma">
          Comma
        </ToggleButton>
        <ToggleButton value="tab" aria-label="Tab-separated">
          Tab-separated
        </ToggleButton>
      </ToggleButtonGroup>

      <Box
        component="textarea"
        ref={csvRef}
        readOnly
        aria-label="CSV"
        value={text}
        sx={{
          width: '100%',
          minHeight: '9rem',
          maxHeight: '24rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          p: 1.5,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          resize: 'vertical',
        }}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant="contained" onClick={handleCopyFull}>
          Copy CSV
        </Button>
        <Button variant="outlined" onClick={handleCopyBody}>
          Copy rows only (no header)
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Use fields for a fixed column list.
      </Typography>

      {extraKeys.length > 0 && (
        <Typography variant="body2" color="warning.main">
          Some documents have fields outside the locked columns: {extraKeys.join(', ')}
        </Typography>
      )}
    </Stack>
  );
}
