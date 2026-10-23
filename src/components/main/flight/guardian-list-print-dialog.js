'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Printer as PrinterIcon } from '@phosphor-icons/react/dist/ssr/Printer';

import { toast } from '@/components/core/toaster';
import { LETTERS, selectGuardiansInLetterRange } from '@/components/main/flight/guardian-list-range';

export function GuardianListPrintDialog({ open, onClose, pairs, flightName, flightDate }) {
  const [fromLetter, setFromLetter] = React.useState('A');
  const [toLetter, setToLetter] = React.useState('Z');
  const [preparing, setPreparing] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setFromLetter('A');
    setToLetter('Z');
    setPreparing(false);
  }, [open]);

  const selection = selectGuardiansInLetterRange(pairs, fromLetter, toLetter);
  const inverted = selection.reason === 'inverted-range';
  const count = selection.guardians.length;
  const canPrint = selection.ok && count > 0 && !preparing;

  const handlePrint = async () => {
    if (!selection.ok || selection.guardians.length === 0 || preparing) return;

    const targetWindow = window.open('', '_blank');
    setPreparing(true);
    try {
      const { openGuardianListPdf } = await import('@/components/main/flight/guardian-list-pdf');
      await openGuardianListPdf({
        guardians: selection.guardians,
        flightName,
        flightDate,
        from: fromLetter,
        to: toLetter,
        printedAt: new Date(),
        targetWindow,
      });
    } catch (error) {
      if (targetWindow && !targetWindow.closed) targetWindow.close();
      console.error('Failed to prepare guardian list PDF:', error);
      toast.error('Could not prepare the guardian list. Please try again.');
    } finally {
      setPreparing(false);
    }
  };

  const countLabel = `${count} ${count === 1 ? 'guardian' : 'guardians'}`;
  const omitted = selection.omittedUnlettered;

  return (
    <Dialog open={open} onClose={() => !preparing && onClose()}>
      <DialogTitle>Print guardian list</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Includes every guardian on the flight. Roster filters are ignored.
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              size="small"
              label="From"
              value={fromLetter}
              onChange={(event) => setFromLetter(event.target.value)}
              fullWidth
              disabled={preparing}
            >
              {LETTERS.map((letter) => (
                <MenuItem key={`from-${letter}`} value={letter}>
                  {letter}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="To"
              value={toLetter}
              onChange={(event) => setToLetter(event.target.value)}
              fullWidth
              disabled={preparing}
            >
              {LETTERS.map((letter) => (
                <MenuItem key={`to-${letter}`} value={letter}>
                  {letter}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {inverted ? (
            <Typography variant="body2" color="error">
              From is after To.
            </Typography>
          ) : (
            <Typography variant="body2">{countLabel}</Typography>
          )}
          {!inverted && count === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No guardians in this range.
            </Typography>
          ) : null}
          {!inverted && omitted > 0 ? (
            <Typography variant="body2" color="text.secondary">
              {omitted} {omitted === 1 ? 'guardian has' : 'guardians have'} no A–Z last name and{' '}
              {omitted === 1 ? 'is' : 'are'} not on this list.
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={preparing}>
          Cancel
        </Button>
        <Button onClick={handlePrint} variant="contained" disabled={!canPrint}>
          {preparing ? 'Preparing…' : 'Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function GuardianListPrintButton({ pairs, flightName, flightDate }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)} startIcon={<PrinterIcon size={16} />}>
        Print guardian list
      </Button>
      <GuardianListPrintDialog
        open={open}
        onClose={() => setOpen(false)}
        pairs={pairs}
        flightName={flightName}
        flightDate={flightDate}
      />
    </>
  );
}
