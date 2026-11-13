'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { api } from '@/lib/api';
import {
  getSavedQueries,
  saveQuery,
  deleteQuery,
  getLastQuery,
  saveLastQuery,
  initializeQueriesIfEmpty,
} from '@/lib/query-storage';
import { QueryEditor } from './query-editor';
import { QueryResults } from './query-results';
import { SavedQueries } from './saved-queries';

const DEFAULT_QUERY = {
  selector: {},
  limit: 25,
};

/**
 * Main view for ad-hoc Mango query page
 */
export function QueryView() {
  const [currentQuery, setCurrentQuery] = React.useState(DEFAULT_QUERY);
  const [results, setResults] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedQueries, setSavedQueries] = React.useState([]);
  const [lastBookmark, setLastBookmark] = React.useState(null);
  const [lastSelector, setLastSelector] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('cards');
  const [pageNumber, setPageNumber] = React.useState(1);
  const [lockedColumns, setLockedColumns] = React.useState(null);

  // Initialize saved queries and load last query on mount
  React.useEffect(() => {
    const queries = initializeQueriesIfEmpty();
    setSavedQueries(queries);

    const lastQuery = getLastQuery();
    if (lastQuery) {
      setCurrentQuery(lastQuery);
    }
  }, []);

  const executeQuery = async (queryBody) => {
    try {
      setIsLoading(true);
      setResults(null);

      const response = await api.postQuery(queryBody);

      setResults(response);
      setLastBookmark(response.bookmark);
      setLastSelector(queryBody.selector);

      saveLastQuery(queryBody);
    } catch (error) {
      console.error('Query execution failed:', error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunQuery = (queryBody) => {
    setLastBookmark(null);
    setLastSelector(null);
    setPageNumber(1);
    setLockedColumns(Array.isArray(queryBody.fields) ? queryBody.fields : null);
    executeQuery(queryBody);
  };

  const handleNextPage = () => {
    if (!lastBookmark || !lastSelector) {
      return;
    }

    const nextQuery = {
      ...currentQuery,
      selector: lastSelector,
      bookmark: lastBookmark,
    };

    setPageNumber((page) => page + 1);
    executeQuery(nextQuery);
  };

  const handleColumnsLocked = React.useCallback((columns) => {
    setLockedColumns((prev) => (prev == null ? columns : prev));
  }, []);

  const handleSaveQuery = (name) => {
    saveQuery(name, currentQuery);
    const updated = getSavedQueries();
    setSavedQueries(updated);
  };

  const handleLoadQuery = (query) => {
    setCurrentQuery(query.query);
    setResults(null);
    setLastBookmark(null);
    setLastSelector(null);
    setPageNumber(1);
    setLockedColumns(null);
  };

  const handleDeleteQuery = (name) => {
    deleteQuery(name);
    const updated = getSavedQueries();
    setSavedQueries(updated);
  };

  const handleQueryChange = (parsedQuery) => {
    setCurrentQuery(parsedQuery);
  };

  const sentLimit = currentQuery.limit ?? 25;
  const effectiveLimit = Math.min(sentLimit, 100);
  const hasNext =
    results && results.docs && results.bookmark && results.docs.length === effectiveLimit;

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <SavedQueries
              savedQueries={savedQueries}
              onSave={handleSaveQuery}
              onLoad={handleLoadQuery}
              onDelete={handleDeleteQuery}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <QueryEditor value={currentQuery} onChange={handleQueryChange} onRun={handleRunQuery} isLoading={isLoading} />
        </CardContent>
      </Card>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && results && (
        <Card>
          <CardContent>
            <QueryResults
              results={results}
              isLoading={isLoading}
              onNext={handleNextPage}
              hasNext={hasNext}
              executionStats={results.execution_stats}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              lockedColumns={lockedColumns}
              onColumnsLocked={handleColumnsLocked}
              pageNumber={pageNumber}
            />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
