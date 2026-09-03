import {
  getSavedQueries,
  saveQuery,
  deleteQuery,
  getLastQuery,
  saveLastQuery,
  getSeedQueries,
  initializeQueriesIfEmpty
} from '../query-storage';

describe('query-storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('getSavedQueries', () => {
    it('should return empty array when storage is empty', () => {
      expect(getSavedQueries()).toEqual([]);
    });

    it('should return queries from localStorage', () => {
      const queries = [{ name: 'Test', query: { selector: {} }, savedAt: '2024-01-01' }];
      localStorage.setItem('sshf-saved-mango-queries', JSON.stringify(queries));
      expect(getSavedQueries()).toEqual(queries);
    });

    it('should fallback to sessionStorage if localStorage fails', () => {
      const queries = [{ name: 'Test', query: { selector: {} }, savedAt: '2024-01-01' }];
      sessionStorage.setItem('sshf-saved-mango-queries', JSON.stringify(queries));
      
      // Mock localStorage.getItem to throw
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Quota exceeded');
      });

      expect(getSavedQueries()).toEqual(queries);
      
      mockGetItem.mockRestore();
    });
  });

  describe('saveQuery', () => {
    it('should save a new query to localStorage', () => {
      const query = { selector: { type: 'Veteran' }, limit: 25 };
      saveQuery('Veterans', query);

      const saved = JSON.parse(localStorage.getItem('sshf-saved-mango-queries'));
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Veterans');
      expect(saved[0].query).toEqual(query);
      expect(saved[0].savedAt).toBeDefined();
    });

    it('should update existing query with same name', () => {
      const query1 = { selector: { type: 'Veteran' }, limit: 10 };
      const query2 = { selector: { type: 'Veteran' }, limit: 50 };
      
      saveQuery('Veterans', query1);
      saveQuery('Veterans', query2);

      const saved = JSON.parse(localStorage.getItem('sshf-saved-mango-queries'));
      expect(saved).toHaveLength(1);
      expect(saved[0].query.limit).toBe(50);
    });

    it('should fallback to sessionStorage if localStorage fails', () => {
      const query = { selector: { type: 'Guardian' } };
      
      // Mock localStorage.getItem to work but setItem to throw
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Quota exceeded');
      });

      saveQuery('Guardians', query);

      // Should be in sessionStorage since localStorage failed
      const saved = JSON.parse(sessionStorage.getItem('sshf-saved-mango-queries'));
      expect(saved).toBeDefined();
      expect(saved[0].name).toBe('Guardians');

      mockSetItem.mockRestore();
    });
  });

  describe('deleteQuery', () => {
    it('should remove query by name', () => {
      saveQuery('Query1', { selector: {} });
      saveQuery('Query2', { selector: {} });

      deleteQuery('Query1');

      const saved = getSavedQueries();
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Query2');
    });

    it('should handle deleting non-existent query', () => {
      saveQuery('Query1', { selector: {} });

      deleteQuery('NonExistent');

      const saved = getSavedQueries();
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Query1');
    });
  });

  describe('last query persistence', () => {
    it('should save and retrieve last query', () => {
      const query = { selector: { type: 'Veteran' }, limit: 25 };
      saveLastQuery(query);

      const retrieved = getLastQuery();
      expect(retrieved).toEqual(query);
    });

    it('should return null when no last query exists', () => {
      expect(getLastQuery()).toBeNull();
    });

    it('should fallback to sessionStorage for last query', () => {
      const query = { selector: { type: 'Guardian' } };
      sessionStorage.setItem('sshf-last-mango-query', JSON.stringify(query));

      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Quota exceeded');
      });

      expect(getLastQuery()).toEqual(query);

      mockGetItem.mockRestore();
    });
  });

  describe('seed queries', () => {
    it('should return seed queries with correct structure', () => {
      const seeds = getSeedQueries();
      expect(seeds).toHaveLength(2);
      expect(seeds[0].name).toBe('All Veterans (25)');
      expect(seeds[0].query.selector.type).toBe('Veteran');
      expect(seeds[1].name).toBe('All Guardians (25)');
      expect(seeds[1].query.selector.type).toBe('Guardian');
    });

    it('should initialize storage with seeds if empty', () => {
      // Ensure storage is empty
      localStorage.clear();
      sessionStorage.clear();
      
      const queries = initializeQueriesIfEmpty();
      expect(queries).toHaveLength(2);

      const saved = getSavedQueries();
      expect(saved).toHaveLength(2);
    });

    it('should not overwrite existing queries', () => {
      // Ensure storage is empty first
      localStorage.clear();
      sessionStorage.clear();
      
      saveQuery('Custom', { selector: { custom: true } });
      
      const queries = initializeQueriesIfEmpty();
      expect(queries).toHaveLength(1);
      expect(queries[0].name).toBe('Custom');
    });
  });

  describe('SSR safety', () => {
    it('should return empty array when window is undefined', () => {
      const originalWindow = global.window;
      delete global.window;

      expect(getSavedQueries()).toEqual([]);
      expect(getLastQuery()).toBeNull();

      global.window = originalWindow;
    });
  });
});
