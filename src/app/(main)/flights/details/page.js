'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUp as CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';
import { Car as CarIcon } from '@phosphor-icons/react/dist/ssr/Car';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Bus as BusIcon } from '@phosphor-icons/react/dist/ssr/Bus';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { Phone as PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { DotsThreeVertical as MoreVertIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { config } from '@/config';
import { paths } from '@/paths';
import { api } from '@/lib/api';
import { dayjs } from '@/lib/dayjs';
import { formatFlightNameForDisplay } from '@/lib/flights';
import { toast } from '@/components/core/toaster';
import { FlightExportMenu } from '@/components/main/flight/flight-export-menu';
import { FlightDetailsGrid } from '@/components/main/flight/flight-details-grid';

function FlightDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flightId = searchParams.get('id');
  
  const [flightData, setFlightData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [backLinkText, setBackLinkText] = React.useState('Back to Flights');
  
  // Filter states
  const [nameFilter, setNameFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all'); // all, ok, issues
  const [busFilter, setBusFilter] = React.useState('all');
  const [assignmentData, setAssignmentData] = React.useState(null);
  const [showAddAssignmentDialog, setShowAddAssignmentDialog] = React.useState(false);
  const [assignmentCount, setAssignmentCount] = React.useState('1');
  const [addingAssignments, setAddingAssignments] = React.useState(false);
  
  // Bus mismatch auto-fix states
  const [showBusMismatchDialog, setShowBusMismatchDialog] = React.useState(false);
  const [busMismatchFixes, setBusMismatchFixes] = React.useState([]);
  const [fixingBusMismatches, setFixingBusMismatches] = React.useState(false);
  
  // Redirect to search-flights if no ID is provided
  React.useEffect(() => {
    if (!flightId) {
      router.push(paths.main.search.flights);
    }
  }, [flightId, router]);

  React.useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);
        const [detailsData, assignmentData] = await Promise.all([
          api.getFlightDetails(flightId),
          api.getFlightAssignments(flightId),
        ]);
        setFlightData(detailsData);
        setAssignmentData(assignmentData);
      } catch (err) {
        console.error('Failed to fetch flight data:', err);
        setError('Failed to load flight data. Please try again later.');
        toast.error('Failed to load flight data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (flightId) {
      fetchFlightData();
    }
  }, [flightId]);

  const handleAddAssignments = async () => {
    const count = parseInt(assignmentCount, 10);
    if (!count || count < 1 || count > 100) {
      toast.error('Please enter a valid number between 1 and 100');
      return;
    }

    try {
      setAddingAssignments(true);
      await api.addVeteransToFlight(flightId, count);
      // Refresh assignment and flight data
      const [detailsData, newAssignmentData] = await Promise.all([
        api.getFlightDetails(flightId),
        api.getFlightAssignments(flightId),
      ]);
      setFlightData(detailsData);
      setAssignmentData(newAssignmentData);
      setShowAddAssignmentDialog(false);
      setAssignmentCount('1');
      toast.success('Veterans added successfully');
    } catch (err) {
      console.error('Failed to add veterans:', err);
      toast.error('Failed to add veterans. Please try again later.');
    } finally {
      setAddingAssignments(false);
    }
  };

  const handlePreviewBusMismatchFixes = () => {
    // Calculate all bus mismatch fixes
    const fixes = (flightData?.pairs || [])
      .filter(pair => pair.busMismatch)
      .map(pair => {
        const veteran = pair.people.find(p => p.type === 'Veteran');
        const guardian = pair.people.find(p => p.type === 'Guardian');
        
        // Fix strategy: assign guardian's bus to veteran (or vice versa if veteran's bus is "None")
        const newBus = veteran?.bus === 'None' ? guardian?.bus : veteran?.bus;
        
        return {
          pairId: pair.pairId,
          veteranName: veteran ? `${veteran.name_first} ${veteran.name_last}` : 'Unknown',
          guardianName: guardian ? `${guardian.name_first} ${guardian.name_last}` : 'Unknown',
          currentVeteranBus: veteran?.bus || 'N/A',
          currentGuardianBus: guardian?.bus || 'N/A',
          newBus: newBus || 'None',
        };
      });
    
    setBusMismatchFixes(fixes);
    setShowBusMismatchDialog(true);
  };

  const handleApplyBusMismatchFixes = async () => {
    if (busMismatchFixes.length === 0) return;

    try {
      setFixingBusMismatches(true);
      
      // Prepare the fixes data
      const fixesData = busMismatchFixes.map(fix => ({
        pairId: fix.pairId,
        newBus: fix.newBus,
      }));

      // Call API to apply fixes (you may need to create this endpoint)
      // For now, we'll use a generic update approach
      await api.fixBusMismatches(flightId, fixesData);
      
      // Refresh flight data
      const [detailsData, newAssignmentData] = await Promise.all([
        api.getFlightDetails(flightId),
        api.getFlightAssignments(flightId),
      ]);
      setFlightData(detailsData);
      setAssignmentData(newAssignmentData);
      setShowBusMismatchDialog(false);
      setBusMismatchFixes([]);
      toast.success('Bus mismatches fixed successfully');
    } catch (err) {
      console.error('Failed to fix bus mismatches:', err);
      toast.error('Failed to apply bus mismatch fixes. Please try again later.');
    } finally {
      setFixingBusMismatches(false);
    }
  };

  React.useEffect(() => {
    document.title = `Flight Details | ${config.site.name}`;
  }, []);

  // If no flightId, don't render anything (will redirect)
  if (!flightId) {
    return null;
  }

  const flight = flightData?.flight;
  const stats = flightData?.stats;
  const pairs = flightData?.pairs || [];

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 1
      }}
    >
      <Box
        sx={{
          px: { xs: 3, lg: 4 },
          maxWidth: 'var(--Content-maxWidth)',
          m: 'var(--Content-margin)',
          p: 'var(--Content-padding)',
          width: 'var(--Content-width)',
        }}
      >
        <Stack spacing={4}>

          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && flight && (
            <>
              {/* Flight Header */}
              <div>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
                  <AirplaneTiltIcon size={32} weight="fill" />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="h4">
                        {formatFlightNameForDisplay(flight.name)}
                      </Typography>
                      <Chip
                        label={flight.completed ? 'Completed' : 'Active'}
                        color={flight.completed ? 'info' : 'success'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                  <FlightExportMenu 
                    flightName={flight?.name}
                    stopPropagation={false}
                  />
                  {/* Menu removed - now handled by FlightExportMenu component */}
                </Stack>
                <Typography color="text.secondary" variant="body1">
                  Flight on {dayjs(flight.flight_date).format('MMMM DD, YYYY')} • Capacity: {flight.capacity}
                </Typography>
              </div>

              {/* Seats Available Card */}
              {(() => {
                // Count total participants (each pair can have 1 or 2 people)
                const totalParticipants = pairs.reduce((sum, pair) => sum + pair.people.length, 0);
                const seatsAvailable = flight.capacity - totalParticipants;
                const occupancyPercentage = Math.round((totalParticipants / flight.capacity) * 100);
                
                return (
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography color="text.secondary" variant="caption" sx={{ display: 'block' }}>
                              Seat Availability
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {seatsAvailable} / {flight.capacity} seats available
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {occupancyPercentage}% Full
                            </Typography>
                          </Box>
                        </Stack>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            borderRadius: 1,
                            backgroundColor: 'var(--mui-palette-background-level1)',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${occupancyPercentage}%`,
                              backgroundColor: occupancyPercentage < 50 ? 'var(--mui-palette-error-main)' : occupancyPercentage < 85 ? 'var(--mui-palette-warning-main)' : 'var(--mui-palette-success-main)',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Assignments Section */}
              {assignmentData && (
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Assignments
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setShowAddAssignmentDialog(true)}
                        >
                          Add Veterans from Waitlist
                        </Button>
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Veterans Assigned
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {assignmentData.counts.veterans}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Guardians Assigned
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {assignmentData.counts.guardians}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Confirmed
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {assignmentData.counts.veteransConfirmed} vet + {assignmentData.counts.guardiansConfirmed} guard
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Remaining Capacity
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: assignmentData.counts.remaining > 0 ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)' }}>
                            {assignmentData.counts.remaining}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Dialog for Adding Veterans */}
              <Dialog open={showAddAssignmentDialog} onClose={() => !addingAssignments && setShowAddAssignmentDialog(false)}>
                <DialogTitle>Add Veterans from Waitlist</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter the number of veterans to add from the waitlist (1-100).
                  </Typography>
                  <TextField
                    autoFocus
                    fullWidth
                    label="Number of Veterans"
                    type="number"
                    value={assignmentCount}
                    onChange={(e) => setAssignmentCount(e.target.value)}
                    inputProps={{ min: 1, max: 100 }}
                    disabled={addingAssignments}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowAddAssignmentDialog(false)} disabled={addingAssignments}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAssignments}
                    variant="contained"
                    disabled={addingAssignments}
                  >
                    {addingAssignments ? 'Adding...' : 'Add'}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Dialog for Fixing Bus Mismatches */}
              <Dialog open={showBusMismatchDialog} onClose={() => !fixingBusMismatches && setShowBusMismatchDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Fix Bus Mismatches</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                  {busMismatchFixes.length > 0 ? (
                    <Stack spacing={2}>
                      <Alert severity="info">
                        This will reassign {busMismatchFixes.length} pair{busMismatchFixes.length !== 1 ? 's' : ''} to match bus assignments.
                      </Alert>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Changes to be made:
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                        <Stack spacing={2}>
                          {busMismatchFixes.map((fix, index) => (
                            <Box key={fix.pairId} sx={{ pb: 1.5, '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Pair {index + 1}: {fix.veteranName} & {fix.guardianName}
                              </Typography>
                              <Stack spacing={0.5} sx={{ ml: 2, fontSize: '0.875rem' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Veteran Bus:
                                  </Typography>
                                  <Typography variant="caption">
                                    {fix.currentVeteranBus} → {fix.newBus}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Guardian Bus:
                                  </Typography>
                                  <Typography variant="caption">
                                    {fix.currentGuardianBus} → {fix.newBus}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No bus mismatches found to fix.
                    </Typography>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowBusMismatchDialog(false)} disabled={fixingBusMismatches}>
                    Cancel
                  </Button>
                  {busMismatchFixes.length > 0 && (
                    <Button
                      onClick={handleApplyBusMismatchFixes}
                      variant="contained"
                      color="warning"
                      disabled={fixingBusMismatches}
                    >
                      {fixingBusMismatches ? 'Fixing...' : 'Apply Fixes'}
                    </Button>
                  )}
                </DialogActions>
              </Dialog>

              {/* Stats Section */}
              {stats && (
                <Stack spacing={3}>
                  <Typography variant="h5">Overview</Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
                    {/* Flight & Tour Stats Combined */}
                    <Card sx={{ flex: '1 1 auto', minWidth: 250 }}>
                      <CardContent>
                        <Stack spacing={2.5}>
                          {/* Flight Stats */}
                          <Box>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                              <AirplaneTiltIcon size={20} />
                              <Typography color="text.secondary" variant="caption">
                                Flight Breakdown
                              </Typography>
                            </Stack>
                            <Stack spacing={1}>
                              {Object.entries(stats.flight).map(([key, value]) => (
                                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', ...(key === 'None' && value > 0 && { backgroundColor: 'rgba(211, 47, 47, 0.08)', p: 1, borderRadius: 0.5 }) }}>
                                  <Typography variant="body2">{key}</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, ...(key === 'None' && value > 0 && { color: 'var(--mui-palette-error-main)' }) }}>{value}</Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>

                          {/* Divider */}
                          <Box sx={{ borderTop: 1, borderColor: 'divider' }} />

                          {/* Tour Stats */}
                          <Box>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                              <UsersIcon size={20} />
                              <Typography color="text.secondary" variant="caption">
                                Tour Breakdown
                              </Typography>
                            </Stack>
                            <Stack spacing={1}>
                              {Object.entries(stats.tours).map(([key, value]) => (
                                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', ...(key === 'None' && value > 0 && { backgroundColor: 'rgba(211, 47, 47, 0.08)', p: 1, borderRadius: 0.5 }) }}>
                                  <Typography variant="body2">{key}</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, ...(key === 'None' && value > 0 && { color: 'var(--mui-palette-error-main)' }) }}>{value}</Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Bus Capacity */}
                    <Card sx={{ flex: '1 1 auto', minWidth: 250, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                          <BusIcon size={20} />
                          <Typography color="text.secondary" variant="caption">
                            Bus Breakdown
                          </Typography>
                        </Stack>
                        <Stack spacing={1.5} sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                          {Object.entries(stats.buses).map(([bus, count]) => (
                            <Box key={bus} sx={{ display: 'flex', justifyContent: 'space-between', ...(bus === 'None' && count > 0 && { backgroundColor: 'rgba(211, 47, 47, 0.08)', p: 1, borderRadius: 0.5 }) }}>
                              <Typography variant="body2">{bus}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, ...(bus === 'None' && count > 0 && { color: 'var(--mui-palette-error-main)' }) }}>{count}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Stack>
              )}

              {/* Pairs Table */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5">
                    Participants ({pairs.length})
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {pairs.some(p => p.busMismatch) && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handlePreviewBusMismatchFixes}
                        color="warning"
                      >
                        Fix Bus Mismatches
                      </Button>
                    )}
                  </Stack>
                </Stack>

                {/* Status Snapshot */}
                {(() => {
                  const statusCounts = {
                    ok: pairs.filter(p => !p.busMismatch && !p.missingPairedPerson).length,
                    issues: pairs.filter(p => p.busMismatch || p.missingPairedPerson).length,
                  };
                  
                  return (
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                      <Card sx={{ flex: '1 1 auto', minWidth: 150 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                          <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                            OK
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--mui-palette-success-main)' }}>
                            {statusCounts.ok}
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card sx={{ flex: '1 1 auto', minWidth: 150 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                          <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                            Needs Attention
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--mui-palette-error-main)' }}>
                            {statusCounts.issues}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  );
                })()}

                {/* Filters */}
                {(() => {
                  const allBuses = Array.from(new Set(
                    pairs.flatMap(p => p.people.map(person => person.bus)).filter(bus => bus && bus !== 'None')
                  )).sort();
                  
                  return (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        placeholder="Search by name..."
                        size="small"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        sx={{ flex: 1, minWidth: 200 }}
                      />
                      <TextField
                        select
                        size="small"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="ok">OK Only</MenuItem>
                        <MenuItem value="issues">Issues Only</MenuItem>
                        <MenuItem value="nofly">No Fly</MenuItem>
                      </TextField>
                      <TextField
                        select
                        size="small"
                        value={busFilter}
                        onChange={(e) => setBusFilter(e.target.value)}
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="all">All Buses</MenuItem>
                        {allBuses.map(bus => (
                          <MenuItem key={bus} value={bus}>{bus}</MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  );
                })()}
                
                {/* Participants Grid */}
                {(() => {
                  const handleUpdatePerson = async (personId, personType, updates) => {
                    try {
                      // Handle seat updates using dedicated endpoints
                      if (updates.flight?.seat !== undefined) {
                        if (personType === 'Veteran') {
                          await api.updateVeteranSeat(personId, updates.flight.seat);
                        } else if (personType === 'Guardian') {
                          await api.updateGuardianSeat(personId, updates.flight.seat);
                        }
                      } else {
                        // Handle other updates (bus, call.assigned_to, etc.) by fetching full person and merging
                        let fullPerson;
                        if (personType === 'Veteran') {
                          fullPerson = await api.getVeteran(personId);
                        } else if (personType === 'Guardian') {
                          fullPerson = await api.getGuardian(personId);
                        }
                        
                        // Deep merge the updates into the full person object
                        const payload = {
                          ...fullPerson,
                          ...updates,
                          _rev: fullPerson._rev,
                          type: personType
                        };
                        
                        // Deep merge nested objects (flight, call, etc.)
                        if (updates.flight) {
                          payload.flight = {
                            ...fullPerson.flight,
                            ...updates.flight
                          };
                        }
                        if (updates.call) {
                          payload.call = {
                            ...fullPerson.call,
                            ...updates.call
                          };
                        }
                        
                        // Remove metadata (API handles this)
                        delete payload.metadata;
                        
                        // Remove history arrays from nested objects
                        if (payload.flight?.history) delete payload.flight.history;
                        if (payload.veteran?.history) delete payload.veteran.history;
                        if (payload.guardian?.history) delete payload.guardian.history;
                        if (payload.call?.history) delete payload.call.history;
                        
                        if (personType === 'Veteran') {
                          await api.updateVeteran(personId, payload);
                        } else if (personType === 'Guardian') {
                          await api.updateGuardian(personId, payload);
                        }
                      }
                      // Refresh data after update
                      const [detailsData, newAssignmentData] = await Promise.all([
                        api.getFlightDetails(flightId),
                        api.getFlightAssignments(flightId),
                      ]);
                      setFlightData(detailsData);
                      setAssignmentData(newAssignmentData);
                    } catch (error) {
                      console.error('Failed to update person:', error);
                      throw error;
                    }
                  };

                  const handlePairingComplete = async () => {
                    // Refresh flight data after guardian pairing
                    try {
                      const [detailsData, newAssignmentData] = await Promise.all([
                        api.getFlightDetails(flightId),
                        api.getFlightAssignments(flightId),
                      ]);
                      setFlightData(detailsData);
                      setAssignmentData(newAssignmentData);
                    } catch (error) {
                      console.error('Failed to refresh flight data:', error);
                      toast.error('Failed to refresh flight data');
                    }
                  };

                  return (
                    <FlightDetailsGrid
                      pairs={pairs}
                      onUpdate={handleUpdatePerson}
                      nameFilter={nameFilter}
                      statusFilter={statusFilter}
                      busFilter={busFilter}
                      onPairingComplete={handlePairingComplete}
                      flightId={flightId}
                      flightName={flight.name}
                    />
                  );
                })()}
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default function Page() {
  return (
    <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
      <FlightDetailsPage />
    </React.Suspense>
  );
}
