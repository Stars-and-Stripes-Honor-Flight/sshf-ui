'use client';

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
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile https://www.googleapis.com/auth/admin.directory.group.readonly',
      callback: (response) => {
        if (response.access_token) {
          localStorage.setItem('google-access-token', response.access_token);
          if (this.authCallback) {
            this.authCallback();
          }
        }
      },
    });

    this.googleAuthInitialized = true;
  }

  async getGroupMemberships(token, userData) {
    try {
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
        this.authCallback = async () => {
          // Immediately fetch user info after getting token
          const { data } = await this.getUser();
          resolve({ data }); // Return the user data with the resolution
        };
        
        this.tokenClient.requestAccessToken();
      });

    } catch (error) {
      console.error('Google Auth Error:', error);
      return { error: 'Failed to authenticate with Google' };
    }
  }

  async getUser() {
    const token = localStorage.getItem('google-access-token');

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

      // Fetch group memberships
      const groups = await this.getGroupMemberships(token, userData);

      // Map groups to roles (customize this based on your needs)
      const roles = groups.map(group => ({
        id: group.id,
        name: group.name,
        email: group.email
      }));

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
      localStorage.removeItem('google-access-token');
      localStorage.removeItem('user-data');
      return { data: null };
    }
  }

  async signOut() {
    localStorage.removeItem('google-access-token');
    localStorage.removeItem('user-data');
    return {};
  }
}

export const authClient = new AuthClient();
