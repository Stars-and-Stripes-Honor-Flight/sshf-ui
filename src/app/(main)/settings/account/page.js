'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { AccountDetails } from '@/components/main/settings/account-details';

export default function Page() {
  React.useEffect(() => {
    document.title = `Account | ${config.site.name}`;
  }, []);

  return (
    <Stack spacing={4}>
      <div>
        <Typography variant="h4">Account</Typography>
      </div>
      <Stack spacing={4}>
        <AccountDetails />
      </Stack>
    </Stack>
  );
}
