'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Clock } from '@phosphor-icons/react';

export function HistoryButton({ 
  title, 
  history = [], 
  onOpenHistory,
  sx = {}
}) {
  return (
    <Button
      variant="outlined"
      size="small"
      onClick={() => onOpenHistory(title, history)}
      sx={{
        borderRadius: 1,
        textTransform: 'none',
        fontWeight: 'medium',
        minWidth: { xs: '40px', sm: 'auto' },
        padding: { xs: '6px', sm: '6px 8px' },
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: 0, sm: 0.5 },
        ...sx
      }}
    >
      <Clock size={18} weight="bold" sx={{ flexShrink: 0 }} />
      <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
        History ({history.length || 0})
      </Box>
    </Button>
  );
}
