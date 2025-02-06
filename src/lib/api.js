import { toast } from '@/components/core/toaster';

class Api {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
  }

  async call({ entity, urlParams }) {
    try {
      // Get the auth token
      const token = localStorage.getItem('google-access-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build the search URL
      const searchParams = new URLSearchParams();
      
      // Parse the OData parameters from urlParams
      if (urlParams) {
        const params = new URLSearchParams(urlParams);
        
        // Handle $top (limit)
        const top = params.get('$top');
        if (top) searchParams.set('limit', top);
        
        // Handle $skip (skip)
        const skip = params.get('$skip');
        if (skip) searchParams.set('skip', skip);
        
        // Handle $filter (search criteria)
        const filter = params.get('$filter');
        if (filter) {
          const filterParts = filter.split(' and ');
          filterParts.forEach(part => {
            if (part.includes('contains')) {
              // Parse contains(lastName, 'value') format
              const matches = part.match(/contains\((\w+),\s*'([^']+)'\)/);
              if (matches && matches[1] === 'lastName') {
                // Format startkey and endkey for CouchDB view
                const searchValue = matches[2].toLowerCase();
                searchParams.set('startkey', JSON.stringify(["Active", searchValue]));
                searchParams.set('endkey', JSON.stringify(["Active", searchValue + '\ufff0']));
              }
            } else if (part.includes(' eq ')) {
              // Parse property eq 'value' format
              const [prop, value] = part.split(' eq ');
              searchParams.set(prop, value.replace(/['"]/g, ''));
            }
          });
        }
        
        // Handle $count
        if (params.get('$count') === 'true') {
          searchParams.set('include_count', 'true');
        }
      }

      const url = `${this.baseURL}/search?${searchParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Get the raw response
      const rawData = await response.json();

      // Transform the response to match OData format expected by ApiTable
      return {
        status: "200",
        json: () => Promise.resolve({
          "@odata.count": rawData.total_rows || 0,
          value: rawData.rows.map(row => ({
            id: row.id,
            ...row.value
          }))
        })
      };

    } catch (error) {
      toast.error('API request failed');
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const api = new Api().call.bind(new Api());