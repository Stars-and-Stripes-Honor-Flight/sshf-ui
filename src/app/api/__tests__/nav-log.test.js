/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';

import { NextRequest } from 'next/server';

const ROUTE_FILE = path.join(process.cwd(), 'src/app/api/nav-log/route.js');
const LOG_FILE = path.join(process.cwd(), '.nav-logs.json');

function isMissingModule(error) {
  return (
    error?.code === 'MODULE_NOT_FOUND' ||
    error?.code === 'ERR_MODULE_NOT_FOUND' ||
    /Cannot find module|Cannot find package/i.test(String(error?.message || error))
  );
}

async function loadRoute() {
  try {
    return await import('../nav-log/route.js');
  } catch (error) {
    if (isMissingModule(error)) {
      return null;
    }
    throw error;
  }
}

describe('/api/nav-log', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
  });

  afterEach(() => {
    logSpy.mockRestore();
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
  });

  test('unauthenticated requests are rejected or the route is missing', async () => {
    const route = await loadRoute();

    if (!route) {
      expect(fs.existsSync(ROUTE_FILE)).toBe(false);
      expect(fs.existsSync(LOG_FILE)).toBe(false);
      expect(logSpy).not.toHaveBeenCalled();
      return;
    }

    const payload = {
      message: 'secret-nav-message',
      data: { token: 'should-not-log' },
      timestamp: '2026-09-25T00:00:00.000Z',
    };

    const postResponse = await route.POST(
      new NextRequest('http://localhost/api/nav-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    const postBody = await postResponse.json();

    expect(postResponse.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(postBody)).not.toMatch(/secret-nav-message|should-not-log|\.nav-logs|ENOENT/);
    expect(fs.existsSync(LOG_FILE)).toBe(false);

    const logged = logSpy.mock.calls.flat().map(String).join('\n');
    expect(logged).not.toContain('secret-nav-message');
    expect(logged).not.toContain('should-not-log');

    const getResponse = await route.GET(new NextRequest('http://localhost/api/nav-log', { method: 'GET' }));
    const getBody = await getResponse.json();
    expect(getResponse.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(getBody)).not.toMatch(/\.nav-logs|ENOENT/);

    const deleteResponse = await route.DELETE(new NextRequest('http://localhost/api/nav-log', { method: 'DELETE' }));
    const deleteBody = await deleteResponse.json();
    expect(deleteResponse.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(deleteBody)).not.toMatch(/\.nav-logs|ENOENT/);
    expect(fs.existsSync(LOG_FILE)).toBe(false);
  });
});
