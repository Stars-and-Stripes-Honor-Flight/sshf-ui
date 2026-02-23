'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { ActivityList } from '@/components/main/activity/activity-list';
import { usePermissions } from '@/hooks/use-permissions';

export default function Page() {
  const ROLE_FULL_ACCESS = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
  const { isInGroup } = usePermissions();

  if (!isInGroup(ROLE_FULL_ACCESS)) {
    return <div>Access Denied</div>;
  }

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Typography variant="h4">Recent Activity</Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }} variant="body2">
              View recent changes to veterans, guardians, flights, and calls
            </Typography>
          </div>
        </Stack>
        <Card>
          <ActivityList />
        </Card>
      </Stack>
    </Box>
  );
}
