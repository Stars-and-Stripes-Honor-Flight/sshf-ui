// API client for interacting with the backend API
import { toast } from '@/components/core/toaster';

class ApiClient {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sshf-api-330507742215.us-central1.run.app';
  }

  // Get the authentication token from local storage
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('google-access-token');
    }
    return null;
  }

  // Build headers with authentication
  getHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
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
}

export const api = new ApiClient(); 