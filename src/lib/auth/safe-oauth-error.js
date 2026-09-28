const SAFE_OAUTH_ERROR_CODE = /^[a-z_]{1,40}$/;
const MAX_ERROR_BODY_LENGTH = 8192;

/**
 * Read a failed Google token response and return a short reason safe to log.
 * Known OAuth error codes (for example invalid_grant) are kept. Descriptions,
 * HTML, and any other upstream payload are dropped.
 */
export async function readSafeOAuthErrorReason(response) {
  try {
    if (typeof response?.text !== 'function') {
      return 'upstream_error';
    }

    const text = await response.text();
    if (typeof text !== 'string' || text.length === 0 || text.length > MAX_ERROR_BODY_LENGTH) {
      return 'upstream_error';
    }

    const data = JSON.parse(text);
    const code = data?.error;
    if (typeof code === 'string' && SAFE_OAUTH_ERROR_CODE.test(code)) {
      return code;
    }
  } catch {
    // Unreadable or non-JSON upstream bodies stay out of logs.
  }

  return 'upstream_error';
}
