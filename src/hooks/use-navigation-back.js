import * as React from 'react';
import { useRouter } from 'next/navigation';

import { paths } from '@/paths';

/**
 * Custom hook for handling back navigation with fallback to search page
 * Uses the browser's native back button
 * @param {Object} options - Configuration options (for future extensibility)
 * @returns {Function} handleGoBack - Function to call when navigating back
 */
export function useNavigationBack(options = {}) {
  const router = useRouter();

  const handleGoBack = React.useCallback(() => {
    // Check if we can go back in browser history
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Use window.history.back() instead of router.back() for more reliable behavior
      window.history.back();
    } else {
      // Fallback to search page if no history
      router.push(paths.main.search.list);
    }
  }, [router]);

  return handleGoBack;
}
