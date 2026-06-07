export function countPhoneDigits(value) {
  return (value || '').replace(/\D/g, '').length;
}

export function isValidPhoneSearchTerm(value) {
  return countPhoneDigits(value) >= 3;
}
