'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from '@mui/material/Link';
import { pushNavigationEntry } from '@/lib/navigation-stack';

/**
 * Reusable navigation link component that tracks navigation in the stack
 * Use this instead of regular Link or router.push for detail pages
 * 
 * @param {Object} props
 * @param {string} props.href - URL to navigate to
 * @param {string} props.type - Page type: 'search', 'veteran-details', 'guardian-details'
 * @param {string} props.title - Display title for back navigation (e.g., "Back to Veteran Details")
 * @param {React.ReactNode} props.children - Link content
 * @param {Function} props.onClick - Optional click handler (called after navigation tracking)
 * @param {Object} props.sx - MUI sx props
 * @param {string} props.variant - MUI Link variant
 * @param {string} props.color - MUI Link color
 */
export function NavigationLink({
  href,
  type,
  title,
  children,
  onClick,
  sx,
  variant,
  color,
  ...other
}) {
  const router = useRouter();
  
  const handleClick = React.useCallback((event) => {
    // Track navigation in the stack
    if (typeof window !== 'undefined' && href) {
      const fullUrl = href.startsWith('http') ? href : window.location.origin + href;
      pushNavigationEntry({
        type,
        url: href,
        title: title || `Back to ${type}`,
      });
    }
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(event);
    }
    
    // Navigate
    if (href) {
      router.push(href);
    }
  }, [href, type, title, onClick, router]);
  
  return (
    <Link
      href={href}
      onClick={handleClick}
      sx={sx}
      variant={variant}
      color={color}
      {...other}
    >
      {children}
    </Link>
  );
}

/**
 * Navigation button component for programmatic navigation
 * Use this when you need to navigate programmatically (e.g., in onClick handlers)
 * 
 * @param {Object} props
 * @param {string} props.href - URL to navigate to
 * @param {string} props.type - Page type
 * @param {string} props.title - Display title for back navigation
 * @param {Function} props.onNavigate - Optional callback after navigation is tracked
 */
export function useNavigation() {
  const router = useRouter();
  
  const navigate = React.useCallback((href, type, title) => {
    if (typeof window !== 'undefined' && href) {
      pushNavigationEntry({
        type,
        url: href,
        title: title || `Back to ${type}`,
      });
    }
    router.push(href);
  }, [router]);
  
  return { navigate };
}

