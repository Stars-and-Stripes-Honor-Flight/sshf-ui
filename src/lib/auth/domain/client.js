'use client';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI;

function generateToken() {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
};

class AuthClient {
  constructor() {
    this.googleAuthInitialized = false;
    this.tokenClient = null;
  }

  async initializeGoogleAuth() {
    if (typeof window === 'undefined' || this.googleAuthInitialized) return;
    
    // Load Google's OAuth2 library
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      document.head.appendChild(script);
    });

    // Initialize Google client only once
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: (response) => {
        if (response.access_token) {
          localStorage.setItem('google-access-token', response.access_token);
          // Instead of reloading, we'll let the component handle the success
          if (this.authCallback) {
            this.authCallback();
          }
        }
      },
    });

    this.googleAuthInitialized = true;
  }

  async signUp(_) {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
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

  async signInWithPassword(params) {
    const { email, password } = params;

    // Make API request

    // We do not handle the API, so we'll check if the credentials match with the hardcoded ones.
    if (email !== 'sofia@devias.io' || password !== 'Secret1') {
      return { error: 'Invalid credentials' };
    }

    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async resetPassword(_) {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_) {
    return { error: 'Update reset not implemented' };
  }

  async getUser() {
    const token = localStorage.getItem('google-access-token');

    if (!token) {
      return { data: null };
    }

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await response.json();
      const user = {
        id: userData.sub,
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        avatar: userData.picture,
      };

      // Store the user data in localStorage for immediate access
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
