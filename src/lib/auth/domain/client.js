'use client';

import { tokenManager } from './tokenManager';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function generateToken() {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

class AuthClient {
  constructor() {
    this.googleAuthInitialized = false;
    this.tokenClient = null;
  }

  async initializeGoogleAuth() {
    if (typeof window === 'undefined' || this.googleAuthInitialized) return;
    
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      document.head.appendChild(script);
    });

    // Initialize Google client with additional scopes for groups
    this.tokenClient = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: (response) => {
        if (response.code) {
          this.exchangeCodeForTokens(response.code);
        }
      },
      ux_mode: 'popup',
      access_type: 'offline',
      prompt: 'consent',
    });

    this.googleAuthInitialized = true;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code) {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const { accessToken, refreshToken, expiresIn } = await response.json();
      
      // Store tokens using the token manager
      tokenManager.storeTokenData(accessToken, refreshToken, expiresIn);
      
      if (this.authCallback) {
        this.authCallback();
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      if (this.authCallback) {
        this.authCallback(error);
      }
    }
  }

  async getGroupMemberships(userData) {
    try {
      // Get a valid token using token manager
      const token = await tokenManager.getValidToken();
      
      if (!token) {
        throw new Error('No valid token available');
      }
      
      // Fetch user's groups from Google Workspace Directory API
      const response = await fetch(
        `https://admin.googleapis.com/admin/directory/v1/groups?userKey=${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch group memberships');
      }

      const data = await response.json();
      return data.groups || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  async signInWithOAuth({ provider }) {
    if (provider !== 'google') {
      return { error: 'Unsupported provider' };
    }

    try {
      await this.initializeGoogleAuth();

      return new Promise((resolve) => {
        this.authCallback = async (error) => {
          if (error) {
            resolve({ error: error.message });
            return;
          }
          
          // Immediately fetch user info after getting token
          const { data } = await this.getUser();
          resolve({ data }); // Return the user data with the resolution
        };
        
        this.tokenClient.requestCode();
      });

    } catch (error) {
      console.error('Google Auth Error:', error);
      return { error: 'Failed to authenticate with Google' };
    }
  }

  async getUser() {
    // Get a valid token using token manager
    const token = await tokenManager.getValidToken();

    if (!token) {
      return { data: null };
    }

    try {
      // Fetch basic user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();

      const roles = [];

      // Check group memberships (preload roles)
      const ROLE_FULL_ACCESS = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
      //const ROLE_READ_ACCESS = "TBD";
      const possibleRoles = [ROLE_FULL_ACCESS];

      for (const role of possibleRoles) {
        // Call user/hasgroup endpoint on api to check authorization.
        const hasGroupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/hasgroup?groupEmail=${role}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!hasGroupResponse.ok) {
          continue;
        }

        const hasGroupData = await hasGroupResponse.json();
        if (hasGroupData.hasgroup) {
          roles.push({name: role, email: role});
        }
      }

      const user = {
        id: userData.sub,
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        avatar: userData.picture,
        roles: roles // Add roles to user data
      };

      // Store the complete user data
      localStorage.setItem('user-data', JSON.stringify(user));

      return { data: user };
    } catch (error) {
      console.error('Error fetching user:', error);
      tokenManager.clearTokens();
      localStorage.removeItem('user-data');
      return { data: null };
    }
  }

  async signOut() {
    tokenManager.clearTokens();
    localStorage.removeItem('user-data');
    return {};
  }
}

export const authClient = new AuthClient();
