'use client';

class TokenManager {
  constructor() {
    this.refreshTokenKey = 'google-refresh-token';
    this.accessTokenKey = 'google-access-token';
    this.tokenExpiryKey = 'google-token-expiry';
    this.refreshSessionKey = 'google-has-refresh-session';

    // Refresh token 10 minutes before expiry
    this.refreshBuffer = 10 * 60 * 1000;

    this.isRefreshing = false;
    this.refreshQueue = [];
    this.refreshTimer = null;

    this.scrubReadableRefreshToken();
    this.startPeriodicRefresh();
  }

  scrubReadableRefreshToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }

  startPeriodicRefresh() {
    if (typeof window === 'undefined') return;

    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken();
    }, 30 * 1000);
  }

  stopPeriodicRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async checkAndRefreshToken() {
    if (this.isTokenExpired() && this.hasRefreshSession()) {
      console.log('Token expired, refreshing...');
      await this.refreshToken();
    }
  }

  // Access token and expiry stay in localStorage. The refresh token is an
  // httpOnly cookie set by /api/auth/token and is never written here.
  storeTokenData(accessToken, expiresIn, { hasRefreshSession } = {}) {
    if (typeof window === 'undefined') return;

    const expiryTime = Date.now() + (expiresIn * 1000);

    localStorage.setItem(this.accessTokenKey, accessToken);
    this.scrubReadableRefreshToken();
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());

    if (hasRefreshSession) {
      localStorage.setItem(this.refreshSessionKey, '1');
    }

    this.stopPeriodicRefresh();
    this.startPeriodicRefresh();
  }

  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.accessTokenKey);
  }

  // Refresh tokens are not readable from page script.
  getRefreshToken() {
    return null;
  }

  hasRefreshSession() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.refreshSessionKey) === '1';
  }

  getTokenExpiry() {
    if (typeof window === 'undefined') return 0;
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    return expiry ? parseInt(expiry, 10) : 0;
  }

  isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;

    return Date.now() + this.refreshBuffer >= expiry;
  }

  removeLocalCredentials() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem(this.refreshSessionKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    this.stopPeriodicRefresh();
  }

  async revokeRefreshSession() {
    if (typeof window === 'undefined') return;

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
      });
    } catch {
      console.error('Failed to clear refresh session');
    }
  }

  async clearTokens() {
    this.removeLocalCredentials();
    await this.revokeRefreshSession();
  }

  async getValidToken() {
    if (!this.isTokenExpired()) {
      return this.getAccessToken();
    }

    return this.refreshToken();
  }

  async refreshToken() {
    if (!this.hasRefreshSession()) {
      this.removeLocalCredentials();
      return null;
    }

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed with status ${response.status}`);
      }

      const { accessToken, expiresIn } = await response.json();

      if (!accessToken || !expiresIn) {
        throw new Error('Invalid token refresh response');
      }

      this.storeTokenData(accessToken, expiresIn);

      this.refreshQueue.forEach((resolve) => resolve(accessToken));
      this.refreshQueue = [];

      console.log('Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('Failed to refresh token');
      await this.clearTokens();

      this.refreshQueue.forEach((resolve) => resolve(null));
      this.refreshQueue = [];

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:tokenRefreshFailed'));
      }

      return null;
    } finally {
      this.isRefreshing = false;
    }
  }
}

export const tokenManager = new TokenManager();
