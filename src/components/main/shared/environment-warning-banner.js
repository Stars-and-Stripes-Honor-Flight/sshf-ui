'use client';

import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Warning } from '@phosphor-icons/react';

export function EnvironmentWarningBanner({ label }) {
  if (!label) {
    return null;
  }

  return (
    <Box
      data-testid="environment-warning-banner"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 5, md: 3 },
        py: 1,
        backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.35),
        width: '100%',
        justifyContent: 'center',
        animation: 'envBannerPulse 2s ease-in-out infinite',
        '@keyframes envBannerPulse': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.4)',
          },
          '50%': {
            opacity: 0.95,
            boxShadow: '0 0 0 6px rgba(255, 152, 0, 0.1)',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          animation: 'envBannerWiggle 2s ease-in-out infinite',
          '@keyframes envBannerWiggle': {
            '0%, 100%': { transform: 'rotate(0deg)' },
            '25%': { transform: 'rotate(-10deg)' },
            '75%': { transform: 'rotate(10deg)' },
          },
        }}
      >
        <Warning
          weight="fill"
          size={20}
          style={{
            color: 'var(--mui-palette-warning-dark)',
          }}
        />
      </Box>
      <Box
        component="span"
        sx={{
          fontWeight: 'bold',
          fontSize: { xs: '0.7rem', md: '0.8rem' },
          color: 'warning.darker',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}
      >
        🧪 {label}
      </Box>
    </Box>
  );
}

/** Shared warning tint for surfaces that cover the main nav (e.g. edit-form sticky header). */
export function environmentStickySurfaceSx(showEnvironmentBanner) {
  if (!showEnvironmentBanner) {
    return {};
  }

  return {
    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.35),
    borderBottomColor: (theme) => alpha(theme.palette.warning.dark, 0.4),
  };
}
