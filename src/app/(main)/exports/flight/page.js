'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { getFlightsSorted } from '@/lib/flights';
import { downloadFlightRosterCSV } from '@/lib/exports';
import { usePermissions } from '@/hooks/use-permissions';

function FlightRosterExportPage() {
  const [flights, setFlights] = React.useState([]);
  const [selectedFlight, setSelectedFlight] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // Permission check
  const ROLE_FULL_ACCESS = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
  const { isInGroup } = usePermissions();

  React.useEffect(() => {
    if (!isInGroup(ROLE_FULL_ACCESS)) {
      return;
    }

    const loadFlights = async () => {
      try {
        setIsLoading(true);
        const data = await getFlightsSorted();
        setFlights(data);
      } catch (err) {
        setError('Failed to load flights');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlights();
  }, [ROLE_FULL_ACCESS]);

  const handleExport = async () => {
    setError('');
    setSuccess('');

    try {
      setIsExporting(true);
      await downloadFlightRosterCSV({
        flightName: selectedFlight,
        filter: filter
      });
      setSuccess(`Flight roster exported successfully as ${filter}`);
    } catch (err) {
      setError('Failed to export flight roster');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isInGroup(ROLE_FULL_ACCESS)) {
    return <div>Access Denied</div>;
  }

  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Export Flight Roster
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download flight roster data as CSV with optional filtering
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Card>
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  select
                  label="Flight (Optional)"
                  value={selectedFlight}
                  onChange={(e) => setSelectedFlight(e.target.value)}
                  fullWidth
                  disabled={isLoading || isExporting}
                  helperText="Leave blank to export all flights"
                >
                  <MenuItem value="">All Flights</MenuItem>
                  {flights.map((flight) => (
                    <MenuItem key={flight._id} value={flight.name}>
                      {flight.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  fullWidth
                  disabled={isExporting}
                >
                  <MenuItem value="All">All (Veterans & Guardians)</MenuItem>
                  <MenuItem value="Veterans">Veterans Only</MenuItem>
                  <MenuItem value="Guardians">Guardians Only</MenuItem>
                </TextField>

                <Button
                  variant="contained"
                  startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={handleExport}
                  disabled={isExporting || isLoading}
                  fullWidth
                >
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}

export default FlightRosterExportPage;
