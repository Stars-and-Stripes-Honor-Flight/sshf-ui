import { isAdhocQueryEnabled } from '@/lib/adhoc-query';

describe('isAdhocQueryEnabled', () => {
  const originalFlag = process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY;

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY;
    } else {
      process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = originalFlag;
    }
  });

  test('returns true when the flag is true', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'true';
    expect(isAdhocQueryEnabled()).toBe(true);
  });

  test('returns false when the flag is false', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = 'false';
    expect(isAdhocQueryEnabled()).toBe(false);
  });

  test('returns false when the flag is unset', () => {
    delete process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY;
    expect(isAdhocQueryEnabled()).toBe(false);
  });

  test('returns false when the flag is whitespace', () => {
    process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY = '   ';
    expect(isAdhocQueryEnabled()).toBe(false);
  });
});
