'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { config } from '@/config';
import { focusOnDesktop } from '@/lib/focus-on-desktop';
import { getFlightsSorted, refreshFlights } from '@/lib/flights';
import { FlightCard } from '@/components/main/flight/flight-card';

export function FlightsListView() {
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

  const applyFilters = React.useCallback((flightsData, search, status) => {
    let filtered = [...flightsData];
    
    if (search) {
      filtered = filtered.filter(flight => 
        flight.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status !== 'all') {
      const isCompleted = status === 'completed';
      filtered = filtered.filter(flight => flight.completed === isCompleted);
    }
    
    setFilteredFlights(filtered);
  }, []);

  React.useEffect(() => {
    document.title = `Search Flights | ${config.site.name}`;
    
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status') || 'all';
    
    setSearchQuery(urlSearch);
    setDebouncedSearch(urlSearch);
    setStatusFilter(urlStatus);
    setIsInitialized(true);
    
    const cachedFlights = getFlightsSorted();
    setFlights(cachedFlights);
    applyFilters(cachedFlights, urlSearch, urlStatus);
    
    focusOnDesktop(searchInputRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    if (!isInitialized) return;
    
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/search-flights';
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, isInitialized, router]);

  React.useEffect(() => {
    if (!isInitialized) return;
    
    const params = new URLSearchParams(window.location.search);
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    } else {
      params.delete('status');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/search-flights';
    router.replace(newUrl, { scroll: false });
  }, [statusFilter, isInitialized, router]);

  React.useEffect(() => {
    const checkFlights = () => {
      const cachedFlights = getFlightsSorted();
      if (cachedFlights.length > 0) {
        setFlights(cachedFlights);
        applyFilters(cachedFlights, debouncedSearch, statusFilter);
      }
    };
    
    checkFlights();
    
    const timer = setInterval(checkFlights, 200);
    const timeout = setTimeout(() => clearInterval(timer), 5000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [applyFilters, debouncedSearch, statusFilter]);

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
    <Stack spacing={2}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
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
      </Box>

      {flights.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
          Showing {filteredFlights.length} of {flights.length} flight{flights.length !== 1 ? 's' : ''}
        </Typography>
      )}

      {flights.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No flights found. Flights will appear here once they are loaded.
        </Box>
      ) : filteredFlights.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No flights match your search criteria. Try adjusting your filters.
        </Box>
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
            px: 2,
            pb: 2,
          }}
        >
          {filteredFlights.map((flight) => (
            <FlightCard key={flight._id} flight={flight} />
          ))}
        </Box>
      )}
    </Stack>
  );
}
