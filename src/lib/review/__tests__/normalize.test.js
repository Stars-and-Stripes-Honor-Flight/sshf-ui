import {
  assembleBirthDateFromParts,
  fixPhone,
  normalizeGender,
  normalizeReviewApplicationFields,
  normalizeServiceBranchForLogistics,
  normalizeState,
  parseLegacyDate,
  prepareReviewApplicationPayload,
} from '@/lib/review/normalize';

describe('review normalize helpers', () => {
  test('fixPhone formats ten-digit numbers', () => {
    expect(fixPhone('6085551234')).toBe('608-555-1234');
    expect(fixPhone('(608) 555-1234')).toBe('608-555-1234');
    expect(fixPhone('')).toBe('');
  });

  test('parseLegacyDate accepts MM/DD/YYYY and ISO dates', () => {
    expect(parseLegacyDate('05/17/1948')).toBe('1948-05-17');
    expect(parseLegacyDate('1948-05-17')).toBe('1948-05-17');
    expect(parseLegacyDate('invalid')).toBe('');
  });

  test('assembleBirthDateFromParts matches legacy vetedit validation', () => {
    expect(assembleBirthDateFromParts({ year: '1948', month: '5', day: '17' })).toBe('1948-05-17');
    expect(assembleBirthDateFromParts({ year: '', month: '', day: '' })).toBe('');
    expect(assembleBirthDateFromParts({ year: '1948', month: '2', day: '31' })).toBe('');
  });

  test('normalizeGender uses first letter like legacy accept', () => {
    expect(normalizeGender('Female')).toBe('F');
    expect(normalizeGender('male')).toBe('M');
    expect(normalizeGender('')).toBe('M');
  });

  test('normalizeState uppercases state codes', () => {
    expect(normalizeState('wi')).toBe('WI');
  });

  test('normalizeServiceBranchForLogistics clears Unknown', () => {
    expect(normalizeServiceBranchForLogistics('Unknown')).toBe('');
    expect(normalizeServiceBranchForLogistics('Army')).toBe('Army');
  });

  test('prepareReviewApplicationPayload merges and normalizes phones and state', () => {
    const existing = {
      _id: 'abc',
      type: 'VeteranApp',
      name: { first: 'John', last: 'Public' },
      address: { state: 'wi', phone_day: '6085551234' },
    };
    const form = {
      address: { city: 'Madison' },
    };
    const payload = prepareReviewApplicationPayload(existing, form);
    expect(payload.address.city).toBe('Madison');
    expect(payload.address.state).toBe('WI');
    expect(payload.address.phone_day).toBe('608-555-1234');
  });

  test('normalizeReviewApplicationFields normalizes gender', () => {
    const result = normalizeReviewApplicationFields({ gender: 'Female' });
    expect(result.gender).toBe('F');
  });
});
