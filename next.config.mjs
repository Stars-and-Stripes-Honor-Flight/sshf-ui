import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), 'package.json');
const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bake the version of this build into the client bundle. An unset
  // NEXT_PUBLIC_SITE_VERSION used to fall through to 0.0.0 in src/config.js.
  // next.config env wins over a process env value of the same name at build time.
  env: {
    NEXT_PUBLIC_SITE_VERSION: version,
  },
};

export default nextConfig;
