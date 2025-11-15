'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Clock, X } from '@phosphor-icons/react';

export const HistoryDialog = ({ open, onClose, history, title }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
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
          justifyContent: 'space-between',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Clock size={24} weight="bold" />
          {title} History
        </Box>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary'
            },
            transition: 'color 0.2s'
          }}
          aria-label="Close"
        >
          <X size={24} weight="bold" />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {!history || history.length === 0 ? (
          <Box 
            sx={{
              py: 4,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Clock size={48} weight="light" style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography>No history records available</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((entry, idx) => {
                  // Handle guardian format: { id, change }
                  if (entry.change) {
                    return (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ maxWidth: 150 }}>
                          {entry.id ? new Date(entry.id).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {entry.change}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  // Handle veteran format: { timestamp, user, action, details }
                  return (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ maxWidth: 150 }}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {entry.details || entry.changes || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};
