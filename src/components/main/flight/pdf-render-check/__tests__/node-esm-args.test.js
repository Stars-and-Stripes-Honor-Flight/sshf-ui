import path from 'node:path';

import { nodeEsmInvokeArgs } from '../node-esm-args.mjs';

describe('nodeEsmInvokeArgs', () => {
  test('passes the loader as a file URL and the entry script as a filesystem path', () => {
    const loaderPath = path.resolve('register-next-react.mjs');
    const scriptPath = path.resolve('tmp-guardian-list-render.mjs');
    const [flag, importSpecifier, scriptSpecifier] = nodeEsmInvokeArgs(loaderPath, scriptPath);

    expect(flag).toBe('--import');
    // Windows ESM rejects `C:\...` on --import (protocol "c:"). A file URL works
    // on Windows and Linux. The entry script must stay a filesystem path: the
    // React resolve hook treats a file URL entry as a relative specifier and
    // joins it onto the working directory.
    expect(new URL(importSpecifier).protocol).toBe('file:');
    expect(importSpecifier).toContain('register-next-react.mjs');
    expect(scriptSpecifier).toBe(scriptPath);
  });
});
