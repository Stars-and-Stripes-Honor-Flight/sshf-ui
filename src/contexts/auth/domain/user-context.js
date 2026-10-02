'use client';

import * as React from 'react';

import { api } from '@/lib/api';
import { authClient } from '@/lib/auth/domain/client';
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions';
import { onPermissionsStale } from '@/lib/auth/permissions-refresh';
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
        if (!existingFlights && data.id && hasPermission(data.permissions, PERMISSIONS.RECORDS_READ)) {
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

  const refreshPermissions = React.useCallback(async () => {
    try {
      const { data, error } = await authClient.getUser();
      if (error || !data) {
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
      }));
    } catch (err) {
      logger.error(err);
    }
  }, []);

  React.useEffect(() => {
    return onPermissionsStale(() => {
      refreshPermissions();
    });
  }, [refreshPermissions]);

  React.useEffect(() => {
    const expiresAt = state.user?.expiresAt;
    if (!expiresAt) {
      return undefined;
    }

    const ms = new Date(expiresAt).getTime() - Date.now();
    const delay = Number.isFinite(ms) ? Math.max(ms, 5000) : 5000;
    const id = setTimeout(() => {
      refreshPermissions();
    }, delay);
    return () => clearTimeout(id);
  }, [state.user?.expiresAt, refreshPermissions]);

  // Check session on mount
  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <UserContext.Provider value={{ ...state, checkSession }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;
