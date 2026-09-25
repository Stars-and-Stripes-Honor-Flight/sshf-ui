import { NextResponse } from 'next/server';

import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from '@/lib/auth/refresh-cookie';

export async function POST(request) {
  const refreshToken = readRefreshCookie(request);

  if (!refreshToken) {
    const missing = NextResponse.json(
      { error: 'Refresh token is required' },
      { status: 400 }
    );
    clearRefreshCookie(missing);
    return missing;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed with status', response.status);
      const failed = NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: response.status }
      );
      clearRefreshCookie(failed);
      return failed;
    }

    const tokenData = await response.json();
    const result = NextResponse.json({
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
    });

    if (tokenData.refresh_token) {
      setRefreshCookie(result, tokenData.refresh_token);
    }

    return result;
  } catch {
    console.error('Token refresh error');
    const failed = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    clearRefreshCookie(failed);
    return failed;
  }
}
