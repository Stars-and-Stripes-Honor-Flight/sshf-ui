import { ACTIVITY_PRESETS, getColumnConfig } from '@/components/main/flight/column-configs';

import {
  buildGuardianListRows,
  formatFlightDateLong,
  formatGuardianListName,
  formatPrintedAt,
  getGuardianListColumns,
  selectGuardiansInLetterRange,
} from '../guardian-list-range';
import { formatRosterBirthDate } from '../roster-format';

function guardian(overrides) {
  return { type: 'Guardian', ...overrides };
}

function veteran(overrides) {
  return { type: 'Veteran', ...overrides };
}

function pair(people) {
  return { people };
}

describe('selectGuardiansInLetterRange', () => {
  test('returns guardians whose last-name letter is inside an inclusive range', () => {
    const pairs = [
      pair([
        veteran({ id: 'v-m', name_last: 'Moore', name_first: 'Mia' }),
        guardian({ id: 'g-m', name_last: 'Moss', name_first: 'Mary' }),
      ]),
      pair([guardian({ id: 'g-a', name_last: 'Adams', name_first: 'Ann' })]),
      pair([guardian({ id: 'g-z', name_last: 'Zulu', name_first: 'Zoe' })]),
    ];

    const result = selectGuardiansInLetterRange(pairs, 'M', 'T');

    expect(result.ok).toBe(true);
    expect(result.guardians.map((entry) => entry.person.id)).toEqual(['g-m']);
  });

  test('excludes veterans, including a veteran whose last name is in range', () => {
    const pairs = [
      pair([
        veteran({ id: 'v-a', name_last: 'Anderson', name_first: 'Alan' }),
        guardian({ id: 'g-z', name_last: 'Zulu', name_first: 'Zoe' }),
      ]),
      pair([guardian({ id: 'g-a', name_last: 'Adams', name_first: 'Ann' })]),
    ];

    const result = selectGuardiansInLetterRange(pairs, 'A', 'B');

    expect(result.guardians.map((entry) => entry.person.id)).toEqual(['g-a']);
    expect(result.guardians.some((entry) => entry.person.type === 'Veteran')).toBe(false);
  });

  test('includes a guardian-only crew row and a no-fly guardian', () => {
    const pairs = [
      pair([guardian({ id: 'crew', name_last: 'Crew', name_first: 'Casey' })]),
      pair([
        veteran({ id: 'v', name_last: 'Vet', name_first: 'Val' }),
        guardian({ id: 'nofly', name_last: 'North', name_first: 'Ned', nofly: true }),
      ]),
    ];

    const result = selectGuardiansInLetterRange(pairs, 'A', 'Z');

    expect(result.guardians.map((entry) => entry.person.id)).toEqual(['crew', 'nofly']);
  });

  test('sorts by last name, then first name, case-insensitively', () => {
    const pairs = [
      pair([guardian({ id: 'zulu', name_last: 'Zulu', name_first: 'Zara' })]),
      pair([guardian({ id: 'alpha-amy', name_last: 'alpha', name_first: 'Amy' })]),
      pair([guardian({ id: 'alpha-bob', name_last: 'Alpha', name_first: 'bob' })]),
    ];

    expect(selectGuardiansInLetterRange(pairs, 'A', 'Z').guardians.map((entry) => entry.person.id)).toEqual([
      'alpha-amy',
      'alpha-bob',
      'zulu',
    ]);
  });

  test("orders O'Brien, Oak, Obrien, and Olson with base English collation", () => {
    const pairs = ['Oak', 'Olson', 'Obrien', "O'Brien"].map((name) =>
      pair([guardian({ id: name, name_last: name, name_first: 'A' })])
    );

    expect(selectGuardiansInLetterRange(pairs, 'O', 'O').guardians.map((entry) => entry.person.id)).toEqual([
      "O'Brien",
      'Oak',
      'Obrien',
      'Olson',
    ]);
  });

  test('orders de la Cruz before Deacon, and van Dyke after Van', () => {
    const names = ['Delta', 'van Dyke', 'de la Cruz', 'Van', 'Deacon'];
    const pairs = names.map((name) => pair([guardian({ id: name, name_last: name, name_first: 'A' })]));

    expect(selectGuardiansInLetterRange(pairs, 'A', 'Z').guardians.map((entry) => entry.person.id)).toEqual([
      'de la Cruz',
      'Deacon',
      'Delta',
      'Van',
      'van Dyke',
    ]);
  });

  test('treats a lowercase last name as its uppercase letter', () => {
    const pairs = [pair([guardian({ id: 'smith', name_last: 'smith', name_first: 'Sam' })])];

    expect(selectGuardiansInLetterRange(pairs, 'S', 'S').guardians.map((entry) => entry.person.id)).toEqual(['smith']);
    expect(selectGuardiansInLetterRange(pairs, 'T', 'T').guardians).toHaveLength(0);
  });

  test('folds an accented first letter onto A–Z', () => {
    const pairs = [pair([guardian({ id: 'alvarez', name_last: 'Álvarez', name_first: 'Ana' })])];

    expect(selectGuardiansInLetterRange(pairs, 'A', 'A').guardians.map((entry) => entry.person.id)).toEqual([
      'alvarez',
    ]);
  });

  test('omits a blank last name and a last name with no A–Z letter', () => {
    const pairs = [
      pair([guardian({ id: 'blank', name_last: '  ', name_first: 'Blank' })]),
      pair([guardian({ id: 'ost', name_last: 'Østergaard', name_first: 'Otto' })]),
      pair([guardian({ id: 'ada', name_last: 'Ada', name_first: 'Ann' })]),
    ];

    const result = selectGuardiansInLetterRange(pairs, 'A', 'Z');

    expect(result.guardians.map((entry) => entry.person.id)).toEqual(['ada']);
    expect(result.omittedUnlettered).toBe(2);
  });

  test('uses B for a last name that starts with an apostrophe', () => {
    const pairs = [pair([guardian({ id: 'brien', name_last: "'Brien", name_first: 'Pat' })])];

    expect(selectGuardiansInLetterRange(pairs, 'B', 'B').guardians.map((entry) => entry.person.id)).toEqual(['brien']);
    expect(selectGuardiansInLetterRange(pairs, 'O', 'O').guardians).toHaveLength(0);
  });

  test('treats From equal to To as that single letter', () => {
    const pairs = [
      pair([guardian({ id: 'm', name_last: 'Moss', name_first: 'Mary' })]),
      pair([guardian({ id: 'n', name_last: 'Ng', name_first: 'Nina' })]),
    ];

    expect(selectGuardiansInLetterRange(pairs, 'M', 'M').guardians.map((entry) => entry.person.id)).toEqual(['m']);
  });

  test('reports an inverted range and returns no guardians', () => {
    const pairs = [pair([guardian({ id: 'm', name_last: 'Moss', name_first: 'Mary' })])];

    expect(selectGuardiansInLetterRange(pairs, 'T', 'M')).toEqual({
      ok: false,
      reason: 'inverted-range',
      guardians: [],
      omittedUnlettered: 0,
    });
  });

  test('keeps one guardian row when the same id is on two pairs and checks mail call only when every veteran is true', () => {
    const pairs = [
      pair([
        guardian({ id: 'g1', name_last: 'Adams', name_first: 'Ann' }),
        veteran({ id: 'v1', name_last: 'One', mail_call_received: true, mail_call_adopt: true }),
      ]),
      pair([
        guardian({ id: 'g1', name_last: 'Adams', name_first: 'Ann' }),
        veteran({ id: 'v2', name_last: 'Two', mail_call_received: true, mail_call_adopt: false }),
      ]),
    ];

    const result = selectGuardiansInLetterRange(pairs, 'A', 'Z');

    expect(result.guardians).toHaveLength(1);
    expect(result.guardians[0].person.id).toBe('g1');
    expect(result.guardians[0].mailCallReceived).toBe(true);
    expect(result.guardians[0].mailCallAdopt).toBe(false);

    const single = selectGuardiansInLetterRange(
      [
        pair([
          guardian({ id: 'g2', name_last: 'Baker', name_first: 'Bo' }),
          veteran({ id: 'v3', mail_call_received: true, mail_call_adopt: false }),
        ]),
      ],
      'A',
      'Z'
    );
    expect(single.guardians[0].mailCallReceived).toBe(true);
    expect(single.guardians[0].mailCallAdopt).toBe(false);
  });

  test('formats Last, First and leaves a missing side without a dangling comma', () => {
    expect(formatGuardianListName({ name_last: 'Smith', name_first: 'Ann' })).toBe('Smith, Ann');
    expect(formatGuardianListName({ name_last: 'Smith', name_first: '  ' })).toBe('Smith');
    expect(formatGuardianListName({ name_last: '', name_first: 'Cher' })).toBe('Cher');
    expect(formatGuardianListName({ name_last: '', name_first: '' })).toBe('—');
  });

  test('maps guardian fields from the guardian and ignores mail-call flags on the guardian object', () => {
    const selected = selectGuardiansInLetterRange(
      [
        pair([
          guardian({
            id: 'g1',
            name_last: 'Ng',
            name_first: 'Nina',
            name_middle: 'M',
            phone_mbl: '608-555-0100',
            birth_date: '1969-05-07',
            training: 'Main',
            training_complete: true,
            flight_training_notes: 'Passport later',
            flight_waiver: true,
            flight_training_see_doc: false,
            mail_call_received: true,
            mail_call_adopt: true,
          }),
          veteran({
            id: 'v1',
            name_last: 'VetLast',
            name_first: 'Victor',
            mail_call_received: false,
            mail_call_adopt: false,
          }),
        ]),
      ],
      'A',
      'Z'
    );

    expect(selected.guardians[0].mailCallReceived).toBe(false);
    expect(selected.guardians[0].mailCallAdopt).toBe(false);

    expect(buildGuardianListRows(selected.guardians)[0]).toEqual({
      id: 'g1',
      name: 'Ng, Nina',
      middle: 'M',
      mobile: '608-555-0100',
      dob: '05/07/1969',
      training: 'Main',
      trainingComplete: true,
      trainingNotes: 'Passport later',
      waiver: true,
      seeDoc: false,
      mailCallReceived: false,
      mailCallAdopt: false,
    });
  });

  test('leaves both mail-call boxes blank when the guardian has no veteran on the flight', () => {
    const result = selectGuardiansInLetterRange(
      [
        pair([
          guardian({
            id: 'crew',
            name_last: 'Crew',
            name_first: 'Casey',
            mail_call_received: true,
            mail_call_adopt: true,
          }),
        ]),
      ],
      'A',
      'Z'
    );

    expect(result.guardians[0].mailCallReceived).toBe(false);
    expect(result.guardians[0].mailCallAdopt).toBe(false);
  });

  test('checks mail call for every veteran in one pair only when all of them have the flag', () => {
    const result = selectGuardiansInLetterRange(
      [
        pair([
          guardian({ id: 'g1', name_last: 'Ng', name_first: 'Nina' }),
          veteran({ id: 'v1', mail_call_received: true, mail_call_adopt: false }),
          veteran({ id: 'v2', mail_call_received: false, mail_call_adopt: true }),
        ]),
      ],
      'A',
      'Z'
    );

    expect(result.guardians).toHaveLength(1);
    expect(result.guardians[0].mailCallReceived).toBe(false);
    expect(result.guardians[0].mailCallAdopt).toBe(false);
  });

  test("does not include the paired veteran's name", () => {
    const selected = selectGuardiansInLetterRange(
      [
        pair([
          guardian({ id: 'g1', name_last: 'Ng', name_first: 'Nina' }),
          veteran({ id: 'v1', name_last: 'VetLast', name_first: 'Victor' }),
        ]),
      ],
      'A',
      'Z'
    );
    const row = buildGuardianListRows(selected.guardians)[0];

    expect(row.name).toBe('Ng, Nina');
    expect(row.name).not.toContain('Victor');
    expect(row.name).not.toContain('VetLast');
  });
});

describe('guardian list formatting', () => {
  test('formats date of birth as MM/DD/YYYY without Date parsing', () => {
    expect(formatRosterBirthDate('1969-05-07')).toBe('05/07/1969');
    expect(formatRosterBirthDate('')).toBe('—');
    expect(formatRosterBirthDate(null)).toBe('—');
    expect(formatRosterBirthDate('not-a-date')).toBe('not-a-date');
  });

  test('formats a flight date as MMMM DD, YYYY from the YYYY-MM-DD string', () => {
    expect(formatFlightDateLong('2026-05-01')).toBe('May 01, 2026');
    expect(formatFlightDateLong('')).toBe('—');
  });

  test('formats the printed timestamp in America/Chicago with a short zone name', () => {
    expect(formatPrintedAt(new Date('2026-10-23T18:45:00Z'), 'America/Chicago')).toBe('Oct 23, 2026, 1:45 PM CDT');
  });

  test('lists Name, the guardian training labels, Mail Rcvd, Mail Adopt, and Checked in', () => {
    const labels = getGuardianListColumns().map((column) => column.label);
    const trainingLabels = getColumnConfig(ACTIVITY_PRESETS.TRAINING, true).map((column) => column.label);

    expect(labels).toEqual(['Name', ...trainingLabels, 'Mail Rcvd', 'Mail Adopt', 'Checked in']);
    expect(labels).not.toContain('Mail Rcvd / Training');
    expect(labels).not.toContain('Mail Adopt / Training Notes');
  });
});
