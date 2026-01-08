'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function FormSectionHeader({ icon: Icon, title }) {
  return (
    <Stack 
      direction="row" 
      alignItems="center" 
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box
        sx={{
          backgroundColor: 'primary.main',
          width: 4,
          height: 24,
          borderRadius: 1
        }}
      />
      <Stack direction="row" spacing={1} alignItems="center">
        {Icon && (
          <Icon 
            size={24}
            weight="bold" 
            color="var(--mui-palette-primary-main)"
          />
        )}
        <Typography 
          variant="h6"
          sx={{ fontWeight: 'bold' }}
        >
          {title}
        </Typography>
      </Stack>
    </Stack>
  );
}

