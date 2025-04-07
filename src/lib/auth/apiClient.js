'use client';

import { tokenManager } from './domain/tokenManager';
import { toast } from '@/components/core/toaster';

class AuthApiClient {
  constructor() {
    // Server URL for authentication-related API endpoints
    this.baseUrl = '';
  }

  // Build headers with authentication
  async getHeaders() {
    const token = await tokenManager.getValidToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method with token refresh handling
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // Get headers with valid token
      const headers = await this.getHeaders();
      
      const config = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        // If unauthorized and we have a refresh token, try to refresh and retry
        if (response.status === 401 && tokenManager.getRefreshToken()) {
          const newToken = await tokenManager.refreshToken();
          
          // If token refresh successful, retry the request
          if (newToken) {
            config.headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, config);
            
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              throw new Error(errorData.message || `API request failed with status ${retryResponse.status}`);
            }
            
            return retryResponse;
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Get user profile data
  async getUserProfile() {
    try {
      const response = await this.request('/api/auth/profile', {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to fetch user profile: ${error.message}`);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(data) {
    try {
      const response = await this.request('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to update profile: ${error.message}`);
      throw error;
    }
  }

  // Sign out user
  async signOut() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
      tokenManager.clearTokens();
      localStorage.removeItem('user-data');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens anyway
      tokenManager.clearTokens();
      localStorage.removeItem('user-data');
    }
  }
}

export const authApi = new AuthApiClient(); 