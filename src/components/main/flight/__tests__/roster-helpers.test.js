import {
  getAssignedTo,
  getUniqueAssignedCallers,
  getPairStatusIssues,
  pairHasIssues,
  filterPairs,
  sortPairs,
  getPairSortSeat,
  compareSeatNumbers,
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

  describe('getPairStatusIssues', () => {
    test('returns empty array when pair has no issues', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          {
            type: 'Veteran',
            confirmed: true,
            medical_form: true,
            medical_level: 'Level 1',
            bus: 'Alpha1',
          },
          {
            type: 'Guardian',
            confirmed: true,
            medical_form: true,
            training_complete: true,
            training: 'Complete',
            bus: 'Alpha1',
          },
        ],
      };
      expect(getPairStatusIssues(pair)).toEqual([]);
    });

    test('includes busMismatch issue', () => {
      const pair = {
        busMismatch: true,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' }],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'busMismatch', label: 'Bus Mismatch', severity: 'warning' });
    });

    test('includes missingPairedPerson issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: true,
        people: [{ type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' }],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'missingPairedPerson', label: 'Missing Person', severity: 'error' });
    });

    test('includes veteran not confirmed issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: false, medical_form: true, medical_level: 'L1', bus: 'Alpha1' }],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'veteranNotConfirmed', label: 'Vet Not Confirmed', severity: 'warning', personType: 'Veteran' });
    });

    test('includes veteran medical form issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: true, medical_form: false, medical_level: 'L1', bus: 'Alpha1' }],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'veteranMedicalForm', label: 'Vet Medical Form', severity: 'warning', personType: 'Veteran' });
    });

    test('includes veteran medical level missing issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: true, medical_form: true, medical_level: '', bus: 'Alpha1' }],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'veteranMedicalLevel', label: 'Vet Medical Level', severity: 'warning', personType: 'Veteran' });
    });

    test('includes veteran no bus issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'None' }],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'veteranNoBus', label: 'Vet No Bus', severity: 'warning', personType: 'Veteran' });
    });

    test('includes guardian not confirmed issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          { type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' },
          { type: 'Guardian', confirmed: false, medical_form: true, training_complete: true, training: 'Yes', bus: 'Alpha1' },
        ],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'guardianNotConfirmed', label: 'Grd Not Confirmed', severity: 'warning', personType: 'Guardian' });
    });

    test('includes guardian medical form issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          { type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' },
          { type: 'Guardian', confirmed: true, medical_form: false, training_complete: true, training: 'Yes', bus: 'Alpha1' },
        ],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'guardianMedicalForm', label: 'Grd Medical Form', severity: 'warning', personType: 'Guardian' });
    });

    test('includes guardian training incomplete issue when training_complete is false', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          { type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' },
          { type: 'Guardian', confirmed: true, medical_form: true, training_complete: false, training: 'In progress', bus: 'Alpha1' },
        ],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'guardianTraining', label: 'Grd Training', severity: 'warning', personType: 'Guardian' });
    });

    test('includes guardian training incomplete issue when training is missing', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          { type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' },
          { type: 'Guardian', confirmed: true, medical_form: true, training_complete: true, training: '', bus: 'Alpha1' },
        ],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'guardianTraining', label: 'Grd Training', severity: 'warning', personType: 'Guardian' });
    });

    test('includes guardian no bus issue', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          { type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' },
          { type: 'Guardian', confirmed: true, medical_form: true, training_complete: true, training: 'Yes', bus: 'None' },
        ],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues).toContainEqual({ id: 'guardianNoBus', label: 'Grd No Bus', severity: 'warning', personType: 'Guardian' });
    });

    test('returns multiple issues when pair has multiple problems', () => {
      const pair = {
        busMismatch: true,
        missingPairedPerson: false,
        people: [
          { type: 'Veteran', confirmed: false, medical_form: false, medical_level: '', bus: 'None' },
          { type: 'Guardian', confirmed: false, medical_form: true, training_complete: false, training: '', bus: 'Alpha1' },
        ],
      };
      const issues = getPairStatusIssues(pair);
      expect(issues.length).toBeGreaterThan(5);
      expect(issues.some(i => i.id === 'busMismatch')).toBe(true);
      expect(issues.some(i => i.id === 'veteranNotConfirmed')).toBe(true);
      expect(issues.some(i => i.id === 'veteranMedicalForm')).toBe(true);
      expect(issues.some(i => i.id === 'veteranMedicalLevel')).toBe(true);
      expect(issues.some(i => i.id === 'veteranNoBus')).toBe(true);
      expect(issues.some(i => i.id === 'guardianNotConfirmed')).toBe(true);
      expect(issues.some(i => i.id === 'guardianTraining')).toBe(true);
    });
  });

  describe('pairHasIssues', () => {
    test('returns true when pair has bus mismatch', () => {
      const pair = {
        busMismatch: true,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' }],
      };
      expect(pairHasIssues(pair)).toBe(true);
    });

    test('returns true when veteran not confirmed', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: false, medical_form: true, medical_level: 'L1', bus: 'Alpha1' }],
      };
      expect(pairHasIssues(pair)).toBe(true);
    });

    test('returns true when veteran has no bus', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [{ type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'None' }],
      };
      expect(pairHasIssues(pair)).toBe(true);
    });

    test('returns false when pair has no issues', () => {
      const pair = {
        busMismatch: false,
        missingPairedPerson: false,
        people: [
          { type: 'Veteran', confirmed: true, medical_form: true, medical_level: 'L1', bus: 'Alpha1' },
          { type: 'Guardian', confirmed: true, medical_form: true, training_complete: true, training: 'Complete', bus: 'Alpha1' },
        ],
      };
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
            confirmed: true,
            medical_form: true,
            medical_level: 'Level 1',
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
            confirmed: true,
            medical_form: true,
            training_complete: true,
            training: 'Complete',
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
            confirmed: true,
            medical_form: true,
            medical_level: 'Level 2',
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
            confirmed: true,
            medical_form: true,
            training_complete: true,
            training: 'Complete',
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
            confirmed: true,
            medical_form: true,
            medical_level: 'Level 1',
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
      // Only pair 1 has no issues (pair 2 has busMismatch, pair 3 has bus: 'None')
      expect(result).toHaveLength(1);
      expect(result[0].pairId).toBe('1');
      expect(result.find(p => p.pairId === '2')).toBeUndefined();
      expect(result.find(p => p.pairId === '3')).toBeUndefined();
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
            confirmed: true,
            medical_form: true,
            medical_level: 'Level 1',
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
            confirmed: true,
            medical_form: true,
            medical_level: 'Level 1',
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
            confirmed: true,
            medical_form: true,
            medical_level: 'Level 1',
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
      // pair 2 has busMismatch, so it comes first
      // pairs 1 and 3 have no issues, sorted by name (Apple < Doe)
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

    test('sorts by seat (row then letter; empty seats last)', () => {
      const seatPairs = [
        {
          pairId: 'empty',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            {
              type: 'Veteran',
              name_first: 'No',
              name_last: 'Seat',
              bus: 'Alpha1',
              seat: '',
            },
          ],
        },
        {
          pairId: 'late',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            {
              type: 'Veteran',
              name_first: 'Late',
              name_last: 'Row',
              bus: 'Alpha1',
              seat: '11B',
            },
          ],
        },
        {
          pairId: 'early',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            {
              type: 'Veteran',
              name_first: 'Early',
              name_last: 'Row',
              bus: 'Alpha1',
              seat: '3A',
            },
          ],
        },
        {
          pairId: 'same-row-b',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            {
              type: 'Veteran',
              name_first: 'Same',
              name_last: 'B',
              bus: 'Alpha1',
              seat: '03B',
            },
          ],
        },
      ];

      const result = sortPairs(seatPairs, 'seat');
      expect(result.map((p) => p.pairId)).toEqual(['early', 'same-row-b', 'late', 'empty']);
    });

    test('sorts by guardian seat when pair has no veteran', () => {
      const guardianOnly = [
        {
          pairId: 'g1',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            {
              type: 'Guardian',
              name_first: 'G',
              name_last: 'One',
              bus: 'Alpha1',
              seat: '5C',
            },
          ],
        },
        {
          pairId: 'g2',
          busMismatch: false,
          missingPairedPerson: false,
          people: [
            {
              type: 'Guardian',
              name_first: 'G',
              name_last: 'Two',
              bus: 'Alpha1',
              seat: '2A',
            },
          ],
        },
      ];

      const result = sortPairs(guardianOnly, 'seat');
      expect(result.map((p) => p.pairId)).toEqual(['g2', 'g1']);
    });
  });

  describe('getPairSortSeat', () => {
    test('uses veteran seat when present', () => {
      const pair = {
        people: [
          { type: 'Veteran', seat: '12A' },
          { type: 'Guardian', seat: '99Z' },
        ],
      };
      expect(getPairSortSeat(pair)).toBe('12A');
    });

    test('uses guardian seat when veteran is missing', () => {
      const pair = {
        people: [{ type: 'Guardian', seat: '4D' }],
      };
      expect(getPairSortSeat(pair)).toBe('4D');
    });

    test('uses guardian seat when veteran has no seat', () => {
      const pair = {
        people: [
          { type: 'Veteran', seat: '' },
          { type: 'Guardian', seat: '4D' },
        ],
      };
      expect(getPairSortSeat(pair)).toBe('4D');
    });

    test('returns empty string when no seats assigned', () => {
      const pair = {
        people: [
          { type: 'Veteran', seat: '' },
          { type: 'Guardian', seat: '' },
        ],
      };
      expect(getPairSortSeat(pair)).toBe('');
    });
  });

  describe('compareSeatNumbers', () => {
    test('orders by row numerically (leading zero ignored)', () => {
      expect(compareSeatNumbers('3A', '11B')).toBeLessThan(0);
      expect(compareSeatNumbers('03A', '11B')).toBeLessThan(0);
    });

    test('treats 3A and 03A as the same row', () => {
      expect(compareSeatNumbers('3A', '03A')).toBe(0);
    });

    test('breaks ties by seat letter within the same row', () => {
      expect(compareSeatNumbers('3A', '3B')).toBeLessThan(0);
      expect(compareSeatNumbers('03B', '3A')).toBeGreaterThan(0);
    });

    test('sorts empty or missing seats after assigned seats', () => {
      expect(compareSeatNumbers('', '1A')).toBeGreaterThan(0);
      expect(compareSeatNumbers('1A', '')).toBeLessThan(0);
      expect(compareSeatNumbers('', '')).toBe(0);
    });

    test('sorts unparseable seats after valid seats', () => {
      expect(compareSeatNumbers('TBD', '2A')).toBeGreaterThan(0);
    });
  });
});
