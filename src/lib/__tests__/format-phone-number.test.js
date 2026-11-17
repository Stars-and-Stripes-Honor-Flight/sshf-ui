import { formatPhoneNumber } from '@/lib/format-phone-number';

/**
 * Input mask for issue #281. Rules pinned here (Steve: review before implementation):
 *
 * 1. Strip every non-digit. Null, undefined, whitespace, and digit-less input are ''.
 * 2. A leading 1 is a country code only when more than 10 digits remain. Drop exactly
 *    one leading 1 in that case. 10 or fewer digits keep a leading 1 (`1414555121`
 *    is area code 141, not a country code).
 * 3. Keep the first 10 digits after that. Further digits, including extension digits,
 *    are ignored. There is no extension syntax.
 * 4. Group progressively: 1–3 digits as-is, 4–6 as `XXX-rest`, 7–10 as `XXX-XXX-rest`.
 * 5. This helper is not `fixPhone`. Display-only roster cells must not run partial or
 *    punctuated stored values through it; see renderPhoneCell tests.
 */
describe('formatPhoneNumber', () => {
  test.each([
    ['4', '4'],
    ['41', '41'],
    ['414', '414'],
    ['4145', '414-5'],
    ['41455', '414-55'],
    ['414555', '414-555'],
    ['4145551', '414-555-1'],
    ['41455512', '414-555-12'],
    ['414555121', '414-555-121'],
    ['4145551212', '414-555-1212'],
  ])('formats %s progressively as %s', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  test('is idempotent for a fully formatted number', () => {
    expect(formatPhoneNumber('414-555-1212')).toBe('414-555-1212');
    expect(formatPhoneNumber(formatPhoneNumber('4145551212'))).toBe('414-555-1212');
  });

  test.each([
    ['(414) 555-1212', '414-555-1212'],
    ['414.555.1212', '414-555-1212'],
    ['414 555 1212', '414-555-1212'],
    ['(414) 5', '414-5'],
    ['414.555', '414-555'],
    ['414 555 1', '414-555-1'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  test.each([
    ['1-414-555-1212', '414-555-1212'],
    ['+1 (414) 555-1212', '414-555-1212'],
    ['14145551212', '414-555-1212'],
    ['1 (414) 555-1212', '414-555-1212'],
  ])('drops a leading country code 1 from %s', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  test('drops exactly one leading 1, and only when more than 10 digits are present', () => {
    expect(formatPhoneNumber('11234567890')).toBe('123-456-7890');
    expect(formatPhoneNumber('111234567890')).toBe('112-345-6789');
    expect(formatPhoneNumber('12225551212')).toBe('222-555-1212');
  });

  test('keeps a leading 1 when the input has 10 or fewer digits', () => {
    expect(formatPhoneNumber('1')).toBe('1');
    expect(formatPhoneNumber('+1')).toBe('1');
    expect(formatPhoneNumber('14')).toBe('14');
    expect(formatPhoneNumber('141')).toBe('141');
    expect(formatPhoneNumber('1414')).toBe('141-4');
    expect(formatPhoneNumber('1414555121')).toBe('141-455-5121');
  });

  test('keeps a leading zero instead of treating the value as a number', () => {
    expect(formatPhoneNumber('0414555121')).toBe('041-455-5121');
  });

  test.each([
    ['41455512123', '414-555-1212'],
    ['414-555-1212 9', '414-555-1212'],
    ['1414555121299', '414-555-1212'],
    ['+1 (414) 555-1212 9', '414-555-1212'],
  ])('ignores digits beyond 10 in %s', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  test.each([
    ['414-555-1212 x123', '414-555-1212'],
    ['4145551212ext99', '414-555-1212'],
    ['(414) 555-1212 ext. 99', '414-555-1212'],
    ['414-555-1212#99', '414-555-1212'],
  ])('does not keep an extension on %s', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  test.each([
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['   ', ''],
    ['()', ''],
    ['+', ''],
    ['abc', ''],
    ['414-555-HOME', '414-555'],
  ])('formats %j as %j', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });
});
