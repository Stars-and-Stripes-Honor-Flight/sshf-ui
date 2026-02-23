// API client for interacting with the backend API
import { toast } from '@/components/core/toaster';
import { tokenManager } from '@/lib/auth/domain/tokenManager';
import { paths } from '@/paths';

class ApiClient {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sshf-api-330507742215.us-central1.run.app';
  }

  // Handle unauthorized errors by clearing tokens and redirecting to login
  handleUnauthorized() {
    try {
      tokenManager.clearTokens();
      // Clear user and flights data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-data');
        localStorage.removeItem('flights-list');
        // Redirect to login page
        window.location.href = paths.auth.domain.signIn;
      }
    } catch (error) {
      console.error('Error handling unauthorized:', error);
    }
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
        if (response.status === 401) {
          const hasRefreshToken = tokenManager.getRefreshToken();
          
          if (hasRefreshToken) {
            const newToken = await tokenManager.refreshToken();
            
            // If token refresh successful, retry the request
            if (newToken) {
              config.headers['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, config);
              
              if (!retryResponse.ok) {
                // Still failing after refresh - handle as unauthorized
                this.handleUnauthorized();
                const errorData = await retryResponse.json().catch(() => ({}));
                const error = new Error(errorData.message || `API request failed with status ${retryResponse.status}`);
                error.status = retryResponse.status;
                throw error;
              }
              
              return retryResponse;
            }
          }
          
          // No refresh token or refresh failed - handle as unauthorized
          this.handleUnauthorized();
        }
        
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `API request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
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

  // Update a veteran's seat assignment
  async updateVeteranSeat(id, seat) {
    try {
      const response = await this.request(`/veterans/${id}/seat`, {
        method: 'PATCH',
        body: JSON.stringify({ value: seat }),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to update veteran seat: ${error.message}`);
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

  // Update a guardian's seat assignment
  async updateGuardianSeat(id, seat) {
    try {
      const response = await this.request(`/guardians/${id}/seat`, {
        method: 'PATCH',
        body: JSON.stringify({ value: seat }),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to update guardian seat: ${error.message}`);
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

  // Get flight details (with pairs, stats, etc.)
  async getFlightDetails(id) {
    try {
      const response = await this.request(`/flights/${id}/detail`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to fetch flight details: ${error.message}`);
      throw error;
    }
  }

  // Get flight assignments (veterans, guardians, counts)
  async getFlightAssignments(id) {
    try {
      const response = await this.request(`/flights/${id}/assignments`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to fetch flight assignments: ${error.message}`);
      throw error;
    }
  }

  // Add veterans from waitlist to flight
  async addVeteransToFlight(id, veteranCount) {
    try {
      const response = await this.request(`/flights/${id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ veteranCount }),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to add veterans to flight: ${error.message}`);
      throw error;
    }
  }

  // Fix bus mismatches for pairs in a flight
  async fixBusMismatches(id, fixes) {
    try {
      const response = await this.request(`/flights/${id}/fix-bus-mismatches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fixes }),
      });
      return await response.json();
    } catch (error) {
      toast.error(`Failed to fix bus mismatches: ${error.message}`);
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

<<<<<<< 92-recent-changes-ui
  // Get recent activity
  async getRecentActivity({ type = 'modified', offset = 0, limit = 20 } = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (type) queryParams.append('type', type);
      queryParams.append('offset', offset);
      queryParams.append('limit', limit);

      const response = await this.request(`/recent-activity?${queryParams.toString()}`, {
        method: 'GET',
      });

      return await response.json();
    } catch (error) {
      toast.error(`Failed to fetch recent activity: ${error.message}`);
=======
  // Export flight roster as CSV
  async exportFlightRoster(flightName = '', filter = 'All') {
    try {
      const queryParams = new URLSearchParams();
      if (flightName) queryParams.append('flightName', flightName);
      if (filter) queryParams.append('filter', filter);

      const response = await this.request(`/exports/flight?${queryParams.toString()}`, {
        method: 'GET',
      });

      // Return the response object so caller can handle blob download
      return response;
    } catch (error) {
      console.error(`Failed to export flight roster: ${error.message}`);
>>>>>>> main
      throw error;
    }
  }

<<<<<<< 92-recent-changes-ui
  // Get waitlist
  async getWaitlist({ type = 'veterans', offset = 0, limit = 20 } = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('type', type);
      queryParams.append('offset', offset);
      queryParams.append('limit', limit);

      const response = await this.request(`/waitlist?${queryParams.toString()}`, {
        method: 'GET',
      });

      const data = await response.json();
      
      // Transform the response to simplify fields for list display
      const transformedData = Array.isArray(data) ? data : (data.rows || []);
      
      return transformedData.map(entry => {
        // For guardians, combine notes.other and medical.experience
        // For veterans, combine call.notes and flight.status_note
        let prefs = '';
        if (type === 'guardians') {
          const notesOther = entry.notes?.other || '';
          const medicalExp = entry.medical?.experience || '';
          prefs = [notesOther, medicalExp].filter(Boolean).join(' | ');
        } else {
          const callNotes = entry.call?.notes || '';
          const statusNote = entry.flight?.status_note || '';
          prefs = [callNotes, statusNote].filter(Boolean).join(' | ');
        }

        // Format name: if nickname exists, use "Nickname: First Middle Last", otherwise just "First Middle Last"
        // For veterans, add vet_type in parentheses
        let formattedName = entry.name;
        if (typeof entry.name === 'object') {
          const fullName = `${entry.name?.first || ''} ${entry.name?.middle ? `${entry.name.middle} ` : ''}${entry.name?.last || ''}`.trim();
          if (entry.name?.nickname) {
            formattedName = `${entry.name.nickname}: ${fullName}`;
          } else {
            formattedName = fullName;
          }
        }
        
        // Add vet_type for veterans
        if (type === 'veterans' && entry.vet_type) {
          formattedName = `${formattedName} (${entry.vet_type})`;
        }

        // Calculate age from birth_date
        let age = null;
        if (entry.birth_date) {
          const birthDate = new Date(entry.birth_date);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          age = calculatedAge;
        }

        return {
          id: entry._id || entry.id,
          name: formattedName,
          age,
          city: entry.address?.city || '',
          appdate: entry.app_date || '',
          birth_date: entry.birth_date || '',
          prefs,
        };
      });
    } catch (error) {
      toast.error(`Failed to fetch waitlist: ${error.message}`);
=======
  // Export call center follow-up as CSV
  async exportCallCenterFollowup(flightName = '') {
    try {
      const queryParams = new URLSearchParams();
      if (flightName) queryParams.append('flightName', flightName);

      const response = await this.request(`/exports/callcenterfollowup?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error(`Failed to export call center follow-up: ${error.message}`);
      throw error;
    }
  }

  // Export tour lead as CSV
  async exportTourLead(flightName = '') {
    try {
      const queryParams = new URLSearchParams();
      if (flightName) queryParams.append('flightName', flightName);

      const response = await this.request(`/exports/tourlead?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error(`Failed to export tour lead: ${error.message}`);
>>>>>>> main
      throw error;
    }
  }
}

export const api = new ApiClient(); 