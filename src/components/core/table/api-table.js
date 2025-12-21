'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { 
    Divider, 
    LinearProgress, 
    Skeleton, 
    Table, 
    TableBody, 
    TableCell, 
    TablePagination, 
    TableRow, 
    Tabs, 
    Tab,
    Chip,
    Stack,
    Button } from '@mui/material';


import { toast } from '@/components/core/toaster';
import { DataTable } from '@/components/core/data-table';
import { TextFilterButton } from '@/components/core/table/text-filter';
import { ComboFilterButton } from '@/components/core/table/combo-filter';
import { paths } from '@/paths';

import { api } from '@/lib/api';


let LoadingOrEmptyMessage = ({ rows, entityFriendlyName, columns, tablePageData, isLoading }) => {
    if (isLoading) {
        let skeletonRows = [];
        let skeletons = [];
        
        columns.forEach((column, index)=> {
            skeletons.push(
                <TableCell key={Date.now() + index} sx={{ width: column.width,
                    minWidth: column.width,
                    maxWidth: column.width,
                    marginRight: "20px" }}>
                    <Skeleton animation="wave" width={column.width} />
                </TableCell>
            );
        });

        for (let ii = 0; ii < tablePageData.rowsPerPage; ii++) {
            skeletonRows.push(
                <TableRow key={Date.now() + ii}>
                    {skeletons}
                </TableRow>
            );
        }



        return (
            <React.Fragment>
                <Box sx={{ p: 3, padding: 0 }}>
                    <LinearProgress />
                </Box>
                <Table>
                    <TableBody>
                        {skeletonRows}
                    </TableBody>
                </Table>
            </React.Fragment>

        )
    }
    return (
        !rows.length ? (
            <Box sx={{ p: 3 }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
                    No {entityFriendlyName} Found
                </Typography>
            </Box>
        ) : null
    )
}

let TableTabs = ({ tableTabs, handleTabChange, currentTab }) => {
    if (tableTabs.length > 0) {
        return (
            <React.Fragment>
                <Tabs onChange={handleTabChange} sx={{ px: 3 }} value={currentTab} variant="scrollable">
                    {tableTabs.map((tab) => (
                    <Tab
                        icon={<Chip label={tab.count} size="small" variant="soft" />}
                        iconPosition="end"
                        key={tab.value}
                        label={tab.label}
                        sx={{ minHeight: 'auto' }}
                        tabIndex={0}
                        value={tab.value}
                    />
                    ))}
                </Tabs>
                <Divider />
            </React.Fragment>

        )
    }

    return (
        <React.Fragment/>
    )
}

let FiltersAndSorts = ({ filters, sorts, handleChange, handleClearFilters }) => {
    // Check if any filter has a value, including hidden ones (like lastName from quick search)
    const hasFilters = filters.some(f => f.value != undefined && f.value !== '');
    let filterButtons = [];
    let sortButtons = [];
    
    if (filters.length > 0) {
        filters.forEach(f => {
            // Skip hidden filters (like lastName which is handled by quick search)
            if (f.hidden) {
                return;
            }
            
            let filterButton = <TextFilterButton 
                key={f.property}
                value={f.value || f.defaultValue || ''} 
                label={f.propertyFriendlyName} 
                handleChange={ (value) => {
                    handleChange(f.property, value);
                }} />

            switch (f.filterType) {
                case "combo":
                    filterButton = <ComboFilterButton 
                        key={f.property}
                        value={f.value || f.defaultValue || ''} 
                        label={f.propertyFriendlyName} 
                        options={f.options}
                        handleChange={ (value) => {
                            handleChange(f.property, value);
                        }} />
                    break;
            }

            filterButtons.push(filterButton);
        });
        
    }

    if (sorts.length > 0) {

    }

    if (filterButtons.length > 0 || sortButtons.length > 0){
        return (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', p: 2 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
                    { filterButtons }
                    {hasFilters ? <Button onClick={handleClearFilters}>Clear filters</Button> : null}
                </Stack>

            </Stack>
        )
    }
   
    return;
}

const defaultFilter = [];

export function ApiTable({ 
    entity, 
    entityFriendlyName = entity,  
    columns = [], 
    readyToFetch = true, 
    customMapping, 
    defaultRowsPerPage = 10,
    tabs = [],
    updateMappingFilters = () => {},
    filters = defaultFilter,
    sorts = [],
    urlParams = "",
    hidePagination = false,
    mobileCardView = null,
}) 
{

    const searchParams = useSearchParams();
    
    // Helper function to format flight name for display (remove SSHF- prefix)
    const formatFlightNameForDisplay = (flightName) => {
        if (!flightName || flightName === "All") {
            return flightName;
        }
        return flightName.replace(/^SSHF-/i, '');
    };

    // Create a memoized version of filters with values from URL params for display
    // This avoids mutating the filters prop and prevents unnecessary re-renders
    const filtersWithUrlValues = React.useMemo(() => {
        return filters.map(f => {
            const urlValue = searchParams.get(f.property);
            // URL params are the source of truth - if param exists in URL, use it (even if empty string)
            // If param doesn't exist in URL (null), use undefined to clear the filter
            // Don't fall back to f.value as that's stale state from parent
            let displayValue = urlValue !== null ? urlValue : undefined;
            
            // For flight filter, remove SSHF- prefix for display
            if (f.property === 'flight' && displayValue) {
                displayValue = formatFlightNameForDisplay(displayValue);
            }
            
            return {
                ...f,
                value: displayValue
            };
        });
    }, [filters, searchParams]);
    
    

    const router = useRouter();
    const isMobile = useMediaQuery('(max-width:899px)'); // md breakpoint
    const [rows, setRows] = React.useState([]);
    const [tablePageData, setTablePageData] = React.useState({
        rowsPerPage: defaultRowsPerPage,
        page: 0,
        count: 100
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [tableTabs, setTableTabs] = React.useState(tabs);
    const [currentTab, setCurrentTab] = React.useState(tableTabs[0]?.value || '');
    const [tabFilter, setTabFilter] = React.useState(tableTabs[0]?.filter || '');
    const [userSorts, setUserSorts] = React.useState(sorts);

    const showLoading = () => {
        setIsLoading(true);
        setRows([]);
    }

    const onPageChange = (_, page) => {
        let tempPageData = { ...tablePageData };
        tempPageData.page = page;

        showLoading();
        setTablePageData(tempPageData);
    }

    const onRowsPerPageChange = (_, rowsPerPage) => {
        let tempPageData = { ...tablePageData };
        tempPageData.rowsPerPage = rowsPerPage.props.value;

        showLoading();
        setTablePageData(tempPageData);
    }

    const handleTabChange = (_, tabValue) => {
        const tab = tableTabs.find((t) => t.value == tabValue);
        setCurrentTab(tab.value);
        setTabFilter(tab.filter);
    }

    const fetchEntity = async () => {
        showLoading();
        try {    
            let filterParams = {};
            
            // Set default status filter to 'Active' if not specified
            filterParams.status = 'Active';
            
            // Handle tab filter (assuming tab.value corresponds to status)
            if (currentTab) {
                filterParams.status = currentTab;
            }
            
            // Read all filter values directly from URL params to ensure they're always current
            // This handles the case when page is refreshed and filters are in URL but not yet synced to filters array
            filters.forEach(f => {
                const urlValue = searchParams.get(f.property);
                if (urlValue) {
                    if (f.property === 'lastName') {
                        filterParams.lastname = urlValue;
                    } else if (f.property === 'status') {
                        filterParams.status = urlValue;
                    } else if (f.property === 'flight') {
                        // Ensure SSHF- prefix is present for API calls
                        let flightValue = urlValue;
                        if (flightValue !== 'All' && !flightValue.match(/^SSHF-/i)) {
                            flightValue = `SSHF-${flightValue}`;
                        }
                        filterParams.flight = flightValue;
                    }
                }
            });
            
            // Also check for lastName directly from URL (for quick search, even if not in filters array)
            const lastNameFromUrl = searchParams.get('lastName');
            if (lastNameFromUrl && !filterParams.lastname) {
                filterParams.lastname = lastNameFromUrl;
            }
            
            // Also check for flight directly from URL (flight filter is added dynamically, may not be in filters array on refresh)
            const flightFromUrl = searchParams.get('flight');
            if (flightFromUrl && !filterParams.flight) {
                // Ensure SSHF- prefix is present for API calls
                let flightValue = flightFromUrl;
                if (flightValue !== 'All' && !flightValue.match(/^SSHF-/i)) {
                    flightValue = `SSHF-${flightValue}`;
                }
                filterParams.flight = flightValue;
            }
            
            // Ensure flight param has SSHF- prefix if it was set from filters array
            if (filterParams.flight && filterParams.flight !== 'All' && !filterParams.flight.match(/^SSHF-/i)) {
                filterParams.flight = `SSHF-${filterParams.flight}`;
            }
            
            // Set pagination
            filterParams.limit = tablePageData.rowsPerPage;
            
            // Call the API
            const response = await api.search(filterParams);
            
            if (response) {
                // Map the API response to the expected format
                const results = response.rows.map(row => {
                    return {
                        ...row.value,
                        id: row.id
                    }
                });
                
                // Apply custom mapping if provided
                const mappedData = customMapping ? results.map(customMapping) : results;
                
                let tempPageData = { ...tablePageData };
                tempPageData.count = response.total_rows;
                setTablePageData(tempPageData);
                setRows(mappedData);
            } else {
                toast.error(`Something went wrong! Or we could not find this ${entityFriendlyName} Record`);
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(`Error fetching data: ${error.message}`);
            setIsLoading(false);
        }
    };

    const fetchTabCounts = async () => {
        try {
            let tempTabs = [...tableTabs];
            
            // Skip if no tabs or using mock data
            if (tempTabs.length === 0 || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
                return;
            }
            
            // Fetch counts for each tab (status)
            for (let t of tempTabs) {
                try {
                    const response = await api.search({
                        limit: 0,
                        status: t.value
                    });
                    
                    if (response) {
                        t.count = response.total_rows;
                    }
                } catch (error) {
                    console.error(`Error fetching count for tab ${t.value}:`, error);
                    // Keep the existing count if there's an error
                }
            }
            
            setTableTabs(tempTabs);
        } catch (error) {
            console.error('Error fetching tab counts:', error);
        }
    }

  
    const updateSearchParams = React.useCallback(
      (newFilters, newSortDir, clearAllFilters = false) => {
        const currentParams = new URLSearchParams(window.location.search);
        const searchParamsBuilder = new URLSearchParams();
        
        // Known filter properties that should be managed
        const knownFilterProperties = new Set(['lastName', 'status', 'flight']);

        // Start with all current params
        currentParams.forEach((value, key) => {
            // Skip filter params - we'll handle them separately
            if (!knownFilterProperties.has(key)) {
                searchParamsBuilder.set(key, value);
            }
        });

        // Handle filter params
        if (clearAllFilters) {
            // When clearing, don't add any filter params (they're already excluded above)
        } else {
            // Update/add filter values from newFilters
            newFilters.forEach(f => {
                if (f.value != undefined && f.value !== '') {
                    searchParamsBuilder.set(f.property, f.value);
                } else if (!f.hidden) {
                    // For visible filters, remove when cleared
                    searchParamsBuilder.delete(f.property);
                } else {
                    // For hidden filters (like lastName), preserve from URL if exists
                    const currentValue = currentParams.get(f.property);
                    if (currentValue) {
                        searchParamsBuilder.set(f.property, currentValue);
                    }
                }
            });
        }

        // Update sort params
        newSortDir.forEach(s => {
            if (s.value != undefined) {
                searchParamsBuilder.set(s.property, s.direction);
            } else {
                searchParamsBuilder.delete(s.property);
            }
        });

        router.push(`${window.location.pathname}?${searchParamsBuilder.toString()}`);
      },
      [router]
    );
  
    const handleClearFilters = React.useCallback(() => {
        // Clear all filter values
        const clearedFilters = filters.map(f => ({ ...f, value: undefined }));
        
        // Clear all filters from URL
        updateSearchParams(clearedFilters, userSorts, true);
        updateMappingFilters(clearedFilters);
    }, [updateSearchParams, filters, userSorts]);
  
    const handleChange = React.useCallback(
      (property, value) => {
        let tempFilters = [ ...filters ];

        for (let ii=0; ii<tempFilters.length; ii++) {
            let f = tempFilters[ii];
            if (f.property == property) {
                f.value = value;
            }
        }

        updateSearchParams(tempFilters, userSorts);
        updateMappingFilters(tempFilters);
      },
      [updateSearchParams, filters, userSorts]
    );
  
    const handleSortChange = React.useCallback(
      (event) => {
        updateSearchParams(filters, event.target.value);
      },
      [updateSearchParams, filters]
    );
  


    // Convert searchParams to a stable string for dependency comparison
    // This prevents unnecessary re-renders when searchParams object reference changes but values don't
    const searchParamsString = React.useMemo(() => {
        return searchParams.toString();
    }, [searchParams]);

    React.useEffect(() => {
        showLoading();
        if (!readyToFetch) {
            return;
        }

        const fetchData = async () => {
            await fetchTabCounts();
            await fetchEntity();
        }

        fetchData();
    }, [tablePageData.page, tablePageData.rowsPerPage, tabFilter, readyToFetch, searchParamsString]);


    return (
        <React.Fragment>
            <TableTabs tableTabs={tableTabs} handleTabChange={handleTabChange} currentTab={currentTab} />
            <FiltersAndSorts filters={filtersWithUrlValues} sorts={userSorts} handleChange={handleChange} handleClearFilters={handleClearFilters}/>
            
            {/* Show card view on mobile if provided, otherwise show table */}
            {isMobile && mobileCardView ? (
                <>
                    {isLoading ? (
                        <Box sx={{ p: 3, padding: 0 }}>
                            <LinearProgress />
                        </Box>
                    ) : (
                        React.cloneElement(mobileCardView, { rows })
                    )}
                </>
            ) : (
                <Box sx={{ overflowX: 'auto' }}>
                    <DataTable 
                        columns={columns} 
                        rows={rows}
                        hover={true}
                        onClick={(event, row) => {
                            // Store search URL with filters for back navigation
                            if (typeof window !== 'undefined') {
                                const searchUrl = window.location.pathname + window.location.search;
                                sessionStorage.setItem('searchUrl', searchUrl);
                                sessionStorage.setItem('previousPage', 'search');
                            }
                            
                            // Navigate to detail page based on row type
                            if (row.type === 'Veteran') {
                                router.push(paths.main.veterans.details(row.id));
                            } else if (row.type === 'Guardian') {
                                router.push(paths.main.guardians.details(row.id));
                            }
                        }}
                    />
                    <LoadingOrEmptyMessage rows={rows} entityFriendlyName={entityFriendlyName} columns={columns} tablePageData={tablePageData} isLoading={isLoading}/>
                </Box>
            )}
            
            {!hidePagination && (
                <>
                    <Divider/>
                    <TablePagination       
                        component="div"
                        count={tablePageData.count}
                        onPageChange={onPageChange}
                        onRowsPerPageChange={onRowsPerPageChange}
                        page={tablePageData.page}
                        rowsPerPage={tablePageData.rowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]} />
                </>
            )}
        </React.Fragment>
    );

}

Table.propTypes = {
  rows: PropTypes.array,
  filters: PropTypes.array
}