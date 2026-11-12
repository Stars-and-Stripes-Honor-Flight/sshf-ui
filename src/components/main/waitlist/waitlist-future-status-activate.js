'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { api } from '@/lib/api';
import { toast } from '@/components/core/toaster';
import { toastActivateFutureStatusResult } from '@/lib/flight-status-bulk-toast';

const FUTURE_STATUSES = ['Future-Spring', 'Future-Fall', 'Future-PostRestriction'];

export function WaitlistFutureStatusActivate({ onActivated }) {
  const [futureStatus, setFutureStatus] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activating, setActivating] = React.useState(false);

  const handleConfirmActivate = async () => {
    try {
      setActivating(true);
      const result = await api.activateFutureStatus(futureStatus);
      if (result.status === 200 || result.status === 207) {
        await onActivated();
        setDialogOpen(false);
        toastActivateFutureStatusResult(result.status, result.body);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to activate future status.');
    } finally {
      setActivating(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl required sx={{ minWidth: 220 }}>
          <InputLabel id="waitlist-future-status-label">Future status</InputLabel>
          <Select
            labelId="waitlist-future-status-label"
            value={futureStatus}
            label="Future status"
            required
            onChange={(event) => setFutureStatus(event.target.value)}
          >
            {FUTURE_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          disabled={!futureStatus}
          onClick={() => setDialogOpen(true)}
        >
          Activate
        </Button>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => !activating && setDialogOpen(false)}>
        <DialogTitle>Activate Future status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ pt: 1 }}>
            Change all people with status <strong>{futureStatus}</strong> to Active?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={activating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmActivate} disabled={activating}>
            {activating ? 'Activating…' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
