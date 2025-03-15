'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
    const hasFilters = filters.some(f => f.value != undefined);
    let filterButtons = [];
    let sortButtons = [];
    
    if (filters.length > 0) {
        filters.forEach(f => {
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
}) 
{

    const searchParams = useSearchParams();
    filters.forEach((f, index) => {
        if (searchParams.get(f.property)) {
            filters[index].value = searchParams.get(f.property);
        } else {
            delete filters[index].value;
        }
    });
    
    

    const router = useRouter();
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
            const hasFilters = filters.some(f => f.value != undefined);
            let filterParams = {};
            
            // Set default status filter to 'Active' if not specified
            filterParams.status = 'Active';
            
            // Handle tab filter (assuming tab.value corresponds to status)
            if (currentTab) {
                filterParams.status = currentTab;
            }
            
            // Handle text filters
            filters.forEach(f => {
                if (f.value != undefined) {
                    // Handle lastname filter specifically
                    if (f.property === 'lastName') {
                        filterParams.lastname = f.value;
                    }
                    // Handle flight filter
                    else if (f.property === 'flight') {
                        filterParams.flight = f.value;
                    }
                }
            });
            
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
      (newFilters, newSortDir) => {
        const searchParamsBuilder = new URLSearchParams();

        newFilters.forEach(f => {
            if (f.value != undefined) {
                searchParamsBuilder.set(f.property, f.value);
            }
        });

        newSortDir.forEach(s => {
            if (s.value != undefined) {
                searchParamsBuilder.set(s.property, s.direction);
            }
        })


        router.push(`${window.location.pathname}?${searchParamsBuilder.toString()}`);
      },
      [router]
    );
  
    const handleClearFilters = React.useCallback(() => {
        let tempFilters = [];
        
        for(let filter of filters) {
            let tempFilter = {...filter};
            delete tempFilter.value;
            tempFilters.push(tempFilter);
        }

        
        updateSearchParams(tempFilters, userSorts);
        updateMappingFilters(tempFilters);
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
    }, [tablePageData.page, tablePageData.rowsPerPage, tabFilter, filters, readyToFetch, searchParams]);


    return (
        <React.Fragment>
            <TableTabs tableTabs={tableTabs} handleTabChange={handleTabChange} currentTab={currentTab} />
            <FiltersAndSorts filters={filters} sorts={userSorts} handleChange={handleChange} handleClearFilters={handleClearFilters}/>
            <Box sx={{ overflowX: 'auto' }}>
                <DataTable columns={columns} rows={rows} />
                <LoadingOrEmptyMessage rows={rows} entityFriendlyName={entityFriendlyName} columns={columns} tablePageData={tablePageData} isLoading={isLoading}/>
            </Box>
            <Divider/>
            <TablePagination       
                component="div"
                count={tablePageData.count}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={tablePageData.page}
                rowsPerPage={tablePageData.rowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]} />
        </React.Fragment>
    );

}

Table.propTypes = {
  rows: PropTypes.array,
  filters: PropTypes.array
}