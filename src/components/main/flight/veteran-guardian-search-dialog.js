'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { logger } from '@/lib/default-logger';
import { api } from '@/lib/api';

/**
 * Veteran Guardian Search Dialog Component
 * Allows searching for and selecting guardians to pair with a veteran
 * This is the reverse of GuardianPairingDialog - we're adding guardians TO veterans
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onApply - Callback when guardian is selected (receives selected guardian object)
 * @param {Object} props.veteran - The veteran object to pair a guardian with
 * @param {Array} props.currentGuardian - Current guardian(s) if any
 */
export function VeteranGuardianSearchDialog({ 
  open, 
  onClose, 
  onApply,
  veteran,
  currentGuardian = null
}) {
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [selectedGuardian, setSelectedGuardian] = React.useState(null);
  const searchInputRef = React.useRef(null);
  
  // Focus search input when dialog opens
  React.useEffect(() => {
    if (open) {
      // Use a small delay to ensure the dialog is rendered
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          const input = searchInputRef.current.querySelector('input');
          if (input) {
            input.focus();
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform guardian search when debounced query changes
  React.useEffect(() => {
    if (!open) return;
    
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setSearchLoading(true);
      try {
        // Use the general search endpoint which searches for both veterans and guardians
        const response = await api.search({
          lastname: debouncedSearchQuery.trim(),
          limit: 25,
          status: 'Active'
        });

        // Extract rows from the response
        const allResults = response && response.rows ? response.rows : [];
        
        // Filter to only guardians (rows contain value property with the person data)
        const guardians = allResults.filter(row => {
          const value = row.value || {};
          return value.type === 'Guardian';
        });

        setSearchResults(guardians);
      } catch (error) {
        logger.error('Failed to search guardians:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, open]);

  // Handle guardian selection
  const handleGuardianSelect = React.useCallback((guardian) => {
    const guardianId = guardian.id || guardian.value?.id;
    setSelectedGuardian(guardianId === selectedGuardian ? null : guardian);
  }, [selectedGuardian]);

  // Handle applying selected guardian
  const handleApply = React.useCallback(() => {
    if (selectedGuardian) {
      onApply(selectedGuardian);
      onClose();
    }
  }, [selectedGuardian, onApply, onClose]);

  // Handle closing dialog
  const handleClose = React.useCallback(() => {
    setSearchQuery('');
    setSelectedGuardian(null);
    setSearchResults([]);
    onClose();
  }, [onClose]);

  const formatName = (guardianRow) => {
    // The search response has value property containing the person data
    const guardian = guardianRow.value || guardianRow;
    if (guardian.name) {
      return guardian.name;
    }
    return `${guardian.name_first || ''} ${guardian.name_last || ''}`.trim() || 'Unknown';
  };

  const getGuardianId = (guardianRow) => {
    return guardianRow.id || guardianRow.value?.id;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <DialogTitle>
        Add Guardian for {veteran?.name_first} {veteran?.name_last}
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
        <TextField
          ref={searchInputRef}
          fullWidth
          placeholder="Search by guardian last name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <MagnifyingGlass style={{ marginRight: 8 }} />,
          }}
          size="small"
          autoFocus
        />

        {searchLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
          <Alert severity="info">
            No guardians found matching "{searchQuery}"
          </Alert>
        )}

        {!searchLoading && searchResults.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Select a guardian:
            </Typography>
            <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {searchResults.map((guardianRow) => {
                const guardianId = getGuardianId(guardianRow);
                const guardianValue = guardianRow.value || guardianRow;
                return (
                  <ListItem
                    key={guardianId}
                    disablePadding
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedGuardian?.id === guardianId || selectedGuardian?.value?.id === guardianId}
                        onChange={() => handleGuardianSelect(guardianRow)}
                        inputProps={{ 'aria-labelledby': `guardian-${guardianId}` }}
                      />
                    }
                  >
                    <ListItemButton
                      onClick={() => handleGuardianSelect(guardianRow)}
                      sx={{ py: 1 }}
                    >
                      <ListItemText
                        primary={formatName(guardianRow)}
                        secondary={guardianValue.status || 'No status'}
                        id={`guardian-${guardianId}`}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {!searchLoading && !searchQuery.trim() && (
          <Alert severity="info">
            Start typing a guardian last name to search
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleApply} 
          variant="contained"
          disabled={!selectedGuardian || searchLoading}
        >
          Select Guardian
        </Button>
      </DialogActions>
    </Dialog>
  );
}
