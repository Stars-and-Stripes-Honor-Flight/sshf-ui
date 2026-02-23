'use client';

import * as React from 'react';

const STORAGE_KEY = 'nav-items-state';

/**
 * Hook to manage persisted navigation item open/closed state
 * Stores state in localStorage so it persists across sessions
 * 
 * @param {string} itemKey - Unique identifier for the nav item
 * @param {boolean} defaultOpen - Default open state if not in storage
 * @returns {[boolean, (open: boolean) => void]} - [isOpen, setOpen]
 */
export function useNavItemsState(itemKey, defaultOpen = false) {
  const [isOpen, setIsOpenState] = React.useState(defaultOpen);
  const [isMounted, setIsMounted] = React.useState(false);

  // Load state from localStorage on mount (client-side only)
  React.useEffect(() => {
    setIsMounted(true);
    
    if (!itemKey) return;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const stateMap = JSON.parse(stored);
          if (itemKey in stateMap) {
            setIsOpenState(stateMap[itemKey]);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load nav items state from localStorage:', error);
    }
  }, [itemKey]);

  // Update state and persist to localStorage
  const setOpen = React.useCallback((newOpen) => {
    setIsOpenState(newOpen);
    
    if (!itemKey) return;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const stateMap = stored ? JSON.parse(stored) : {};
        stateMap[itemKey] = newOpen;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateMap));
      }
    } catch (error) {
      console.warn('Failed to persist nav items state to localStorage:', error);
    }
  }, [itemKey]);

  return [isOpen, setOpen];
}

