/**
 * Get flights from local storage
 * Returns the cached flights list or an empty array if not available
 */
export const getFlights = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const flights = localStorage.getItem('flights-list');
    return flights ? JSON.parse(flights) : [];
  } catch (error) {
    console.error('Failed to parse flights from local storage:', error);
    return [];
  }
};

/**
 * Get a single flight by ID from session storage
 */
export const getFlightById = (id) => {
  const flights = getFlights();
  return flights.find(flight => flight._id === id);
};

/**
 * Get flights sorted by date (most recent first)
 */
export const getFlightsSorted = () => {
  const flights = getFlights();
  return [...flights].sort((a, b) => {
    return new Date(b.flight_date) - new Date(a.flight_date);
  });
};

/**
 * Clear flights from local storage
 * Useful for logout or refresh scenarios
 */
export const clearFlights = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('flights-list');
  }
};

/**
 * Refresh flights in local storage
 * Fetches fresh data from API
 */
export const refreshFlights = async () => {
  try {
    const { api } = await import('@/lib/api');
    const flights = await api.listFlights();
    localStorage.setItem('flights-list', JSON.stringify(flights));
    return flights;
  } catch (error) {
    console.error('Failed to refresh flights:', error);
    return getFlights();
  }
};
