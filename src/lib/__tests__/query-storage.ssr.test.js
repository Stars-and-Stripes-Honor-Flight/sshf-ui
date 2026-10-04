/**
 * @jest-environment node
 *
 * jsdom defines window as a non-configurable getter, so tests cannot delete it.
 * The node environment is the SSR case: window is absent.
 */

import { getLastQuery, getSavedQueries } from '../query-storage';

describe('query-storage SSR safety', () => {
  it('returns empty results when window is undefined', () => {
    expect(typeof window).toBe('undefined');
    expect(getSavedQueries()).toEqual([]);
    expect(getLastQuery()).toBeNull();
  });
});
