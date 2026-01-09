'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { 
  Users,
  X,
  MagnifyingGlass,
  CheckCircle,
  AirplaneTilt
} from '@phosphor-icons/react';

import { logger } from '@/lib/default-logger';
import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';
import { formatFlightNameForDisplay } from '@/lib/flights';

/**
 * Guardian Pairing Dialog Component
 * Handles veteran pairing management for guardians
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onApply - Callback when pairings are applied (receives selectedVeterans array)
 * @param {Array} props.currentPairings - Current pairings from the form
 * @param {string} props.preferenceNotes - Veteran preference notes to display
 */
export function GuardianPairingDialog({ 
  open, 
  onClose, 
  onApply,
  currentPairings = [],
  preferenceNotes = ''
}) {
  // Veteran search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [selectedVeterans, setSelectedVeterans] = React.useState([]);
  
  // Ref to track if we've auto-selected from sessionStorage
  const hasAutoSelectedRef = React.useRef(false);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform veteran search when debounced query changes
  React.useEffect(() => {
    if (!open) return;
    
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const results = await api.searchVeterans({
          lastname: debouncedSearchQuery.trim(),
          limit: 25,
          status: 'Active'
        });
        // Ensure results is an array
        const resultsArray = Array.isArray(results) ? results : (results?.rows || []);
        setSearchResults(resultsArray);
      } catch (error) {
        logger.error('Veteran search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, open]);

  // Initialize selected veterans from current pairings when dialog opens
  React.useEffect(() => {
    if (open) {
      // Capture currentPairings when dialog opens
      setSelectedVeterans([...currentPairings]);
      setSearchQuery('');
      setSearchResults([]);
      // Reset the auto-select flag when dialog opens so it can work again if needed
      hasAutoSelectedRef.current = false;
    }
  }, [open, currentPairings]);

  // Handle session storage veteranId for auto-selecting veteran
  React.useEffect(() => {
    if (typeof window === 'undefined' || !open) return;
    
    const veteranId = sessionStorage.getItem('pairingVeteranId');
    if (veteranId && !hasAutoSelectedRef.current) {
      // Mark that we're processing this veteranId to prevent duplicate runs
      hasAutoSelectedRef.current = true;
      
      // Fetch veteran details and add to selected
      api.getVeteran(veteranId)
        .then(veteran => {
          const veteranPairing = {
            id: veteran._id,
            name: `${veteran.name?.first || ''} ${veteran.name?.last || ''}`.trim()
          };
          
          // Check if veteran is already in pairings to prevent duplicates
          // Use a ref to get the latest currentPairings without adding it to deps
          const isAlreadyPaired = currentPairings.some(p => p.id === veteranPairing.id);
          
          if (!isAlreadyPaired) {
            const updatedPairings = [...currentPairings, veteranPairing];
            setSelectedVeterans(updatedPairings);
            
            // Show toast indicating veteran was auto-added
            toast.success(`Added ${veteranPairing.name} for pairing`);
          } else {
            // Veteran already in pairings, just update selectedVeterans to match
            setSelectedVeterans(currentPairings);
            toast.info(`${veteranPairing.name} is already paired with this guardian`);
          }
          
          // Remove veteranId from session storage after using it
          sessionStorage.removeItem('pairingVeteranId');
        })
        .catch(error => {
          logger.error('Failed to fetch veteran:', error);
          toast.error('Failed to load veteran');
          hasAutoSelectedRef.current = false; // Reset on error so user can try again
          // Remove veteranId from session storage on error too
          sessionStorage.removeItem('pairingVeteranId');
        });
    }
  }, [open, currentPairings]);

  // Handle veteran selection
  const handleVeteranSelect = React.useCallback(async (veteran) => {
    // Handle both API response formats: simplified search result or full veteran object
    const veteranId = veteran.id || veteran._id;
    let veteranName = veteran.name; // Search results have name as string
    
    // If name is an object (full veteran), construct the name
    if (!veteranName && veteran.name) {
      veteranName = `${veteran.name.first || ''} ${veteran.name.last || ''}`.trim();
    }
    
    // If we only have a simplified search result, fetch full details to get proper name
    if (veteranId && !veteranName) {
      try {
        const fullVeteran = await api.getVeteran(veteranId);
        veteranName = `${fullVeteran.name?.first || ''} ${fullVeteran.name?.last || ''}`.trim();
      } catch (error) {
        logger.error('Failed to fetch veteran details:', error);
        veteranName = veteran.name || 'Unknown Veteran';
      }
    }
    
    const veteranPairing = {
      id: veteranId,
      name: veteranName || 'Unknown Veteran'
    };
    
    // Check if already selected
    const isSelected = selectedVeterans.some(v => v.id === veteranPairing.id);
    
    if (isSelected) {
      // Remove from selection
      const updated = selectedVeterans.filter(v => v.id !== veteranPairing.id);
      setSelectedVeterans(updated);
    } else {
      // Add to selection
      const updated = [...selectedVeterans, veteranPairing];
      setSelectedVeterans(updated);
    }
  }, [selectedVeterans]);

  // Handle applying selected veterans
  const handleApply = React.useCallback(() => {
    onApply(selectedVeterans);
    onClose();
  }, [selectedVeterans, onApply, onClose]);

  // Handle closing dialog
  const handleClose = React.useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          <Users size={24} weight="bold" />
          Veteran Pairing Management
        </Box>
        <Box
          component="button"
          onClick={handleClose}
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
        <Stack spacing={3}>
          {/* Current Pairings Display */}
          <Box key="current-pairings-section">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight="medium" color="text.secondary">
                Veteran Preference Notes:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  flex: 1,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {preferenceNotes || 'No preference notes entered.'}
              </Typography>
            </Stack>
          </Box>

          {/* Search Input */}
          <Box key="search-section">
            <TextField
              fullWidth
              placeholder="Search veterans by last name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {searchLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <MagnifyingGlass size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <Box key="search-results" sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                <Stack spacing={1}>
                  {searchResults.map((veteran, index) => {
                    // Handle both API response formats: simplified search result or full veteran object
                    const veteranId = veteran.id || veteran._id;
                    const fullName = veteran.name || `${veteran.name?.first || ''} ${veteran.name?.last || ''}`.trim();
                    const isSelected = selectedVeterans.some(v => v.id === veteranId);
                    return (
                      <Card
                        key={veteranId || `veteran-${index}`}
                        variant="outlined"
                        onClick={() => handleVeteranSelect(veteran)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          backgroundColor: isSelected ? 'primary.lighter' : 'background.paper',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <CardContent sx={{ py: 0.75, px: 1.5, '&:last-child': { pb: 0.75 } }}>
                          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium"
                                sx={{ 
                                  flex: '0 0 auto',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {fullName}
                              </Typography>
                              {veteran.city && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{
                                    flex: '0 0 auto',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {veteran.city}
                                </Typography>
                              )}
                              <Chip
                                icon={
                                  <AirplaneTilt 
                                    size={14}
                                    color={(veteran.flight && veteran.flight !== "None") ? "var(--mui-palette-success-main)" : "var(--mui-palette-warning-main)"} 
                                    weight="fill" 
                                  />
                                }
                                label={formatFlightNameForDisplay(veteran.flight || "None")}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  height: 24,
                                  fontSize: '0.75rem',
                                  flexShrink: 0,
                                  '& .MuiChip-icon': {
                                    marginLeft: '4px'
                                  }
                                }}
                              />
                            </Stack>
                            {isSelected ? (
                              <CheckCircle size={18} color="var(--mui-palette-primary-main)" weight="fill" />
                            ) : (
                              <Box sx={{ width: 18, height: 18, border: 1, borderColor: 'divider', borderRadius: '50%', flexShrink: 0 }} />
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}
            
            {searchQuery.trim().length >= 2 && !searchLoading && searchResults.length === 0 && (
              <Typography key="no-results" variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No veterans found matching "{searchQuery}"
              </Typography>
            )}
          </Box>

          <Divider key="divider-1" />

          {/* Selected Veterans */}
          <Box key="selected-veterans-section">
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Selected Veterans ({selectedVeterans.length})
            </Typography>
            {selectedVeterans.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedVeterans.map((veteran, index) => (
                  <Chip
                    key={veteran.id || `selected-veteran-${index}`}
                    label={veteran.name}
                    onDelete={() => {
                      const updated = selectedVeterans.filter(v => v.id !== veteran.id);
                      setSelectedVeterans(updated);
                    }}
                    deleteIcon={<X size={16} />}
                    color="primary"
                    variant="filled"
                    sx={{
                      height: 'auto',
                      '& .MuiChip-label': {
                        py: 0.5,
                        px: 1
                      },
                      '& .MuiChip-deleteIcon': {
                        fontSize: '1rem',
                        marginRight: '4px'
                      }
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No veterans selected. Search and select veterans to pair with this guardian.
              </Typography>
            )}
          </Box>

        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleApply} 
          variant="contained"
        >
          {selectedVeterans.length === 0 ? 'Remove All Pairings' : `Apply (${selectedVeterans.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
