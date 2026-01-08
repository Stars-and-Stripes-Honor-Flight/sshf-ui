import { NextResponse } from 'next/server';

export async function middleware(req) {
  let res;

  res = NextResponse.next({ request: req });

  return res;
}

export const config = { matcher: ['/auth/:path*', '/main/:path*'] };
