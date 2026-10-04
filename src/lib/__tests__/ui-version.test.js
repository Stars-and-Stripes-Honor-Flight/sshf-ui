import { readFileSync } from 'node:fs';
import path from 'node:path';

import { getUiVersion } from '@/lib/ui-version';

const packageVersion = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).version;

describe('getUiVersion', () => {
  test('returns the package.json version baked for this build', () => {
    expect(packageVersion).not.toBe('0.0.0');
    expect(getUiVersion()).toBe(packageVersion);
  });
});
