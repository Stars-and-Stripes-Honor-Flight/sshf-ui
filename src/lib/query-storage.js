/**
 * Storage helper for managing saved Mango queries in browser storage.
 * Uses localStorage with sessionStorage fallback.
 * Never persists query results (PII/medical data).
 */

const STORAGE_KEY = 'sshf-saved-mango-queries';
const LAST_QUERY_KEY = 'sshf-last-mango-query';

/**
 * Try to use storage with fallback handling
 */
const tryStorage = (storageType, operation) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    return operation(storage);
  } catch (error) {
    // Quota exceeded, storage disabled, etc.
    console.error(`Storage operation failed (${storageType}):`, error);
    return null;
  }
};

/**
 * Get saved queries from storage
 */
export const getSavedQueries = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  // Try localStorage first
  const fromLocal = tryStorage('local', (storage) => {
    const data = storage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  });

  if (fromLocal) {
    return fromLocal;
  }

  // Fallback to sessionStorage
  const fromSession = tryStorage('session', (storage) => {
    const data = storage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  });

  return fromSession || [];
};

/**
 * Save a named query
 */
export const saveQuery = (name, queryBody) => {
  const queries = getSavedQueries();
  
  // Update existing or add new
  const existingIndex = queries.findIndex(q => q.name === name);
  const newQuery = { name, query: queryBody, savedAt: new Date().toISOString() };
  
  if (existingIndex >= 0) {
    queries[existingIndex] = newQuery;
  } else {
    queries.push(newQuery);
  }

  // Try localStorage first
  const savedToLocal = tryStorage('local', (storage) => {
    storage.setItem(STORAGE_KEY, JSON.stringify(queries));
    return true;
  });

  // Fallback to sessionStorage
  if (!savedToLocal) {
    tryStorage('session', (storage) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(queries));
      return true;
    });
  }

  return queries;
};

/**
 * Delete a saved query by name
 */
export const deleteQuery = (name) => {
  const queries = getSavedQueries();
  const filtered = queries.filter(q => q.name !== name);

  // Try localStorage first
  const savedToLocal = tryStorage('local', (storage) => {
    storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  });

  // Fallback to sessionStorage
  if (!savedToLocal) {
    tryStorage('session', (storage) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    });
  }

  return filtered;
};

/**
 * Get the last-run query (editor state persistence)
 */
export const getLastQuery = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const fromLocal = tryStorage('local', (storage) => {
    const data = storage.getItem(LAST_QUERY_KEY);
    return data ? JSON.parse(data) : null;
  });

  if (fromLocal) {
    return fromLocal;
  }

  const fromSession = tryStorage('session', (storage) => {
    const data = storage.getItem(LAST_QUERY_KEY);
    return data ? JSON.parse(data) : null;
  });

  return fromSession;
};

/**
 * Save the last-run query
 */
export const saveLastQuery = (queryBody) => {
  const savedToLocal = tryStorage('local', (storage) => {
    storage.setItem(LAST_QUERY_KEY, JSON.stringify(queryBody));
    return true;
  });

  if (!savedToLocal) {
    tryStorage('session', (storage) => {
      storage.setItem(LAST_QUERY_KEY, JSON.stringify(queryBody));
      return true;
    });
  }
};

/**
 * Get seed/example queries (only used if storage is empty)
 */
export const getSeedQueries = () => [
  {
    name: 'All Veterans (25)',
    query: {
      selector: { type: 'Veteran' },
      limit: 25
    },
    savedAt: new Date().toISOString()
  },
  {
    name: 'All Guardians (25)',
    query: {
      selector: { type: 'Guardian' },
      limit: 25
    },
    savedAt: new Date().toISOString()
  }
];

/**
 * Initialize storage with seed queries if empty
 */
export const initializeQueriesIfEmpty = () => {
  const existing = getSavedQueries();
  if (existing.length === 0) {
    const seeds = getSeedQueries();
    seeds.forEach(({ name, query }) => saveQuery(name, query));
    return seeds;
  }
  return existing;
};
