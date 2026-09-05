'use client'

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { QueryView } from '@/components/main/query/query-view';
import { isAdhocQueryEnabled } from '@/lib/adhoc-query';

export default function Page() {
  if (!isAdhocQueryEnabled()) {
    return (
      <Box sx={{ p: 3, maxWidth: 640, mx: 'auto', width: '100%' }}>
        <Stack spacing={2}>
          <Typography variant="h4">Not available</Typography>
          <Alert severity="warning">
            Ad-hoc Query is not enabled in this environment.
          </Alert>
        </Stack>
      </Box>
    );
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
            <Typography variant="h4">Ad-hoc Query</Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }} variant="body2">
              Run CouchDB Mango queries and view results
            </Typography>
          </div>
        </Stack>
        <QueryView />
      </Stack>
    </Box>
  );
}
