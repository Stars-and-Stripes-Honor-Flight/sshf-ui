'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { config } from '@/config';
import { getFlightsSorted, refreshFlights } from '@/lib/flights';
import { FlightCard } from '@/components/main/flight/flight-card';
import { usePermissions } from '@/hooks/use-permissions';

function FlightsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flights, setFlights] = React.useState([]);
  const [filteredFlights, setFilteredFlights] = React.useState([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isInitialized, setIsInitialized] = React.useState(false);
  const searchInputRef = React.useRef(null);

  // Permission check
  const ROLE_FULL_ACCESS = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
  const { isInGroup } = usePermissions();

  if (!isInGroup(ROLE_FULL_ACCESS)) {
    return <div>Access Denied</div>;
  }

  // Filter function
  const applyFilters = React.useCallback((flightsData, search, status) => {
    let filtered = [...flightsData];
    
    // Apply search filter (search by flight name)
    if (search) {
      filtered = filtered.filter(flight => 
        flight.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      const isCompleted = status === 'completed';
      filtered = filtered.filter(flight => flight.completed === isCompleted);
    }
    
    setFilteredFlights(filtered);
  }, []);

  // Initialize from URL parameters on page load
  React.useEffect(() => {
    document.title = `Search Flights | ${config.site.name}`;
    
    // Get search and status parameters from URL on initial load
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status') || 'all';
    
    setSearchQuery(urlSearch);
    setDebouncedSearch(urlSearch);
    setStatusFilter(urlStatus);
    setIsInitialized(true);
    
    // Load flights from local storage (sorted by date, most recent first)
    const cachedFlights = getFlightsSorted();
    setFlights(cachedFlights);
    applyFilters(cachedFlights, urlSearch, urlStatus);
    
    // Auto-focus the search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchParams, applyFilters]);

  // Debounce the search input - wait 250ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when debounced search changes
  React.useEffect(() => {
    if (!isInitialized) return; // Skip on initial mount
    
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    
    // Update URL without adding to browser history
    const newUrl = params.toString() ? `?${params.toString()}` : '/search-flights';
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, isInitialized, router]);

  // Update URL when status filter changes
  React.useEffect(() => {
    if (!isInitialized) return; // Skip on initial mount
    
    const params = new URLSearchParams(window.location.search);
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    } else {
      params.delete('status');
    }
    
    // Update URL without adding to browser history
    const newUrl = params.toString() ? `?${params.toString()}` : '/search-flights';
    router.replace(newUrl, { scroll: false });
  }, [statusFilter, isInitialized, router]);

  // Poll for flights being loaded into localStorage
  React.useEffect(() => {
    // Check for flights periodically since they may still be loading
    const checkFlights = () => {
      const cachedFlights = getFlightsSorted();
      if (cachedFlights.length > 0) {
        setFlights(cachedFlights);
        // Apply current filters to new data
        applyFilters(cachedFlights, debouncedSearch, statusFilter);
      }
    };
    
    // Check immediately
    checkFlights();
    
    // Then check every 200ms for up to 5 seconds to catch when flights are loaded
    const timer = setInterval(checkFlights, 200);
    const timeout = setTimeout(() => clearInterval(timer), 5000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [applyFilters, debouncedSearch, statusFilter]);

  // Apply filters whenever debounced search or status filter changes
  React.useEffect(() => {
    applyFilters(flights, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter, flights, applyFilters]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedFlights = await refreshFlights();
      const sorted = updatedFlights.sort((a, b) => new Date(b.flight_date) - new Date(a.flight_date));
      setFlights(sorted);
      applyFilters(sorted, debouncedSearch, statusFilter);
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasActiveFilters = debouncedSearch || statusFilter !== 'all';

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Search Flights</Typography>
            <Typography color="text.secondary" variant="body1" sx={{ mt: 1 }}>
              View all available flights and their details
            </Typography>
          </Box>
        </Stack>

        {/* Search and Filters */}
        <Stack spacing={2}>
          <OutlinedInput
            inputRef={searchInputRef}
            placeholder="Search flights by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{
              maxWidth: '500px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          
          {/* Status Filter Chips */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <Chip
              label="All"
              onClick={() => handleStatusFilterChange('all')}
              color={statusFilter === 'all' ? 'primary' : 'default'}
              variant={statusFilter === 'all' ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="Active"
              onClick={() => handleStatusFilterChange('active')}
              color={statusFilter === 'active' ? 'success' : 'default'}
              variant={statusFilter === 'active' ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="Completed"
              onClick={() => handleStatusFilterChange('completed')}
              color={statusFilter === 'completed' ? 'info' : 'default'}
              variant={statusFilter === 'completed' ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={handleClearFilters}
                sx={{ ml: 1 }}
              >
                Clear Filters
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button
              startIcon={<ArrowClockwiseIcon />}
              variant="outlined"
              size="small"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>
        </Stack>

        {/* Results count */}
        {flights.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Showing {filteredFlights.length} of {flights.length} flight{flights.length !== 1 ? 's' : ''}
          </Typography>
        )}

        {/* Flights Grid */}
        {flights.length === 0 ? (
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body1">
                No flights found. Flights will appear here once they are loaded.
              </Typography>
            </Box>
          </Card>
        ) : filteredFlights.length === 0 ? (
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body1">
                No flights match your search criteria. Try adjusting your filters.
              </Typography>
            </Box>
          </Card>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {filteredFlights.map((flight) => (
              <FlightCard key={flight._id} flight={flight} />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default function Page() {
  return (
    <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
      <FlightsListPage />
    </React.Suspense>
  );
}
