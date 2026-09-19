'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/** Shared outer shell for scrollable list pages (activity, waitlist, search, flights). */
export const listPageContentSx = {
  maxWidth: 'var(--Content-maxWidth)',
  m: 'var(--Content-margin)',
  p: 'var(--Content-padding)',
  width: 'var(--Content-width)',
};

export function ListPageLayout({ title, description, children, headerActions = null }) {
  return (
    <Box sx={listPageContentSx}>
      <Stack spacing={4}>
        <Stack
          direction="row"
          spacing={3}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <Typography variant="h4">{title}</Typography>
            {description ? (
              <Typography color="textSecondary" sx={{ mt: 1 }} variant="body2">
                {description}
              </Typography>
            ) : null}
          </div>
          {headerActions}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}
