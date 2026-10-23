import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(__dirname, '../../../../../');

describe('real guardian list PDF render', () => {
  test('renders GuardianListDocument with the React 19 build Next serves to the browser', () => {
    const result = spawnSync(process.execPath, [path.join(__dirname, '../pdf-render-check/run-render-test.mjs')], {
      cwd: root,
      encoding: 'utf8',
    });

    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || 'render test exited without a PDF');
    }
    expect(result.stdout).toContain('%PDF-');
  }, 30000);
});
