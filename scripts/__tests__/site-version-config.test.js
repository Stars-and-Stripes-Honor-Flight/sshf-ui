import { readFileSync } from 'node:fs';
import path from 'node:path';

import nextConfig from '../../next.config.mjs';

const packageVersion = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).version;

describe('next.config site version', () => {
  test('bakes package.json version into NEXT_PUBLIC_SITE_VERSION', () => {
    expect(packageVersion).not.toBe('0.0.0');
    expect(nextConfig.env.NEXT_PUBLIC_SITE_VERSION).toBe(packageVersion);
  });
});
