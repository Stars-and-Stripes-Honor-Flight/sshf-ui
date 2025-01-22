import { NextResponse } from 'next/server';

export async function middleware(req) {
  let res;

  res = NextResponse.next({ headers: req.headers });

  return res;
}

export const config = { matcher: ['/auth/:path*', '/dashboard/:path*'] };
