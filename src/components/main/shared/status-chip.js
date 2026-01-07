'use client';

import * as React from 'react';
import Chip from '@mui/material/Chip';

export function StatusChip({ status, getStatusColor }) {
  if (!status) return null;
  
  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      sx={{
        borderRadius: 1,
        fontWeight: 'medium'
      }}
    />
  );
}

export function MedicalLevelChip({ level, getMedicalLevelColor }) {
  if (!level) return null;
  
  return (
    <Chip
      label={`Medical Level: ${level}`}
      color={getMedicalLevelColor(level)}
      size="small"
      sx={{
        borderRadius: 1,
        fontWeight: 'medium'
      }}
    />
  );
}

