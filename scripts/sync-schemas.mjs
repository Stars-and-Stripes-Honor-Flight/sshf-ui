#!/usr/bin/env node
/**
 * Fetch the API OpenAPI spec and regenerate Zod schemas.
 *
 * Usage:
 *   node scripts/sync-schemas.mjs           # dev API (default)
 *   node scripts/sync-schemas.mjs --local   # localhost:8080
 *   SYNC_SCHEMAS_URL=https://.../openapi.json node scripts/sync-schemas.mjs
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveOpenApiUrl } from './resolve-openapi-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OPENAPI_PATH = path.join(ROOT, 'docs', 'openapi.json');
const GENERATED_DIR = path.join(ROOT, 'src', 'schemas', 'generated');

const GENERATED_HEADER = `/**
 * AUTO-GENERATED FILE — DO NOT EDIT.
 * Source: docs/openapi.json (API-owned OpenAPI 3.0 contract).
 * Regenerate with: npm run sync-schemas
 * Local API: npm run sync-schemas:local
 */

`;

async function fetchOpenApi(url) {
  console.log(`Fetching OpenAPI spec from ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
  }
  const spec = await response.json();
  if (!spec?.openapi || !spec?.components?.schemas) {
    throw new Error('Fetched document does not look like a valid OpenAPI 3.x spec with components.schemas');
  }
  return spec;
}

function writeOpenApi(spec) {
  writeFileSync(OPENAPI_PATH, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, OPENAPI_PATH)}`);
}

function runOrval() {
  console.log('Generating Zod schemas with Orval ...');
  execSync('npx orval --config orval.config.mjs', {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

function ensureGeneratedHeaders() {
  const entries = readdirSync(GENERATED_DIR, { withFileTypes: true });
  let updated = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/\.(ts|js|mjs)$/.test(entry.name)) continue;

    const filePath = path.join(GENERATED_DIR, entry.name);
    const contents = readFileSync(filePath, 'utf8');
    // Orval already stamps "Do not edit manually"; keep those files as-is.
    if (
      contents.includes('AUTO-GENERATED FILE — DO NOT EDIT') ||
      contents.includes('Do not edit manually')
    ) {
      continue;
    }

    writeFileSync(filePath, `${GENERATED_HEADER}${contents}`, 'utf8');
    updated += 1;
  }
  console.log(
    `Checked AUTO-GENERATED headers under ${path.relative(ROOT, GENERATED_DIR)} (${updated} updated)`
  );
}

async function main() {
  const argv = process.argv.slice(2);
  const url = resolveOpenApiUrl(argv);

  try {
    const spec = await fetchOpenApi(url);
    writeOpenApi(spec);
    runOrval();
    ensureGeneratedHeaders();
    console.log('Schema sync complete.');
  } catch (error) {
    console.error(`Schema sync failed: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
