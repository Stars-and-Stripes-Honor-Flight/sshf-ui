/**
 * Format a YYYY-MM-DD birth date for the roster without timezone shifting.
 * @param {string|undefined|null} value
 * @returns {string}
 */
export function formatRosterBirthDate(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return '—';
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return value;
  }

  return `${match[2]}/${match[3]}/${match[1]}`;
}
