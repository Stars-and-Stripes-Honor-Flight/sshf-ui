'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from '@mui/material/Link';

/**
 * Reusable navigation link component
 * Simply navigates without custom tracking (let browser handle history)
 * 
 * @param {Object} props
 * @param {string} props.href - URL to navigate to
 * @param {React.ReactNode} props.children - Link content
 * @param {Function} props.onClick - Optional click handler
 * @param {Object} props.sx - MUI sx props
 * @param {string} props.variant - MUI Link variant
 * @param {string} props.color - MUI Link color
 */
export function NavigationLink({
  href,
  children,
  onClick,
  sx,
  variant,
  color,
  ...other
}) {
  const router = useRouter();
  
  const handleClick = React.useCallback((event) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(event);
    }
    
    // Navigate
    if (href) {
      router.push(href);
    }
  }, [href, onClick, router]);
  
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
 * Navigation hook for programmatic navigation
 */
export function useNavigation() {
  const router = useRouter();
  
  const navigate = React.useCallback((href) => {
    if (href) {
      router.push(href);
    }
  }, [router]);
  
  return { navigate };
}
