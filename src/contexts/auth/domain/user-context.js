'use client';

import * as React from 'react';

import { api } from '@/lib/api';
import { authClient } from '@/lib/auth/domain/client';
import { logger } from '@/lib/default-logger';

export const UserContext = React.createContext(undefined);

function clearCachedSession() {
  localStorage.removeItem('user-data');
  localStorage.removeItem('flights-list');
}

export function UserProvider({ children }) {
  const [state, setState] = React.useState({
    user: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async () => {
    // Stay loading until the server lookup settles. Cached user-data is not a session.
    setState((prev) => ({
      ...prev,
      error: null,
      isLoading: true,
    }));

    try {
      const { data, error } = await authClient.getUser();

      if (error || !data) {
        if (error) {
          logger.error(error);
        }
        clearCachedSession();
        setState((prev) => ({
          ...prev,
          user: null,
          error: null,
          isLoading: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        user: data,
        error: null,
        isLoading: false,
      }));

      // Load flights into local storage only after authentication is confirmed and user data exists
      try {
        const existingFlights = localStorage.getItem('flights-list');
        if (!existingFlights && data.id) {
          const flights = await api.listFlights();
          localStorage.setItem('flights-list', JSON.stringify(flights));
        }
      } catch (err) {
        logger.error('Failed to load flights:', err);
        localStorage.removeItem('flights-list');
      }
    } catch (err) {
      logger.error(err);
      clearCachedSession();
      setState((prev) => ({
        ...prev,
        user: null,
        error: null,
        isLoading: false,
      }));
    }
  }, []);

  // Check session on mount
  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <UserContext.Provider value={{ ...state, checkSession }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;
