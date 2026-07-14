import { resolveOpenApiUrl } from '../resolve-openapi-url.mjs';

const DEV_URL = 'https://sshf-api-330507742215.us-central1.run.app/openapi.json';
const LOCAL_URL = 'http://localhost:8080/openapi.json';

describe('resolveOpenApiUrl', () => {
  const originalEnv = process.env.SYNC_SCHEMAS_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.SYNC_SCHEMAS_URL;
    } else {
      process.env.SYNC_SCHEMAS_URL = originalEnv;
    }
  });

  test('defaults to the dev API OpenAPI URL', () => {
    delete process.env.SYNC_SCHEMAS_URL;
    expect(resolveOpenApiUrl([])).toBe(DEV_URL);
  });

  test('uses localhost when --local is passed', () => {
    delete process.env.SYNC_SCHEMAS_URL;
    expect(resolveOpenApiUrl(['--local'])).toBe(LOCAL_URL);
  });

  test('prefers SYNC_SCHEMAS_URL over defaults and --local', () => {
    process.env.SYNC_SCHEMAS_URL = 'https://example.test/openapi.json';
    expect(resolveOpenApiUrl(['--local'])).toBe('https://example.test/openapi.json');
  });
});
