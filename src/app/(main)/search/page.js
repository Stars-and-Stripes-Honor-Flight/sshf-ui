'use client'

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { paths } from '@/paths';
import { config } from '@/config';
import { ApiTable } from '@/components/core/table/api-table';
import { Option } from '@/components/core/option';

import { createSearchColumns } from '@/components/main/search/search-columns';
import { SearchCardView } from '@/components/main/search/search-card-view';
import { usePermissions } from '@/hooks/use-permissions';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // TODO: Look at adding to a higher level component or page to protect all pages.
  const ROLE_FULL_ACCESS = process.env.NEXT_PUBLIC_ROLE_FULL_ACCESS;
  const { hasRole, isInGroup } = usePermissions();


  if (!isInGroup(ROLE_FULL_ACCESS)) {
    return <div>Access Denied</div>;
  }

  const today = new Date();
  let todayText = today.toISOString();
  
  const searchInputRef = React.useRef(null);
  const [quickSearch, setQuickSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  const [searchFilters, setSearchFilters] = React.useState([
    { property: "lastName", propertyFriendlyName: "Last Name", filterType: "text" },
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
    }
  ]);
  
  const handleQuickSearch = (event) => {
    const value = event.target.value;
    setQuickSearch(value);
  };
  
  // Debounce the search input - wait 250ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(quickSearch);
    }, 250);
    
    return () => clearTimeout(timer);
  }, [quickSearch]);
  
  // Update URL when debounced search changes - ApiTable will read from URL
  React.useEffect(() => {
    if (!isInitialized) return; // Skip on initial mount
    
    // Update URL with lastName parameter
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearch) {
      params.set('lastName', debouncedSearch);
    } else {
      params.delete('lastName');
    }
    
    // Update URL without adding to browser history (use replace instead of push)
    // ApiTable will automatically read the filter value from the URL
    const newUrl = params.toString() ? `?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, isInitialized, router]);

  const updatesearchFilters = (newsearchFilter) => {
    setSearchFilters(newsearchFilter);
  }

  const [readyToFetch, setReadyToFetch] = React.useState(true);
  const [currentUrl, setCurrentUrl] = React.useState('/search');

  // Track current URL including query parameters
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.pathname + window.location.search);
    }
  }, [searchParams, debouncedSearch]);

  // Initialize from URL parameters on page load ONLY
  React.useEffect(() => {
    document.title = `Search Veterans & Guardians | ${config.site.name}`;
    
    // Get lastName parameter from URL on initial load
    const urlSearch = searchParams.get('lastName') || '';
    setQuickSearch(urlSearch);
    setDebouncedSearch(urlSearch);
    setIsInitialized(true);
    
    // Auto-focus the search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /* Why two useEffects? 
  * The first use effect is loading in the extra data the grid needs to populate the combo filter
  * Once that is done, then this second use effect fires off because of the filters[] array change
  * Which then tells the table it can start fetching the data from the API to populate the table
  */
  React.useEffect(() => {
    if (searchFilters.length > 0) {
      setReadyToFetch(true);
    }
  }, [searchFilters])

  return (
    <React.Suspense>
      <React.Fragment>
        <Box
          sx={{
            maxWidth: 'var(--Content-maxWidth)',
            m: 'var(--Content-margin)',
            p: 'var(--Content-padding)',
            width: 'var(--Content-width)',
          }}
        >
          <Stack spacing={4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ flex: '1 1 auto' }}>
                <Typography variant="h4">Search Veterans & Guardians</Typography>
              </Box>
            </Stack>
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
            <Card>
              <ApiTable 
                entity='VeteransAndGuardians'
                entityFriendlyName='Search Veterans & Guardians'
                columns={createSearchColumns(currentUrl)}
                readyToFetch={readyToFetch}
                updatesearchFilters={updatesearchFilters}
                filters={searchFilters}
                defaultRowsPerPage={25}
                hidePagination={true}
                mobileCardView={<SearchCardView />}
                currentUrl={currentUrl} />
            </Card>
          </Stack>
        </Box>
      </React.Fragment>
    </React.Suspense>
  );
}
