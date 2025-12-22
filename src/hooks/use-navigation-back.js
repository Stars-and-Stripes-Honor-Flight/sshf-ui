import * as React from 'react';
import { useRouter } from 'next/navigation';

import { paths } from '@/paths';

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
    const previousPage = sessionStorage.getItem('previousPage');

    // Handle scroll configuration if provided
    if (scrollConfig?.fromPage && scrollConfig?.toSection) {
      if (previousPage === scrollConfig.fromPage) {
        sessionStorage.setItem('scrollToSection', scrollConfig.toSection);
        // If we came from a known page, try to go back
        if (window.history.length > 1) {
          router.back();
          return;
        }
      }
    } else {
      // If we came from a known page (like veteran-details or guardian-details), try to go back
      if (previousPage === 'veteran-details' || previousPage === 'guardian-details') {
        if (window.history.length > 1) {
          router.back();
          return;
        }
      }
    }

    // If we came from search, go back to search with preserved filters
    if (previousPage === 'search') {
      const searchUrl = sessionStorage.getItem('searchUrl');
      if (searchUrl) {
        router.push(searchUrl);
        return;
      }
      // Fallback to search page if no stored URL
      router.push(paths.main.search.list);
      return;
    }

    // Default to search page if no previous page or unknown previous page
    // This handles the case when someone navigates directly to the edit page
    router.push(paths.main.search.list);
  }, [router, scrollConfig]);

  return handleGoBack;
}

