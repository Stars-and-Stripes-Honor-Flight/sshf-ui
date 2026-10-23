import {
  calculateAgeFromBirthDate,
  formatBirthDateLabelWithAge,
  parseIsoBirthDate,
} from '../birth-date-age';

const AS_OF = new Date(2026, 9, 23); // Oct 23, 2026 (local)

describe('parseIsoBirthDate', () => {
  test('accepts valid YYYY-MM-DD', () => {
    expect(parseIsoBirthDate('1940-01-01')).toEqual({ year: 1940, month: 1, day: 1 });
  });

  test('rejects blank and invalid input', () => {
    expect(parseIsoBirthDate('')).toBeNull();
    expect(parseIsoBirthDate('   ')).toBeNull();
    expect(parseIsoBirthDate('not-a-date')).toBeNull();
    expect(parseIsoBirthDate('1940-01')).toBeNull();
    expect(parseIsoBirthDate('1940-02-31')).toBeNull();
  });
});

describe('calculateAgeFromBirthDate', () => {
  test('returns null for blank, invalid, and future dates', () => {
    expect(calculateAgeFromBirthDate('', AS_OF)).toBeNull();
    expect(calculateAgeFromBirthDate('bad', AS_OF)).toBeNull();
    expect(calculateAgeFromBirthDate('2030-01-01', AS_OF)).toBeNull();
  });

  test('birthday today', () => {
    expect(calculateAgeFromBirthDate('1940-10-23', AS_OF)).toBe(86);
  });

  test('birthday later this year subtracts one', () => {
    expect(calculateAgeFromBirthDate('1940-12-25', AS_OF)).toBe(85);
  });

  test('birthday already passed this year', () => {
    expect(calculateAgeFromBirthDate('1940-01-01', AS_OF)).toBe(86);
  });

  test('Feb 29 on a leap year', () => {
    expect(calculateAgeFromBirthDate('2000-02-29', AS_OF)).toBe(26);
  });

  test('Feb 29 on a non-leap year is invalid', () => {
    expect(calculateAgeFromBirthDate('2001-02-29', AS_OF)).toBeNull();
  });
});

describe('formatBirthDateLabelWithAge', () => {
  test('appends age when valid', () => {
    expect(formatBirthDateLabelWithAge('Birth Date', '1940-01-01', AS_OF)).toBe('Birth Date (Age: 86)');
  });

  test('returns base label when age cannot be calculated', () => {
    expect(formatBirthDateLabelWithAge('Birth Date', '', AS_OF)).toBe('Birth Date');
    expect(formatBirthDateLabelWithAge('Birth date (YYYY-MM-DD)', '1940-13-01', AS_OF)).toBe(
      'Birth date (YYYY-MM-DD)'
    );
  });
});
