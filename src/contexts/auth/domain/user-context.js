'use client';

import * as React from 'react';
import { authClient } from '@/lib/auth/domain/client';
import { logger } from '@/lib/default-logger';
import { api } from '@/lib/api';

export const UserContext = React.createContext(undefined);

export function UserProvider({ children }) {
  const [state, setState] = React.useState({
    user: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async () => {
    try {
      // First check localStorage for existing user data
      const cachedUser = localStorage.getItem('user-data');
      if (cachedUser) {
        setState(prev => ({ 
          ...prev, 
          user: JSON.parse(cachedUser), 
          error: null, 
          isLoading: false 
        }));
      }

      // Then verify with server
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        // Clear flights if there's an authentication error
        localStorage.removeItem('flights-list');
        setState(prev => ({ 
          ...prev, 
          user: null, 
          error: 'Something went wrong', 
          isLoading: false 
        }));
        return;
      }

      // If no user data (logged out or no session), clear everything
      if (!data) {
        localStorage.removeItem('flights-list');
        setState(prev => ({ 
          ...prev, 
          user: null, 
          error: null, 
          isLoading: false 
        }));
        return;
      }

      // Only proceed with loading flights after successful authentication
      setState(prev => ({ 
        ...prev, 
        user: data, 
        error: null, 
        isLoading: false 
      }));

      // Load flights into local storage only after authentication is confirmed and user data exists
      try {
        const existingFlights = localStorage.getItem('flights-list');
        if (!existingFlights && data && data.id) {
          // Only attempt to load flights if we have valid user data
          const flights = await api.listFlights();
          localStorage.setItem('flights-list', JSON.stringify(flights));
        }
      } catch (err) {
        logger.error('Failed to load flights:', err);
        // Clear the flights cache if we got an auth error
        localStorage.removeItem('flights-list');
      }
    } catch (err) {
      logger.error(err);
      // Clear flights on any authentication error
      localStorage.removeItem('flights-list');
      setState(prev => ({ 
        ...prev, 
        user: null, 
        error: 'Something went wrong', 
        isLoading: false 
      }));
    }
  }, []);

  // Check session on mount
  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <UserContext.Provider value={{ ...state, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;
