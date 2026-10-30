import { pathToFileURL } from 'node:url';

/**
 * Arguments for `node --import <loader> <script>`.
 *
 * On Windows the ESM loader rejects a raw absolute path such as `C:\...`
 * passed to `--import` (ERR_UNSUPPORTED_ESM_URL_SCHEME, protocol `c:`).
 * A file URL is a valid specifier on Windows and Linux.
 *
 * The entry script stays a filesystem path. Node accepts that as the
 * program argument on both platforms. Passing it as a file URL makes the
 * custom resolve hook treat the URL as a relative specifier and join it
 * onto the working directory.
 */
export function nodeEsmInvokeArgs(loaderPath, scriptPath) {
  return ['--import', pathToFileURL(loaderPath).href, scriptPath];
}
