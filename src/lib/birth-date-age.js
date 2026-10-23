function isValidYmd(year, month, day) {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  );
}

/**
 * Parse a strict YYYY-MM-DD string. Returns null when blank, malformed, or not a real calendar date.
 */
export function parseIsoBirthDate(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (!isValidYmd(year, month, day)) {
    return null;
  }
  return { year, month, day };
}

/**
 * Exact age as of `asOf` (defaults to today), birthday-aware.
 * Returns null for blank, invalid, or future birth dates.
 */
export function calculateAgeFromBirthDate(value, asOf = new Date()) {
  const parsed = parseIsoBirthDate(value);
  if (!parsed) {
    return null;
  }

  const today = asOf instanceof Date ? asOf : new Date(asOf);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const { year, month, day } = parsed;

  if (
    year > todayYear
    || (year === todayYear && month > todayMonth)
    || (year === todayYear && month === todayMonth && day > todayDay)
  ) {
    return null;
  }

  let age = todayYear - year;
  if (month > todayMonth || (month === todayMonth && day > todayDay)) {
    age -= 1;
  }
  return age;
}

/**
 * Append `(Age: N)` to `baseLabel` when a valid birth date is present; otherwise return `baseLabel`.
 */
export function formatBirthDateLabelWithAge(baseLabel, birthDateValue, asOf = new Date()) {
  const age = calculateAgeFromBirthDate(birthDateValue, asOf);
  if (age === null) {
    return baseLabel;
  }
  return `${baseLabel} (Age: ${age})`;
}
