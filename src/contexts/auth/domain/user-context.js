'use client';

import * as React from 'react';
import { authClient } from '@/lib/auth/domain/client';
import { logger } from '@/lib/default-logger';

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
        setState(prev => ({ 
          ...prev, 
          user: null, 
          error: 'Something went wrong', 
          isLoading: false 
        }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        user: data, 
        error: null, 
        isLoading: false 
      }));
    } catch (err) {
      logger.error(err);
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
