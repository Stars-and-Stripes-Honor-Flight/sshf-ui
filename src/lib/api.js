// API client for interacting with the backend API
import { toast } from '@/components/core/toaster';
import { tokenManager } from '@/lib/auth/domain/tokenManager';

class ApiClient {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sshf-api-330507742215.us-central1.run.app';
  }

  // Get the authentication token using token manager
  async getToken() {
    if (typeof window !== 'undefined') {
      return await tokenManager.getValidToken();
    }
    return null;
  }

  // Build headers with authentication
  async getHeaders() {
    const token = await this.getToken();
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

  // Search for veterans and guardians
  async search({ limit = 25, lastname = '', status = 'Active', flight = 'All' }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (limit) queryParams.append('limit', limit);
      if (lastname) queryParams.append('lastname', lastname);
      if (status) queryParams.append('status', status);
      if (flight && flight !== 'All') queryParams.append('flight', flight);

      const response = await this.request(`/search?${queryParams.toString()}`, {
        method: 'GET',
      });

      return await response.json();
    } catch (error) {
      toast.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  // Search for veterans specifically
  async searchVeterans({ limit = 25, lastname = '', status = 'Active' } = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (limit) queryParams.append('limit', limit);
      if (lastname) queryParams.append('lastname', lastname);
      if (status) queryParams.append('status', status);
      queryParams.append('type', 'Veteran'); // Filter to veterans only

      const response = await this.request(`/veterans/search?${queryParams.toString()}`, {
        method: 'GET',
      });

      const data = await response.json();
      // Handle response wrapping - if data has rows property, extract it
      return Array.isArray(data) ? data : (data.rows || data);
    } catch (error) {
      toast.error(`Veteran search failed: ${error.message}`);
      throw error;
    }
  }

  // Get a veteran by ID
  async getVeteran(id) {
    try {
      const response = await this.request(`/veterans/${id}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to fetch veteran: ${error.message}`);
      throw error;
    }
  }

  // Create a new veteran
  async createVeteran(data) {
    try {
      const response = await this.request('/veterans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to create veteran: ${error.message}`);
      throw error;
    }
  }

  // Update a veteran
  async updateVeteran(id, data) {
    try {
      const response = await this.request(`/veterans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to update veteran: ${error.message}`);
      throw error;
    }
  }

  // Delete a veteran
  async deleteVeteran(id) {
    try {
      const response = await this.request(`/veterans/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to delete veteran: ${error.message}`);
      throw error;
    }
  }

  // Get a guardian by ID
  async getGuardian(id) {
    try {
      const response = await this.request(`/guardians/${id}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to fetch guardian: ${error.message}`);
      throw error;
    }
  }

  // Create a new guardian
  async createGuardian(data) {
    try {
      const response = await this.request('/guardians', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to create guardian: ${error.message}`);
      throw error;
    }
  }

  // Update a guardian
  async updateGuardian(id, data) {
    try {
      const response = await this.request(`/guardians/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to update guardian: ${error.message}`);
      throw error;
    }
  }

  // Delete a guardian
  async deleteGuardian(id) {
    try {
      const response = await this.request(`/guardians/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to delete guardian: ${error.message}`);
      throw error;
    }
  }

  // Get a flight by ID
  async getFlight(id) {
    try {
      const response = await this.request(`/flights/${id}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to fetch flight: ${error.message}`);
      throw error;
    }
  }

  // Get all flights
  async listFlights() {
    try {
      const response = await this.request('/flights', {
        method: 'GET',
      });
      const data = await response.json();
      // Handle response wrapping - if data has rows property, extract it
      return Array.isArray(data) ? data : (data.rows || data);
    } catch (error) {
      toast.error(`Failed to fetch flights: ${error.message}`);
      throw error;
    }
  }

  // Create a new flight
  async createFlight(data) {
    try {
      const response = await this.request('/flights', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to create flight: ${error.message}`);
      throw error;
    }
  }

  // Update a flight
  async updateFlight(id, data) {
    try {
      const response = await this.request(`/flights/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to update flight: ${error.message}`);
      throw error;
    }
  }

  // Delete a flight
  async deleteFlight(id) {
    try {
      const response = await this.request(`/flights/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to delete flight: ${error.message}`);
      throw error;
    }
  }
}

export const api = new ApiClient(); 