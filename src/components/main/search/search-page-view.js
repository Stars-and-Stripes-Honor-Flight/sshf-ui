'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { config } from '@/config';
import { ApiTable } from '@/components/core/table/api-table';
import { Option } from '@/components/core/option';

import { searchColumns } from '@/components/main/search/search-columns';
import { SearchCardView } from '@/components/main/search/search-card-view';
import { focusOnDesktop } from '@/lib/focus-on-desktop';
import { getFlights, formatFlightNameForDisplay } from '@/lib/flights';

export function SearchPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchInputRef = React.useRef(null);
  const [quickSearch, setQuickSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [flights, setFlights] = React.useState([]);
  
  const [searchFilters, setSearchFilters] = React.useState([
    { property: "lastName", propertyFriendlyName: "Last Name", filterType: "text", hidden: true },
    { property: "status", propertyFriendlyName: "Status", 
      filterType: "combo", options: [
        <Option key="All" value="All">All</Option>,
        <Option key="Active" value="Active">Active</Option>,
        <Option key="Flown" value="Flown">Flown</Option>,
        <Option key="Deceased" value="Deceased">Deceased</Option>,
        <Option key="Removed" value="Removed">Removed</Option>,
        <Option key="Future-Spring" value="Future-Spring">Future-Spring</Option>,
        <Option key="Future-Fall" value="Future-Fall">Future-Fall</Option>,
        <Option key="Future-PostRestriction" value="Future-PostRestriction">Future-PostRestriction</Option>,
        <Option key="Copied" value="Copied">Copied</Option>
      ]
    },
    {
      property: 'phoneNum',
      propertyFriendlyName: 'Phone',
      filterType: 'phone',
      placeholder: 'Phone number...',
    },
  ]);
  
  const handleQuickSearch = (event) => {
    const value = event.target.value;
    setQuickSearch(value);

    if (value && isInitialized) {
      const params = new URLSearchParams(window.location.search);
      if (params.has('phoneNum')) {
        params.delete('phoneNum');
        const newUrl = params.toString() ? `?${params.toString()}` : '/search';
        router.replace(newUrl, { scroll: false });
      }
    }
  };
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(quickSearch);
    }, 250);
    
    return () => clearTimeout(timer);
  }, [quickSearch]);
  
  React.useEffect(() => {
    if (!isInitialized) return;
    
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearch) {
      params.set('lastName', debouncedSearch);
      params.delete('phoneNum');
    } else {
      params.delete('lastName');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, isInitialized, router]);

  const phoneNumParam = searchParams.get('phoneNum') || '';

  React.useEffect(() => {
    if (!isInitialized) return;

    const digitCount = phoneNumParam.replace(/\D/g, '').length;
    if (digitCount < 3) return;

    setQuickSearch('');
    setDebouncedSearch('');

    const params = new URLSearchParams(window.location.search);
    if (!params.get('lastName')) return;

    params.delete('lastName');
    const newUrl = params.toString() ? `?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router identity is unstable; only react to phoneNum changes
  }, [phoneNumParam, isInitialized]);

  const updatesearchFilters = (newsearchFilter) => {
    setSearchFilters(newsearchFilter);
  };

  React.useEffect(() => {
    const flightFilter = searchFilters.find(f => f.property === 'flight');
    const statusFilter = searchFilters.find(f => f.property === 'status');
    
    if (flightFilter && flightFilter.value && flightFilter.value !== 'All' && statusFilter && statusFilter.value !== 'All') {
      const updatedFilters = searchFilters.map(f => 
        f.property === 'status' ? { ...f, value: 'All' } : f
      );
      
      const params = new URLSearchParams(window.location.search);
      params.set('status', 'All');
      const newUrl = params.toString() ? `?${params.toString()}` : '/search';
      router.replace(newUrl, { scroll: false });
            
      setSearchFilters(updatedFilters);
    }
  }, [searchFilters.find(f => f.property === 'flight')?.value, searchFilters.length]);

  const [readyToFetch, setReadyToFetch] = React.useState(false);

  React.useEffect(() => {
    document.title = `Search Veterans & Guardians | ${config.site.name}`;
    
    const urlSearch = searchParams.get('lastName') || '';
    setQuickSearch(urlSearch);
    setDebouncedSearch(urlSearch);
    setIsInitialized(true);
    
    const cachedFlights = getFlights();
    setFlights(cachedFlights);
    
    focusOnDesktop(searchInputRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const checkFlights = () => {
      const cachedFlights = getFlights();
      if (cachedFlights.length > 0) {
        setFlights(cachedFlights);
      }
    };
    
    checkFlights();
    
    const timer = setInterval(checkFlights, 200);
    const timeout = setTimeout(() => clearInterval(timer), 5000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  React.useEffect(() => {
    if (flights.length > 0) {
      const flightOptions = [
        <Option key="All" value="All">All Flights</Option>,
        ...flights.map(flight => {
          const displayName = formatFlightNameForDisplay(flight.name);
          return (
            <Option key={flight._id} value={displayName}>
              {displayName}
            </Option>
          );
        })
      ];

      setSearchFilters(prev => {
        const lastNameFilter = prev.find(f => f.property === 'lastName');
        const statusFilter = prev.find(f => f.property === 'status');
        const phoneFilter = prev.find(f => f.property === 'phoneNum');

        return [
          lastNameFilter,
          statusFilter,
          {
            property: "flight",
            propertyFriendlyName: "Flight",
            filterType: "combo",
            options: flightOptions,
          },
          phoneFilter,
        ].filter(Boolean);
      });
    }
  }, [flights]);

  React.useEffect(() => {
    if (searchFilters.length > 0) {
      setReadyToFetch(true);
    }
  }, [searchFilters.length]);

  return (
    <Stack spacing={2}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <OutlinedInput
          inputRef={searchInputRef}
          placeholder="Quick search by last name..."
          value={quickSearch}
          onChange={handleQuickSearch}
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
      </Box>
      <ApiTable 
        entity='VeteransAndGuardians'
        entityFriendlyName='Search Veterans & Guardians'
        columns={searchColumns}
        readyToFetch={readyToFetch}
        updatesearchFilters={updatesearchFilters}
        filters={searchFilters}
        defaultRowsPerPage={25}
        hidePagination={true}
        mobileCardView={<SearchCardView />}
        flights={flights} />
    </Stack>
  );
}
