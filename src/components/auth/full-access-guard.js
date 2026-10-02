'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { requiredPermissionForPath } from '@/lib/auth/permissions';
import { useMembershipProbeFailed, usePermissions } from '@/hooks/use-permissions';

function isSettingsPath(pathname) {
  return typeof pathname === 'string' && (pathname === '/settings' || pathname.startsWith('/settings/'));
}

export function FullAccessGuard({ children }) {
  const pathname = usePathname();
  const { can, hasAccess } = usePermissions();
  const membershipProbeFailed = useMembershipProbeFailed();
  const permission = requiredPermissionForPath(pathname);

  if (isSettingsPath(pathname)) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  if (!membershipProbeFailed && (permission ? can(permission) : hasAccess)) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 640, mx: 'auto', width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4">Not authorized</Typography>
        <Alert severity="warning">
          {membershipProbeFailed
            ? 'Could not verify your permissions. Confirm the API is running, you are using http://localhost:3000, then sign in again.'
            : !hasAccess
              ? 'You are signed in, but your account does not have access to this environment. You can open Settings or log out. Contact an administrator to request access.'
              : `You do not have permission to view this page (${permission}). Use the navigation to open a section you can access.`}
        </Alert>
      </Stack>
    </Box>
  );
}
