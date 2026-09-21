'use client';

import Chip from '@mui/material/Chip';

const STATUS_COLORS = {
  New: 'info',
  Hold: 'warning',
  Accepted: 'success',
  Rejected: 'error',
  Trash: 'default',
};

export function ReviewStatusChip({ status }) {
  return (
    <Chip
      label={status || '—'}
      size="small"
      color={STATUS_COLORS[status] || 'default'}
      variant={status === 'Trash' ? 'outlined' : 'filled'}
    />
  );
}
