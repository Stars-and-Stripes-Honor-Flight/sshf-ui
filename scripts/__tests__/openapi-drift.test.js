import { diffOpenApiSpecs } from '../openapi-drift.mjs';

const base = {
  openapi: '3.0.0',
  info: { title: 'SSHF API', version: '1.1.0' },
  paths: { '/search': { get: { summary: 'Search' } } },
  components: { schemas: { Veteran: { type: 'object' } } },
};

describe('diffOpenApiSpecs', () => {
  test('treats the same document as in sync even when key order differs', () => {
    const reordered = {
      components: { schemas: { Veteran: { type: 'object' } } },
      paths: { '/search': { get: { summary: 'Search' } } },
      info: { version: '1.1.0', title: 'SSHF API' },
      openapi: '3.0.0',
    };

    const diff = diffOpenApiSpecs(base, reordered);

    expect(diff.equal).toBe(true);
    expect(diff.committedVersion).toBe('1.1.0');
    expect(diff.remoteVersion).toBe('1.1.0');
  });

  test('reports path and schema drift when info.version is unchanged', () => {
    const remote = {
      ...base,
      paths: {
        '/search': { get: { summary: 'Search' } },
        '/flights/{id}/complete': { post: { summary: 'Complete' } },
      },
      components: {
        schemas: {
          Veteran: { type: 'object' },
          FlightStatusBulkResult: { type: 'object' },
        },
      },
    };

    const diff = diffOpenApiSpecs(base, remote);

    expect(diff.equal).toBe(false);
    expect(diff.committedVersion).toBe(diff.remoteVersion);
    expect(diff.addedPaths).toEqual(['/flights/{id}/complete']);
    expect(diff.removedPaths).toEqual([]);
    expect(diff.addedSchemas).toEqual(['FlightStatusBulkResult']);
    expect(diff.removedSchemas).toEqual([]);
    expect(diff.summary).toMatch(/npm run sync-schemas/);
    expect(diff.summary).toMatch(/info\.version is 1\.1\.0 on both/);
  });

  test('reports paths and schemas that the remote spec dropped', () => {
    const remote = {
      ...base,
      paths: {},
      components: { schemas: {} },
    };

    const diff = diffOpenApiSpecs(base, remote);

    expect(diff.removedPaths).toEqual(['/search']);
    expect(diff.removedSchemas).toEqual(['Veteran']);
  });
});
