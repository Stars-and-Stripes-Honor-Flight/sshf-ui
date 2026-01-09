import * as React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for handling unsaved changes confirmation before navigation
 * @param {Object} options - Configuration options
 * @param {boolean} options.isDirty - Whether the form has unsaved changes
 * @param {Function} options.onNavigate - Function to call when navigation should proceed
 * @param {string} options.entityType - Type of entity being edited (e.g., 'guardian', 'veteran')
 * @param {boolean} options.interceptRouter - Whether to intercept Next.js router navigation (default: false)
 * @returns {Object} Object containing dialog state and navigation handler
 */
export function useUnsavedChanges({ isDirty, onNavigate, entityType = 'record', interceptRouter = false }) {
  const router = useRouter();
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState(null);
  const isNavigatingRef = React.useRef(false); // Flag to prevent popstate loop
  const isBrowserBackRef = React.useRef(false); // Flag to track if navigation is from browser back

  // Wrapper to check for unsaved changes before navigating
  const handleNavigation = React.useCallback(() => {
    if (isDirty) {
      setPendingNavigation(() => onNavigate);
      setUnsavedChangesDialogOpen(true);
    } else {
      onNavigate();
    }
  }, [isDirty, onNavigate]);

  // Handle discarding changes and navigating
  const handleDiscardChanges = React.useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    isNavigatingRef.current = true; // Set flag to prevent popstate from triggering again
    if (pendingNavigation) {
      // If this was triggered by browser back button, we need to go back twice
      // (once to undo our pushState, once to actually navigate)
      if (isBrowserBackRef.current) {
        // First, go back to undo our pushState
        window.history.back();
        // Then use the navigation handler to actually navigate
        setTimeout(() => {
          onNavigate();
          setPendingNavigation(null);
          isBrowserBackRef.current = false;
          // Reset flag after navigation
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 200);
        }, 50);
      } else {
        // For programmatic navigation, just call the pending function
        setTimeout(() => {
          pendingNavigation();
          setPendingNavigation(null);
          // Reset flag after a short delay to allow navigation to complete
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 100);
        }, 0);
      }
    }
  }, [pendingNavigation, onNavigate]);

  // Handle closing dialog without navigating
  const handleCloseDialog = React.useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    setPendingNavigation(null);
  }, []);

  // Handle browser back button via popstate
  React.useEffect(() => {
    if (!interceptRouter || typeof window === 'undefined') return;

    const handlePopState = (event) => {
      // Don't show dialog if we're already navigating (user clicked discard)
      if (isNavigatingRef.current) {
        return;
      }
      
      if (isDirty) {
        // Mark that this is a browser back navigation
        isBrowserBackRef.current = true;
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
        // Set pending navigation (will use router.back() in handleDiscardChanges)
        setPendingNavigation(() => () => {
          // This won't be called directly, handleDiscardChanges handles it
        });
        setUnsavedChangesDialogOpen(true);
      }
    };

    // Push initial state to enable popstate detection
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, interceptRouter]);

  // Handle browser back/refresh - warn on page unload
  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // For older browsers
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
