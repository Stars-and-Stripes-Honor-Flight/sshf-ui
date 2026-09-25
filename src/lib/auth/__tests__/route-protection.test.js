/**
 * @jest-environment node
 *
 * Page auth is client-side. Next.js middleware is not used.
 * This inventory is the check that middleware runs on no paths, and that the
 * pages under src/app/(main) are the protected routes AuthGuard covers.
 * `(main)` is a route group: it does not add a /main URL prefix.
 */

import fs from 'fs';
import path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const MIDDLEWARE_CANDIDATES = [
  path.join(process.cwd(), 'src', 'middleware.js'),
  path.join(process.cwd(), 'src', 'middleware.ts'),
  path.join(process.cwd(), 'middleware.js'),
  path.join(process.cwd(), 'middleware.ts'),
];

const PROTECTED_PATHS = [
  '/',
  '/activity',
  '/exports/callcenterfollowup',
  '/exports/flight',
  '/exports/tourlead',
  '/flights',
  '/flights/create',
  '/flights/details',
  '/guardians',
  '/guardians/create',
  '/guardians/details',
  '/review/applications',
  '/review/applications/detail',
  '/search',
  '/search-flights',
  '/settings/account',
  '/settings/team',
  '/tools/query',
  '/veterans',
  '/veterans/create',
  '/veterans/details',
  '/waitlist',
];

const PUBLIC_PATHS = [
  '/auth/domain/sign-in',
  '/debug/navigation-logs',
  '/errors/internal-server-error',
  '/errors/not-authorized',
  '/errors/not-found',
];

function listPageFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'api' || entry.name === '__tests__') {
        continue;
      }
      files.push(...listPageFiles(fullPath));
      continue;
    }

    if (/^page\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function pageUrl(pageFile) {
  const relativeDir = path.relative(APP_DIR, path.dirname(pageFile));
  const segments = relativeDir
    .split(path.sep)
    .filter((segment) => segment && segment !== '.' && !(segment.startsWith('(') && segment.endsWith(')')));

  return `/${segments.join('/')}` || '/';
}

function isUnderMainGroup(pageFile) {
  const relative = path.relative(APP_DIR, pageFile);
  return relative.split(path.sep)[0] === '(main)';
}

function matchesRemovedMainOrAuthMatcher(urlPath) {
  return urlPath === '/main' || urlPath.startsWith('/main/') || urlPath === '/auth' || urlPath.startsWith('/auth/');
}

describe('client route protection', () => {
  const pageFiles = listPageFiles(APP_DIR);
  const protectedPaths = pageFiles.filter(isUnderMainGroup).map(pageUrl).sort();
  const publicPaths = pageFiles
    .filter((pageFile) => !isUnderMainGroup(pageFile))
    .map(pageUrl)
    .sort();

  test('middleware runs on no paths', () => {
    const present = MIDDLEWARE_CANDIDATES.filter((candidate) => fs.existsSync(candidate));

    expect(present).toEqual([]);
  });

  test('protected paths are the (main) pages and have no /main URL prefix', () => {
    expect(protectedPaths).toEqual([...PROTECTED_PATHS].sort());
    expect(protectedPaths.some((urlPath) => urlPath === '/main' || urlPath.startsWith('/main/'))).toBe(false);
    expect(protectedPaths.filter(matchesRemovedMainOrAuthMatcher)).toEqual([]);
  });

  test('public pages are the routes outside the (main) group', () => {
    expect(publicPaths).toEqual([...PUBLIC_PATHS].sort());
    expect(publicPaths).toContain('/auth/domain/sign-in');
  });

  test('the (main) layout redirects unauthenticated visitors through AuthGuard', () => {
    const layout = fs.readFileSync(path.join(APP_DIR, '(main)', 'layout.js'), 'utf8');

    expect(layout).toContain("import { AuthGuard } from '@/components/auth/auth-guard'");
    expect(layout).toContain('<AuthGuard>');
    expect(layout).toContain('</AuthGuard>');
  });
});
