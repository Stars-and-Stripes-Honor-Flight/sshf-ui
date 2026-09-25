export const REFRESH_COOKIE_NAME = 'sshf_refresh_token';

const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function refreshCookieOptions(maxAge = REFRESH_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge,
  };
}

export function setRefreshCookie(response, refreshToken) {
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

export function clearRefreshCookie(response) {
  response.cookies.set(REFRESH_COOKIE_NAME, '', refreshCookieOptions(0));
}

export function readRefreshCookie(request) {
  return request.cookies.get(REFRESH_COOKIE_NAME)?.value || '';
}
