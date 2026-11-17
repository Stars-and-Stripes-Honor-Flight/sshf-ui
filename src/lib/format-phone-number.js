/**
 * Formats a phone number as the user types (issue #281).
 * Distinct from `fixPhone` in `@/lib/review/normalize`, which is not this mask.
 */
export function formatPhoneNumber(value) {
  if (value === null || value === undefined) {
    return '';
  }
  let digits = String(value).replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  if (digits.length > 10 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Read-only roster display: format only an exact 10-digit stored value as ###-###-####.
 */
export function formatLegacyPhoneDisplay(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const raw = String(value);
  if (/^\d{10}$/.test(raw)) {
    return formatPhoneNumber(raw);
  }
  return raw;
}
