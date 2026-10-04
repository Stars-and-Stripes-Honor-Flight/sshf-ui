import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { resolveOpenApiUrl } from './resolve-openapi-url.mjs';

export function canonicalSpec(value) {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalSpec(item));
  }

  if (value && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = canonicalSpec(value[key]);
    }
    return sorted;
  }

  return value;
}

export function specFingerprint(spec) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalSpec(spec)))
    .digest('hex');
}

function names(record) {
  return Object.keys(record || {}).sort();
}

function list(title, items) {
  if (!items.length) {
    return null;
  }
  return `${title}: ${items.join(', ')}`;
}

export function formatOpenApiDrift(diff) {
  if (diff.equal) {
    return `OpenAPI spec matches the dev API (info.version ${diff.remoteVersion}).`;
  }

  const sameVersion = diff.committedVersion === diff.remoteVersion;
  const lines = [
    'Committed docs/openapi.json does not match the dev API OpenAPI document.',
    sameVersion
      ? `info.version is ${diff.committedVersion} on both; the documents still differ.`
      : `Committed info.version ${diff.committedVersion}; dev info.version ${diff.remoteVersion}.`,
  ];

  for (const line of [
    list('Paths only on the dev API', diff.addedPaths),
    list('Paths only in the repo', diff.removedPaths),
    list('Schemas only on the dev API', diff.addedSchemas),
    list('Schemas only in the repo', diff.removedSchemas),
  ]) {
    if (line) {
      lines.push(line);
    }
  }

  lines.push('Refresh with: npm run sync-schemas');
  return lines.join('\n');
}

export function diffOpenApiSpecs(committed, remote) {
  const committedPaths = names(committed?.paths);
  const remotePaths = names(remote?.paths);
  const committedSchemas = names(committed?.components?.schemas);
  const remoteSchemas = names(remote?.components?.schemas);
  const addedPaths = remotePaths.filter((item) => !committedPaths.includes(item));
  const removedPaths = committedPaths.filter((item) => !remotePaths.includes(item));
  const addedSchemas = remoteSchemas.filter((item) => !committedSchemas.includes(item));
  const removedSchemas = committedSchemas.filter((item) => !remoteSchemas.includes(item));
  const committedVersion = committed?.info?.version ?? null;
  const remoteVersion = remote?.info?.version ?? null;
  const equal = specFingerprint(committed) === specFingerprint(remote);
  const diff = {
    equal,
    committedVersion,
    remoteVersion,
    addedPaths,
    removedPaths,
    addedSchemas,
    removedSchemas,
  };

  return {
    ...diff,
    summary: formatOpenApiDrift(diff),
  };
}

async function main() {
  const url = resolveOpenApiUrl([]);
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const committed = JSON.parse(readFileSync(path.join(root, 'docs', 'openapi.json'), 'utf8'));
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    process.exitCode = 1;
    return;
  }

  const diff = diffOpenApiSpecs(committed, await response.json());
  console.log(diff.summary);
  if (!diff.equal) {
    process.exitCode = 1;
  }
}

const isRunDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunDirectly) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
