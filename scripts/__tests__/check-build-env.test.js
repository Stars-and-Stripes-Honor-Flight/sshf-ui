import { REQUIRED_BUILD_ENV_VARS, findMissingBuildEnvVars } from '../check-build-env.mjs';

describe('check-build-env', () => {
  test('requires the four client build variables', () => {
    expect(REQUIRED_BUILD_ENV_VARS).toEqual([
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'NEXT_PUBLIC_ROLE_FULL_ACCESS',
      'NEXT_PUBLIC_ENVIRONMENT',
    ]);
  });

  test('returns an empty list when every variable is set', () => {
    const env = {
      NEXT_PUBLIC_API_URL: 'https://api.example.test',
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
      NEXT_PUBLIC_ROLE_FULL_ACCESS: 'group@example.test',
      NEXT_PUBLIC_ENVIRONMENT: 'Production',
    };
    expect(findMissingBuildEnvVars(env)).toEqual([]);
  });

  test('reports unset variables', () => {
    const env = {
      NEXT_PUBLIC_API_URL: 'https://api.example.test',
      NEXT_PUBLIC_ENVIRONMENT: 'Production',
    };
    expect(findMissingBuildEnvVars(env)).toEqual([
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'NEXT_PUBLIC_ROLE_FULL_ACCESS',
    ]);
  });

  test('treats blank values as missing', () => {
    const env = {
      NEXT_PUBLIC_API_URL: '   ',
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: '',
      NEXT_PUBLIC_ROLE_FULL_ACCESS: 'group@example.test',
      NEXT_PUBLIC_ENVIRONMENT: 'Production',
    };
    expect(findMissingBuildEnvVars(env)).toEqual([
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    ]);
  });
});
