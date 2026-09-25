import { NextResponse } from 'next/server';

import { clearRefreshCookie } from '@/lib/auth/refresh-cookie';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearRefreshCookie(response);
  return response;
}
