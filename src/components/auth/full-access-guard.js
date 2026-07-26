'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useHasFullAccess } from '@/hooks/use-permissions';

function isSettingsPath(pathname) {
  return typeof pathname === 'string' && (pathname === '/settings' || pathname.startsWith('/settings/'));
}

export function FullAccessGuard({ children }) {
  const pathname = usePathname();
  const hasFullAccess = useHasFullAccess();

  if (hasFullAccess || isSettingsPath(pathname)) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 640, mx: 'auto', width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4">Not authorized</Typography>
        <Alert severity="warning">
          You are signed in, but your account is not a member of the access group for this
          environment. You can open Settings or log out. Contact an administrator to request
          access.
        </Alert>
      </Stack>
    </Box>
  );
}
