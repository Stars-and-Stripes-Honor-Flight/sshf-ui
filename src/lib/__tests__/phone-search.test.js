import { countPhoneDigits, isValidPhoneSearchTerm } from '@/lib/phone-search';

describe('phone-search', () => {
  describe('countPhoneDigits', () => {
    test('counts digits only, ignoring formatting characters', () => {
      expect(countPhoneDigits('(414) 817-1255')).toBe(10);
      expect(countPhoneDigits('414-817')).toBe(6);
      expect(countPhoneDigits('abc')).toBe(0);
    });

    test('handles empty and nullish values', () => {
      expect(countPhoneDigits('')).toBe(0);
      expect(countPhoneDigits(null)).toBe(0);
      expect(countPhoneDigits(undefined)).toBe(0);
    });
  });

  describe('isValidPhoneSearchTerm', () => {
    test('returns true when at least 3 digits are present', () => {
      expect(isValidPhoneSearchTerm('414')).toBe(true);
      expect(isValidPhoneSearchTerm('(414) 8')).toBe(true);
      expect(isValidPhoneSearchTerm('414-817-1255')).toBe(true);
    });

    test('returns false when fewer than 3 digits', () => {
      expect(isValidPhoneSearchTerm('')).toBe(false);
      expect(isValidPhoneSearchTerm('41')).toBe(false);
      expect(isValidPhoneSearchTerm('(4)')).toBe(false);
      expect(isValidPhoneSearchTerm('abc')).toBe(false);
    });
  });
});
