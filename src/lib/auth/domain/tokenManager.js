'use client';

class TokenManager {
  constructor() {
    // Initialize variables for token management
    this.refreshTokenKey = 'google-refresh-token';
    this.accessTokenKey = 'google-access-token';
    this.tokenExpiryKey = 'google-token-expiry';
    
    // Default token refresh buffer (5 minutes before expiry)
    this.refreshBuffer = 5 * 60 * 1000;
    
    // Token refresh is in progress flag
    this.isRefreshing = false;
    
    // Queue of functions waiting for token refresh
    this.refreshQueue = [];
    
    // Periodic refresh timer
    this.refreshTimer = null;
    
    // Start periodic refresh checking
    this.startPeriodicRefresh();
  }

  // Start periodic token refresh checking
  startPeriodicRefresh() {
    if (typeof window === 'undefined') return;
    
    // Check every minute
    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken();
    }, 60 * 1000);
  }

  // Stop periodic refresh checking
  stopPeriodicRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Check if token needs refresh and refresh if necessary
  async checkAndRefreshToken() {
    if (this.isTokenExpired() && this.getRefreshToken()) {
      console.log('Token expired, refreshing...');
      await this.refreshToken();
    }
  }

  // Store token data including expiry time
  storeTokenData(accessToken, refreshToken, expiresIn) {
    if (typeof window === 'undefined') return;
    
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.accessTokenKey, accessToken);
    
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    
    // Restart periodic refresh when new tokens are stored
    this.stopPeriodicRefresh();
    this.startPeriodicRefresh();
  }

  // Get the current access token
  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.accessTokenKey);
  }

  // Get the refresh token
  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Get token expiry time
  getTokenExpiry() {
    if (typeof window === 'undefined') return 0;
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    return expiry ? parseInt(expiry, 10) : 0;
  }

  // Check if token is expired or will expire soon
  isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    // Check if token is expired or will expire within the buffer time
    return Date.now() + this.refreshBuffer >= expiry;
  }

  // Clear all token data
  clearTokens() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    
    // Stop periodic refresh when tokens are cleared
    this.stopPeriodicRefresh();
  }

  // Get a valid token, refreshing if necessary
  async getValidToken() {
    if (!this.isTokenExpired()) {
      return this.getAccessToken();
    }
    
    return this.refreshToken();
  }

  // Refresh the access token using the refresh token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }
    
    // If already refreshing, wait for it to complete
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }
    
    this.isRefreshing = true;
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const { accessToken, expiresIn } = await response.json();
      
      // Store the new token data
      this.storeTokenData(accessToken, null, expiresIn);
      
      // Resolve all pending promises
      this.refreshQueue.forEach(resolve => resolve(accessToken));
      this.refreshQueue = [];
      
      console.log('Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.clearTokens();
      
      // Reject all pending promises
      this.refreshQueue.forEach(resolve => resolve(null));
      this.refreshQueue = [];
      
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }
}

export const tokenManager = new TokenManager(); 