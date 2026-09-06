import {
  getAssignedTo,
  getUniqueAssignedCallers,
  pairHasIssues,
  filterPairs,
  sortPairs,
} from '../roster-helpers';

describe('roster-helpers', () => {
  describe('getAssignedTo', () => {
    test('returns flat assigned_to when present', () => {
      const person = { assigned_to: 'Karyn' };
      expect(getAssignedTo(person)).toBe('Karyn');
    });

    test('falls back to call.assigned_to when flat field is missing', () => {
      const person = { call: { assigned_to: 'Jim K' } };
      expect(getAssignedTo(person)).toBe('Jim K');
    });

    test('returns empty string when both are missing', () => {
      const person = {};
      expect(getAssignedTo(person)).toBe('');
    });

    test('prefers flat assigned_to over nested', () => {
      const person = { assigned_to: 'Karyn', call: { assigned_to: 'Jim K' } };
      expect(getAssignedTo(person)).toBe('Karyn');
    });
  });

  describe('getUniqueAssignedCallers', () => {
    test('returns empty array when no callers assigned', () => {
      const pairs = [
        {
          people: [
            { type: 'Veteran', assigned_to: '' },
            { type: 'Guardian', assigned_to: '' },
          ],
        },
      ];
      expect(getUniqueAssignedCallers(pairs)).toEqual([]);
    });

    test('returns unique callers sorted alphabetically', () => {
      const pairs = [
        {
          people: [
            { type: 'Veteran', assigned_to: 'Karyn' },
            { type: 'Guardian', assigned_to: 'Karyn' },
          ],
        },
        {
          people: [
            { type: 'Veteran', assigned_to: 'Alice' },
            { type: 'Guardian', assigned_to: 'Bob' },
          ],
        },
      ];
      expect(getUniqueAssignedCallers(pairs)).toEqual(['Alice', 'Bob', 'Karyn']);
    });

    test('excludes empty caller values', () => {
      const pairs = [
        {
          people: [
            { type: 'Veteran', assigned_to: 'Karyn' },
            { type: 'Guardian', assigned_to: '' },
          ],
        },
      ];
      expect(getUniqueAssignedCallers(pairs)).toEqual(['Karyn']);
    });

    test('handles nested call.assigned_to', () => {
      const pairs = [
        {
          people: [
            { type: 'Veteran', call: { assigned_to: 'Jim K' } },
          ],
        },
      ];
      expect(getUniqueAssignedCallers(pairs)).toEqual(['Jim K']);
    });
  });

  describe('pairHasIssues', () => {
    test('returns true when pair has bus mismatch', () => {
      const pair = { busMismatch: true, missingPairedPerson: false };
      expect(pairHasIssues(pair)).toBe(true);
    });

    test('returns true when pair has missing paired person', () => {
      const pair = { busMismatch: false, missingPairedPerson: true };
      expect(pairHasIssues(pair)).toBe(true);
    });

    test('returns true when pair has both issues', () => {
      const pair = { busMismatch: true, missingPairedPerson: true };
      expect(pairHasIssues(pair)).toBe(true);
    });

    test('returns false when pair has no issues', () => {
      const pair = { busMismatch: false, missingPairedPerson: false };
      expect(pairHasIssues(pair)).toBe(false);
    });
  });

  describe('filterPairs', () => {
    const testPairs = [
      {
        pairId: '1',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          {
            type: 'Veteran',
            name_first: 'John',
            name_last: 'Doe',
            phone_mbl: '920-555-0100',
            city: 'Madison, WI',
            bus: 'Alpha1',
            assigned_to: 'Karyn',
            nofly: false,
          },
          {
            type: 'Guardian',
            name_first: 'Jane',
            name_last: 'Doe',
            phone_mbl: '920-555-0101',
            city: 'Madison, WI',
            bus: 'Alpha1',
            assigned_to: 'Karyn',
            nofly: false,
          },
        ],
      },
      {
        pairId: '2',
        busMismatch: true,
        missingPairedPerson: false,
        people: [
          {
            type: 'Veteran',
            name_first: 'Bob',
            name_last: 'Smith',
            phone_mbl: '608-555-0200',
            city: 'Milwaukee, WI',
            bus: 'Alpha2',
            assigned_to: 'Alice',
            nofly: false,
          },
          {
            type: 'Guardian',
            name_first: 'Sue',
            name_last: 'Smith',
            phone_mbl: '608-555-0201',
            city: 'Milwaukee, WI',
            bus: 'Alpha1',
            assigned_to: 'Alice',
            nofly: true,
          },
        ],
      },
      {
        pairId: '3',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          {
            type: 'Veteran',
            name_first: 'Charlie',
            name_last: 'Brown',
            phone_mbl: '414-555-0300',
            city: 'Green Bay, WI',
            bus: 'None',
            assigned_to: '',
            nofly: false,
          },
        ],
      },
    ];

    test('returns all pairs when no filters applied', () => {
      const result = filterPairs(testPairs, {});
      expect(result).toHaveLength(3);
    });

    test('filters by name (first or last)', () => {
      const result = filterPairs(testPairs, { nameFilter: 'john' });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('1');
    });

    test('filters by phone number', () => {
      const result = filterPairs(testPairs, { nameFilter: '608-555' });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('2');
    });

    test('filters by city', () => {
      const result = filterPairs(testPairs, { nameFilter: 'milwaukee' });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('2');
    });

    test('matches guardian name, phone, or city', () => {
      const result = filterPairs(testPairs, { nameFilter: 'sue' });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('2');
    });

    test('filters by status: ok excludes pairs with issues', () => {
      const result = filterPairs(testPairs, { statusFilter: 'ok' });
      expect(result).toHaveLength(2);
      expect(result.find(p => p.pairId === '2')).toBeUndefined();
    });

    test('filters by status: issues includes only pairs with validation issues', () => {
      const result = filterPairs(testPairs, { statusFilter: 'issues' });
      expect(result).toHaveLength(2);
      expect(result.some(p => p.pairId === '2')).toBe(true);
      expect(result.some(p => p.pairId === '3')).toBe(true);
    });

    test('filters by status: nofly includes only pairs with nofly persons', () => {
      const result = filterPairs(testPairs, { statusFilter: 'nofly' });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('2');
    });

    test('filters by bus', () => {
      const result = filterPairs(testPairs, { busFilter: 'Alpha1' });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('1');
    });

    test('filters by assigned caller', () => {
      const result = filterPairs(testPairs, { assignedCallerFilter: 'Karyn' });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('1');
    });

    test('applies multiple filters together', () => {
      const result = filterPairs(testPairs, {
        nameFilter: 'smith',
        statusFilter: 'nofly',
      });
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('2');
    });
  });

  describe('sortPairs', () => {
    const testPairs = [
      {
        pairId: '1',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          {
            type: 'Veteran',
            name_first: 'John',
            name_last: 'Doe',
            bus: 'Alpha2',
            assigned_to: 'Karyn',
          },
        ],
      },
      {
        pairId: '2',
        busMismatch: true,
        missingPairedPerson: false,
        people: [
          {
            type: 'Veteran',
            name_first: 'Alice',
            name_last: 'Brown',
            bus: 'Alpha1',
            assigned_to: 'Bob',
          },
        ],
      },
      {
        pairId: '3',
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          {
            type: 'Veteran',
            name_first: 'Charlie',
            name_last: 'Apple',
            bus: 'Bravo1',
            assigned_to: 'Alice',
          },
        ],
      },
    ];

    test('sorts by veteran name (last, first)', () => {
      const result = sortPairs(testPairs, 'name');
      expect(result[0].pairId).toBe('3');
      expect(result[1].pairId).toBe('2');
      expect(result[2].pairId).toBe('1');
    });

    test('sorts by bus assignment', () => {
      const result = sortPairs(testPairs, 'bus');
      expect(result[0].pairId).toBe('2');
      expect(result[1].pairId).toBe('1');
      expect(result[2].pairId).toBe('3');
    });

    test('sorts by assignment (caller name)', () => {
      const result = sortPairs(testPairs, 'assignment');
      expect(result[0].pairId).toBe('3');
      expect(result[1].pairId).toBe('2');
      expect(result[2].pairId).toBe('1');
    });

    test('sorts by status (issues first, then OK)', () => {
      const result = sortPairs(testPairs, 'status');
      expect(result[0].pairId).toBe('2');
      expect(result[1].pairId).toBe('3');
      expect(result[2].pairId).toBe('1');
    });

    test('does not mutate original array', () => {
      const original = [...testPairs];
      sortPairs(testPairs, 'name');
      expect(testPairs).toEqual(original);
    });

    test('returns unsorted copy when sortBy is invalid', () => {
      const result = sortPairs(testPairs, 'invalid');
      expect(result).toEqual(testPairs);
      expect(result).not.toBe(testPairs);
    });
  });
});
