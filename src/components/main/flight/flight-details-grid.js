'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MuiLink from '@mui/material/Link';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUp as CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';
import { Car as CarIcon } from '@phosphor-icons/react/dist/ssr/Car';
import { Bus as BusIcon } from '@phosphor-icons/react/dist/ssr/Bus';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { Phone as PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { MedalMilitary as MedalMilitaryIcon } from '@phosphor-icons/react/dist/ssr/MedalMilitary';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';

import { toast } from '@/components/core/toaster';
import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { api } from '@/lib/api';
import { VeteranGuardianSearchDialog } from '@/components/main/flight/veteran-guardian-search-dialog';

// Helper component to render person name with status icons
function PersonDisplay({ person, type = 'Veteran' }) {
  if (!person) {
    return <Typography variant="body2" color="text.secondary">N/A</Typography>;
  }

  const detailUrl = type === 'Veteran'
    ? paths.main.veterans.details(person.id)
    : paths.main.guardians.details(person.id);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {type === 'Veteran' ? (
        <Tooltip title="Veteran">
          <span style={{ display: 'flex' }}>
            <MedalMilitaryIcon size={18} weight="fill" color="#b5ccf6" />
          </span>
        </Tooltip>
      ) : (
        <Tooltip title="Guardian">
          <span style={{ display: 'flex' }}>
            <UserIcon size={16} weight="regular" color="#ff9999" />
          </span>
        </Tooltip>
      )}
      <MuiLink
        component={Link}
        href={detailUrl}
        sx={{
          color: 'primary.main',
          textDecoration: 'none',
          cursor: 'pointer',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        {person.name_first} {person.name_last}
      </MuiLink>
      {!person.confirmed && (
        <Tooltip title="Not Confirmed - Needs to be called">
          <span style={{ display: 'flex' }}>
            <PhoneIcon size={16} weight="fill" color="red" />
          </span>
        </Tooltip>
      )}
      {person.confirmed && (
        <Tooltip title="Confirmed">
          <span style={{ display: 'flex' }}>
            <CheckCircleIcon size={16} weight="fill" color="green" />
          </span>
        </Tooltip>
      )}
      {person.nofly ? (
        <Tooltip title="No Fly: Yes - Ground transportation only">
          <span style={{ display: 'flex' }}>
            <CarIcon size={16} weight="fill" />
          </span>
        </Tooltip>
      ) : (
        <Tooltip title={type === 'Veteran' ? 'Flying' : 'No Fly: No - Can fly'}>
          <span style={{ display: 'flex' }}>
            <AirplaneTiltIcon size={16} weight="fill" />
          </span>
        </Tooltip>
      )}
    </Stack>
  );
}

// Component for editing a single field with save-on-blur
function EditableField({ value, onChange, onBlur, disabled, placeholder, size = 'small', maxWidth = 150 }) {
  const [localValue, setLocalValue] = React.useState(value);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = async () => {
    if (localValue !== value) {
      setIsSaving(true);
      try {
        await onBlur(localValue);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <TextField
      size={size}
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled || isSaving}
      variant="outlined"
      sx={{ maxWidth, position: 'relative' }}
      InputProps={{
        endAdornment: isSaving ? (
          <CircularProgress size={16} sx={{ mr: 1 }} />
        ) : null,
      }}
    />
  );
}

// Bus selector component - dropdown that looks like a chip
function BusSelector({ value, onChange, personId, personType, disabled = false }) {
  const buses = ['None', 'Alpha1', 'Alpha2', 'Alpha3', 'Alpha4', 'Alpha5', 'Bravo1', 'Bravo2', 'Bravo3', 'Bravo4', 'Bravo5'];
  const isNone = value === 'None' || !value;
  
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={value || 'None'}
        onChange={(e) => onChange(e.target.value, personId, personType)}
        disabled={disabled}
        renderValue={(selected) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', display: 'flex' }}>
            {isNone ? (
              <>
                <XIcon size={14} weight="bold" />
                <span>None</span>
              </>
            ) : (
              <>
                <BusIcon size={14} weight="fill" />
                <span>{selected}</span>
              </>
            )}
          </Stack>
        )}
        sx={{
          backgroundColor: isNone ? '#FCE4EC' : '#c8e6c9',
          color: isNone ? '#C2185B' : '#1b5e20',
          borderRadius: '16px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isNone ? '#C2185B' : '#4caf50'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isNone ? '#C2185B' : '#4caf50'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: isNone ? '#C2185B' : '#4caf50'
          }
        }}
      >
        {buses.map((bus) => (
          <MenuItem key={bus} value={bus}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {bus === 'None' ? (
                <>
                  <XIcon size={16} weight="bold" />
                  <span>{bus}</span>
                </>
              ) : (
                <>
                  <BusIcon size={16} weight="fill" />
                  <span>{bus}</span>
                </>
              )}
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// Stacked row component showing Veteran above Guardian with different background colors
function PairRowStacked({ pair, index, onUpdate, nameFilter, statusFilter, busFilter, onOpenPairingDialog }) {
  const [open, setOpen] = React.useState(false);
  const [localAssignedTo, setLocalAssignedTo] = React.useState(null);
  const veteran = pair.people.find(p => p.type === 'Veteran');
  const guardian = pair.people.find(p => p.type === 'Guardian');

  // Calculate pair background color (alternates for entire pair group)
  const pairBg = index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent';

  // Display the local value if being edited, otherwise show the saved value
  const displayAssignedTo = localAssignedTo !== null ? localAssignedTo : guardian?.call?.assigned_to;
  
  // Check if veteran and guardian have mismatched call assignments
  const veteranAssignedTo = veteran?.call?.assigned_to;
  const hasCallMismatch = guardian && veteranAssignedTo && displayAssignedTo && veteranAssignedTo !== displayAssignedTo;

  const handleSyncCallAssignment = async () => {
    // Sync guardian to veteran's call assignment
    if (veteran?.call?.assigned_to && guardian && onUpdate) {
      try {
        setLocalAssignedTo(veteran.call.assigned_to);
        await onUpdate(guardian.id, 'Guardian', { call: { assigned_to: veteran.call.assigned_to } });
        setLocalAssignedTo(null);
        toast.success('Call assignment synced');
      } catch (error) {
        setLocalAssignedTo(null);
        toast.error('Failed to sync call assignment');
      }
    }
  };

  const handleAssignedToCallChange = async (newValue) => {
    if (veteran && onUpdate) {
      try {
        // Update local state for immediate visual feedback
        setLocalAssignedTo(newValue);
        
        // Update the veteran
        await onUpdate(veteran.id, 'Veteran', { call: { assigned_to: newValue } });
        
        // Also update the paired guardian if one exists
        if (guardian) {
          await onUpdate(guardian.id, 'Guardian', { call: { assigned_to: newValue } });
        }
        
        // Clear local state after successful update
        setLocalAssignedTo(null);
        toast.success('Call assignment updated');
      } catch (error) {
        // Clear local state on error
        setLocalAssignedTo(null);
        toast.error('Failed to update call assignment');
      }
    }
  };

  const handleSeatChange = async (newValue, personId, personType) => {
    if (onUpdate) {
      try {
        await onUpdate(personId, personType, { flight: { seat: newValue } });
        toast.success('Seat updated');
      } catch (error) {
        toast.error('Failed to update seat');
      }
    }
  };

  const handleBusChange = async (newValue, personId, personType) => {
    if (onUpdate) {
      try {
        await onUpdate(personId, personType, { flight: { bus: newValue } });
        
        // If updating veteran's bus, also update guardian's bus
        if (personType === 'Veteran' && guardian && guardian.id) {
          await onUpdate(guardian.id, 'Guardian', { flight: { bus: newValue } });
          toast.success('Bus updated for both veteran and guardian');
        } else {
          toast.success('Bus updated');
        }
      } catch (error) {
        toast.error('Failed to update bus');
      }
    }
  };

  const handleAddGuardian = () => {
    // Open pairing dialog with the veteran pre-selected
    if (veteran) {
      onOpenPairingDialog(veteran);
    }
  };

  return (
    <>
      {/* Veteran Row */}
      <TableRow sx={{ backgroundColor: pairBg }}>
        <TableCell width={40} sx={{ borderBottom: 'none' }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <CaretUpIcon /> : <CaretDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell width={40} sx={{ textAlign: 'center', borderBottom: 'none' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {index + 1}
          </Typography>
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>
          <PersonDisplay person={veteran} type="Veteran" />
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>
          {veteran && (
            <EditableField
              value={veteran.seat || ''}
              onBlur={(newValue) => handleSeatChange(newValue, veteran.id, 'Veteran')}
              placeholder="e.g., A1"
              maxWidth={100}
            />
          )}
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>
          {veteran && (
            <BusSelector
              value={veteran.bus}
              onChange={handleBusChange}
              personId={veteran.id}
              personType="Veteran"
            />
          )}
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>
          {veteran && (
            <EditableField
              value={veteran.call?.assigned_to || ''}
              onBlur={handleAssignedToCallChange}
              placeholder="Assign to call"
              maxWidth={150}
            />
          )}
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>
          {pair.busMismatch && (
            <Chip label="Bus Mismatch" size="small" color="warning" variant="outlined" />
          )}
          {pair.missingPairedPerson && (
            <Chip label="Missing Person" size="small" color="error" variant="outlined" />
          )}
          {!pair.busMismatch && !pair.missingPairedPerson && (
            <Chip label="OK" size="small" color="success" variant="outlined" />
          )}
        </TableCell>
      </TableRow>

      {/* Guardian Row (if guardian exists) - same background as veteran */}
      {guardian && (
        <TableRow sx={{ backgroundColor: pairBg }}>
          <TableCell colSpan={1} sx={{ borderBottom: 'none' }} />
          <TableCell sx={{ borderBottom: 'none' }} />
          <TableCell sx={{ borderBottom: 'none' }}>
            <PersonDisplay person={guardian} type="Guardian" />
          </TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>
            {guardian && (
              <EditableField
                value={guardian.seat || ''}
                onBlur={(newValue) => handleSeatChange(newValue, guardian.id, 'Guardian')}
                placeholder="e.g., B1"
                maxWidth={100}
              />
            )}
          </TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>
            {guardian && (
              <Stack 
                direction="row" 
                spacing={0.5} 
                sx={{ 
                  alignItems: 'center', 
                  display: 'flex',
                  backgroundColor: guardian.bus === 'None' || !guardian.bus ? '#FCE4EC' : '#c8e6c9',
                  color: guardian.bus === 'None' || !guardian.bus ? '#C2185B' : '#1b5e20',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  width: 'fit-content'
                }}
              >
                {guardian.bus === 'None' || !guardian.bus ? (
                  <>
                    <XIcon size={14} weight="bold" />
                    <span>None</span>
                  </>
                ) : (
                  <>
                    <BusIcon size={14} weight="fill" />
                    <span>{guardian.bus}</span>
                  </>
                )}
              </Stack>
            )}
          </TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {displayAssignedTo && (
                <Chip
                  label={displayAssignedTo}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500, backgroundColor: hasCallMismatch ? '#fff3e0' : 'transparent' }}
                />
              )}
              {hasCallMismatch && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSyncCallAssignment}
                  sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  Sync
                </Button>
              )}
            </Stack>
          </TableCell>
          <TableCell sx={{ borderBottom: 'none' }} />
        </TableRow>
      )}

      {/* Add Guardian button row if no guardian */}
      {!guardian && (
        <TableRow sx={{ backgroundColor: pairBg }}>
          <TableCell colSpan={1} sx={{ borderBottom: 'none' }} />
          <TableCell sx={{ borderBottom: 'none' }} />
          <TableCell sx={{ borderBottom: 'none' }}>
            <Button
              startIcon={<PlusIcon size={16} />}
              size="small"
              variant="outlined"
              onClick={handleAddGuardian}
            >
              Add Guardian
            </Button>
          </TableCell>
          <TableCell colSpan={4} sx={{ borderBottom: 'none' }} />
        </TableRow>
      )}

      {/* Expandable Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          {open && (
            <Box sx={{ margin: 2 }}>
              <Stack spacing={2}>
                {veteran && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Veteran: {veteran.name_first} {veteran.name_last}
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">City</Typography>
                        <Typography variant="body2">{veteran.city}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Bus / Seat</Typography>
                        <Typography variant="body2">{veteran.bus} / {veteran.seat}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Shirt Size</Typography>
                        <Typography variant="body2">{veteran.shirt}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Med Limits</Typography>
                        <Typography variant="body2">{veteran.med_limits}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">No Fly</Typography>
                        <Typography variant="body2">{veteran.nofly ? 'Yes' : 'No'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Confirmed</Typography>
                        <Typography variant="body2">{veteran.confirmed ? 'Yes' : 'No'}</Typography>
                      </Box>
                      {veteran.group && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Group</Typography>
                          <Typography variant="body2">{veteran.group}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}
                {guardian && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Guardian: {guardian.name_first} {guardian.name_last}
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">City</Typography>
                        <Typography variant="body2">{guardian.city}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Bus / Seat</Typography>
                        <Typography variant="body2">{guardian.bus} / {guardian.seat}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Shirt Size</Typography>
                        <Typography variant="body2">{guardian.shirt}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Med Exp.</Typography>
                        <Typography variant="body2">{guardian.med_exprnc}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Training</Typography>
                        <Typography variant="body2">{guardian.training}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">No Fly</Typography>
                        <Typography variant="body2">{guardian.nofly ? 'Yes' : 'No'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Confirmed</Typography>
                        <Typography variant="body2">{guardian.confirmed ? 'Yes' : 'No'}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
                {pair.missingPairedPerson && !guardian && (
                  <Alert severity="warning">Guardian is missing for this pair</Alert>
                )}
                {pair.missingPairedPerson && !veteran && (
                  <Alert severity="warning">Veteran is missing for this pair</Alert>
                )}
              </Stack>
            </Box>
          )}
        </TableCell>
      </TableRow>
    </>
  );
}

// Main FlightDetailsGrid component
export function FlightDetailsGrid({ pairs, onUpdate, nameFilter, statusFilter, busFilter, onPairingComplete, flightId, flightName }) {
  const [pairingDialogOpen, setPairingDialogOpen] = React.useState(false);
  const [selectedVeteranForPairing, setSelectedVeteranForPairing] = React.useState(null);
  
  const filteredPairs = pairs.filter(pair => {
    // Name filter
    const veteran = pair.people.find(p => p.type === 'Veteran');
    const guardian = pair.people.find(p => p.type === 'Guardian');
    const fullNames = [
      veteran ? `${veteran.name_first} ${veteran.name_last}` : '',
      guardian ? `${guardian.name_first} ${guardian.name_last}` : '',
    ].join(' ').toLowerCase();
    
    if (nameFilter && !fullNames.includes(nameFilter.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter === 'ok' && (pair.busMismatch || pair.missingPairedPerson)) {
      return false;
    }
    if (statusFilter === 'issues') {
      const hasNoBus = pair.people.some(p => !p.bus || p.bus === 'None');
      if (!pair.busMismatch && !pair.missingPairedPerson && !hasNoBus) {
        return false;
      }
    }
    if (statusFilter === 'nofly') {
      const hasNoFly = pair.people.some(p => p.nofly);
      if (!hasNoFly) {
        return false;
      }
    }

    // Bus filter
    if (busFilter !== 'all') {
      const veteran = pair.people.find(p => p.type === 'Veteran');
      if (veteran?.bus !== busFilter) {
        return false;
      }
    }

    return true;
  });

  if (filteredPairs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No results found
        </Typography>
      </Box>
    );
  }


  return (
    <>
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
              <TableCell width={40} />
              <TableCell width={40} />
              <TableCell sx={{ fontWeight: 600 }}>Veteran/Guardian</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Seat</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bus</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assigned to Call</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPairs.map((pair, index) => (
              <PairRowStacked
                key={pair.pairId}
                pair={pair}
                index={index}
                onUpdate={onUpdate}
                nameFilter={nameFilter}
                statusFilter={statusFilter}
                busFilter={busFilter}
                onOpenPairingDialog={(veteran) => {
                  setSelectedVeteranForPairing(veteran);
                  setPairingDialogOpen(true);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Veteran Guardian Search Dialog */}
      <VeteranGuardianSearchDialog
        open={pairingDialogOpen}
        onClose={() => {
          setPairingDialogOpen(false);
          setSelectedVeteranForPairing(null);
        }}
        onApply={async (selectedGuardian) => {
          if (selectedVeteranForPairing && selectedGuardian) {
            try {
              // Get the guardian ID from the search result (which has id property)
              const guardianId = selectedGuardian.id;
              
              // Get the full guardian record
              const fullGuardian = await api.getGuardian(guardianId);
              
              // Build veteran pairing object
              const veteranPairing = {
                id: selectedVeteranForPairing.id,
                name: `${selectedVeteranForPairing.name_first} ${selectedVeteranForPairing.name_last}`.trim()
              };
              
              // Get the veteran's flight assignment to add the guardian to the same flight
              const veteranFlightId = selectedVeteranForPairing.flight?.id;
              
              // Update guardian's veteran.pairings array and flight assignment
              const updatedGuardian = {
                ...fullGuardian,
                veteran: {
                  ...fullGuardian.veteran,
                  pairings: [veteranPairing] // Set the veteran pairing
                }
              };
              
              // Add guardian to the flight (use current flightName from page, fall back to veteran's flight)
              const guardianFlightName = flightName || selectedVeteranForPairing.flight?.name;
              if (guardianFlightName) {
                updatedGuardian.flight = {
                  ...updatedGuardian.flight,
                  id: guardianFlightName
                };
              }
              
              // Save the updated guardian
              await api.updateGuardian(guardianId, updatedGuardian);
              
              setPairingDialogOpen(false);
              setSelectedVeteranForPairing(null);
              toast.success('Guardian paired successfully');
              
              // Trigger parent component to refresh flight data
              if (onPairingComplete) {
                await onPairingComplete();
              }
            } catch (error) {
              toast.error('Failed to pair guardian');
              logger.error('Guardian pairing error:', error);
            }
          }
        }}
        veteran={selectedVeteranForPairing}
        currentGuardian={null}
      />
    </>
  );
}
