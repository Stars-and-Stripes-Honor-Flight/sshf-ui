'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { PasswordForm } from '@/components/main/settings/password-form';

export default function Page() {
  React.useEffect(() => {
    document.title = `Security | ${config.site.name}`;
  }, []);

  return (
    <Stack spacing={4}>
      <div>
        <Typography variant="h4">Security</Typography>
      </div>
      <Stack spacing={4}>
        <PasswordForm />
      </Stack>
    </Stack>
  );
}
