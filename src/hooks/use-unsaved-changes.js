import * as React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook for handling unsaved changes on both app navigation and browser back
 */
export function useUnsavedChanges({ isDirty, onNavigate, entityType = 'record', interceptRouter = false }) {
  const router = useRouter();
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState(null);
  const [isFromBrowserBack, setIsFromBrowserBack] = React.useState(false);
  const historyStateRef = React.useRef(null);
  const isDiscardingRef = React.useRef(false); // Track if we're in the middle of discarding

  // For app navigation (buttons/links in the UI)
  const handleNavigation = React.useCallback(() => {
    if (isDirty) {
      setIsFromBrowserBack(false);
      setPendingNavigation(() => onNavigate);
      setUnsavedChangesDialogOpen(true);
    } else {
      onNavigate();
    }
  }, [isDirty, onNavigate]);

  // User clicked "Discard Changes"
  const handleDiscardChanges = React.useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    isDiscardingRef.current = true; // Mark that we're discarding
    
    if (isFromBrowserBack) {
      // We pushed state to prevent back, now we need to go back twice:
      // 1. First back undoes our pushState
      // 2. Second back goes to the actual previous page
      window.history.back();
      setTimeout(() => {
        window.history.back();
        // After navigation completes, reset the flag
        setTimeout(() => {
          isDiscardingRef.current = false;
        }, 100);
      }, 100);
    } else {
      // For app navigation, just call the pending navigation
      if (pendingNavigation) {
        pendingNavigation();
      }
      // Reset flag after navigation
      setTimeout(() => {
        isDiscardingRef.current = false;
      }, 100);
    }
    
    setPendingNavigation(null);
    setIsFromBrowserBack(false);
  }, [isFromBrowserBack, pendingNavigation]);

  // User closed dialog - stay on current page
  const handleCloseDialog = React.useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    setPendingNavigation(null);
    setIsFromBrowserBack(false);
  }, []);

  // Intercept browser back button
  React.useEffect(() => {
    if (!interceptRouter || typeof window === 'undefined') return;

    const handlePopState = () => {
      if (isDirty) {
        // User clicked browser back with unsaved changes
        // Push state to prevent the back from happening
        historyStateRef.current = history.length;
        window.history.pushState(null, '', window.location.href);
        
        // Show dialog
        setIsFromBrowserBack(true);
        setUnsavedChangesDialogOpen(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, interceptRouter]);

  // Warn on page unload (refresh, close tab) - but NOT if we're discarding
  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Don't show warning if we're in the middle of discarding changes
      if (isDirty && !isDiscardingRef.current) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return {
    handleNavigation,
    unsavedChangesDialogOpen,
    handleDiscardChanges,
    handleCloseDialog,
    entityType,
  };
}
