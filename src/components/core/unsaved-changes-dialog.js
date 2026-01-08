'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { Warning } from '@phosphor-icons/react';

export function UnsavedChangesDialog({ open, onClose, onDiscard, entityType = 'record' }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Warning size={24} weight="bold" color="var(--mui-palette-warning-main)" />
        Unsaved Changes
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You have unsaved changes to this {entityType}. Are you sure you want to leave without saving?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your changes will be lost if you continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onDiscard} variant="contained" color="error">
          Discard Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
