import { getEnvironmentBanner } from '@/lib/environment';

describe('getEnvironmentBanner', () => {
  const originalEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  afterEach(() => {
    if (originalEnvironment === undefined) {
      delete process.env.NEXT_PUBLIC_ENVIRONMENT;
    } else {
      process.env.NEXT_PUBLIC_ENVIRONMENT = originalEnvironment;
    }
  });

  test('hides the banner when the environment is Production', () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Production';
    expect(getEnvironmentBanner().show).toBe(false);
  });

  test('hides the banner regardless of Production casing', () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
    expect(getEnvironmentBanner().show).toBe(false);
  });

  test('shows the banner with the environment name for non-production environments', () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = 'Development';
    const banner = getEnvironmentBanner();
    expect(banner.show).toBe(true);
    expect(banner.label).toBe('DEVELOPMENT ENVIRONMENT');
  });

  test('shows a generic test banner when the environment is unset', () => {
    delete process.env.NEXT_PUBLIC_ENVIRONMENT;
    const banner = getEnvironmentBanner();
    expect(banner.show).toBe(true);
    expect(banner.label).toBe('TEST ENVIRONMENT');
  });

  test('shows a generic test banner when the environment is blank', () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = '   ';
    const banner = getEnvironmentBanner();
    expect(banner.show).toBe(true);
    expect(banner.label).toBe('TEST ENVIRONMENT');
  });
});
