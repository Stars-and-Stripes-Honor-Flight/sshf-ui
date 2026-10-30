import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import esbuild from 'esbuild';

import { nodeEsmInvokeArgs } from './node-esm-args.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../../../');
const outfile = path.join(root, `tmp-guardian-list-render-${process.pid}.mjs`);

await esbuild.build({
  entryPoints: [path.join(here, 'render-guardian-document.jsx')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  alias: { '@': path.join(root, 'src') },
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  external: ['@react-pdf/renderer', 'react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
});

const result = spawnSync(
  process.execPath,
  nodeEsmInvokeArgs(path.join(here, 'register-next-react.mjs'), outfile),
  { cwd: root, encoding: 'utf8' }
);
fs.rmSync(outfile, { force: true });

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
