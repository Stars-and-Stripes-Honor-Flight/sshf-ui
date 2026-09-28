'use client';

import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DynamicLogo } from '@/components/core/logo';

export function AuthProgress({ message = 'Loading…' }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={3} sx={{ py: 4, width: '100%' }}>
      <DynamicLogo colorDark="light" colorLight="dark" height={200} width={200} />
      <CircularProgress aria-label={message} />
      <Typography color="text.secondary" variant="body1">
        {message}
      </Typography>
    </Stack>
  );
}
