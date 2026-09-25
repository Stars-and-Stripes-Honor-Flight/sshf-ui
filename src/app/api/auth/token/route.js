import { NextResponse } from 'next/server';

import { setRefreshCookie } from '@/lib/auth/refresh-cookie';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'postmessage',
      }),
    });

    if (!response.ok) {
      console.error('Token exchange failed with status', response.status);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code for tokens' },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    const refreshToken = tokenData.refresh_token || '';

    const result = NextResponse.json({
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
      hasRefreshSession: Boolean(refreshToken),
    });

    if (refreshToken) {
      setRefreshCookie(result, refreshToken);
    }

    return result;
  } catch {
    console.error('Token exchange error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
