'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { QueryResultCard } from './query-result-card';
import { QueryCsvView } from './query-csv-view';
import { CodeHighlighter } from '@/components/core/code-highlighter';

/**
 * Display query results with cards, raw JSON, or CSV view
 */
export function QueryResults({
  results,
  isLoading,
  onNext,
  hasNext,
  executionStats,
  viewMode,
  onViewModeChange,
  lockedColumns,
  onColumnsLocked,
  pageNumber,
}) {
  if (!results) {
    return null;
  }

  const { docs, warning } = results;

  if (docs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>No documents matched the query</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {warning && <Alert severity="warning">{warning}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={viewMode} onChange={(_e, newValue) => onViewModeChange(newValue)}>
          <Tab label="Cards" value="cards" />
          <Tab label="Raw JSON" value="json" />
          <Tab label="CSV" value="csv" />
        </Tabs>
      </Box>

      {viewMode === 'cards' && (
        <Stack spacing={2}>
          {docs.map((doc, index) => (
            <QueryResultCard key={doc._id || index} doc={doc} index={index} />
          ))}
        </Stack>
      )}

      {viewMode === 'json' && (
        <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
          <CodeHighlighter className="language-json">{JSON.stringify(docs, null, 2)}</CodeHighlighter>
        </Box>
      )}

      {viewMode === 'csv' && (
        <QueryCsvView docs={docs} columns={lockedColumns} onColumnsLocked={onColumnsLocked} />
      )}

      {executionStats && (
        <Alert severity="info">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Execution Stats
          </Typography>
          <Typography variant="caption" component="div">
            Results: {executionStats.results_returned} | Docs examined: {executionStats.total_docs_examined} | Time:{' '}
            {executionStats.execution_time_ms}ms
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {docs.length} document{docs.length !== 1 ? 's' : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Page {pageNumber}
          </Typography>
        </Box>

        {hasNext && (
          <Button variant="contained" onClick={onNext} disabled={isLoading}>
            Next Page
          </Button>
        )}
      </Box>
    </Stack>
  );
}
