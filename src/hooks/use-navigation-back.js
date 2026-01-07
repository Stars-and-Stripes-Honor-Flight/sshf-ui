import * as React from 'react';
import { useRouter } from 'next/navigation';

import { paths } from '@/paths';
import { 
  getPreviousNavigationEntry, 
  popNavigationEntry 
} from '@/lib/navigation-stack';

/**
 * Custom hook for handling back navigation with fallback to search page
 * @param {Object} options - Configuration options
 * @param {Object} options.scrollConfig - Configuration for scroll behavior when navigating back
 * @param {string} options.scrollConfig.fromPage - The page we're coming from (e.g., 'guardian-details', 'veteran-details')
 * @param {string} options.scrollConfig.toSection - The section ID to scroll to when returning
 * @returns {Function} handleGoBack - Function to call when navigating back
 */
export function useNavigationBack(options = {}) {
  const router = useRouter();
  const { scrollConfig } = options;

  const handleGoBack = React.useCallback(() => {
    const previousEntry = getPreviousNavigationEntry();

    // Handle scroll configuration if provided
    if (scrollConfig?.fromPage && scrollConfig?.toSection) {
      if (previousEntry?.type === scrollConfig.fromPage) {
        sessionStorage.setItem('scrollToSection', scrollConfig.toSection);
        // Pop current entry (we're leaving it) and navigate to previous
        popNavigationEntry(); // Remove current page from stack
        if (previousEntry?.url) {
          router.push(previousEntry.url);
          return;
        }
        // Fallback to browser back
        if (window.history.length > 1) {
          router.back();
          return;
        }
      }
    } else if (previousEntry) {
      // Pop current entry (we're leaving it) and navigate to previous
      popNavigationEntry(); // Remove current page from stack
      if (previousEntry?.url) {
        router.push(previousEntry.url);
        return;
      }
    }

    // Fallback to search page if no previous entry or unknown previous page
    // This handles the case when someone navigates directly to the edit page
    router.push(paths.main.search.list);
  }, [router, scrollConfig]);

  return handleGoBack;
}

