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

import getResponse from '@/lib/response';
import getFilterResponse from '@/lib/filter-response';

// import { api } from '@/lib/api';


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
            let filterString = '';
            let userFilterString = '';
            if (tabFilter || hasFilters) {
                filterString = `&$filter=`;

                filters.forEach(f => {
                    if (f.value != undefined) {

                        if (userFilterString.length > 0) {
                            userFilterString = userFilterString + " and ";
                        }

                        switch (f.filterType) {
                            case "text":
                                userFilterString = `contains(${f.property}, '${f.value}')`;
                                break;
                            case "combo":
                                if (f.filterProperty) {
                                    let filterValue = "";
                                    f.options.forEach(option => {
                                        if (option.props.value == f.value) {
                                            filterValue = option.props.id;
                                        }
                                    })
                                    userFilterString = `${f.filterProperty} eq ${filterValue}`;
                                } else {
                                    userFilterString = `${f.property} eq '${f.value}'`;
                                }
                                
                        }

                        
                    }
                });
            }
            
            if (tabFilter && hasFilters) {
                filterString = `${filterString}${tabFilter} and ${userFilterString}`;
            } else if (tabFilter) {
                filterString = `${filterString}${tabFilter}`;
            } else if (hasFilters) {
                filterString = `${filterString}${userFilterString}`;
            }

            if (urlParams) {
                urlParams = urlParams + "&";
            }

            // api({ 
            //     entity: entity,
            //     urlParams: `${urlParams}$count=true&$top=${tablePageData.rowsPerPage}&skip=${tablePageData.page * tablePageData.rowsPerPage}${filterString}`
            // })
            // .then((response) => {
            //     if (response.status == "200") {
            //         response.json().then(json => {
            //             let results = json.value;
            //             let mappedData = customMapping ? results.map(customMapping) : results;

            //             let count = json["@odata.count"];
            //             let tempPageData = { ...tablePageData };
            //             tempPageData.count = count;
            //             setTablePageData(tempPageData);
            //             setRows(mappedData);
            //         });
            //     } else {
            //         toast.error(`Something went wrong! Or we could not find this ${entityFriendlyName} Record`);
            //     }
            //     setIsLoading(false);
            // })

            setTimeout(() => {
                if (filterString) {
                    let filterResponse = getFilterResponse();
                    let results = filterResponse.rows.map(row => {
                        return {
                            ...row.value,
                            id: row.id
                        }
                    });

                    let tempPageData = { ...tablePageData };
                    tempPageData.count = filterResponse.total_rows;
                    setTablePageData(tempPageData);
                    setRows(results);
                } else {
                    let response = getResponse();
                    let results = response.rows.map(row => row.value);

                    let tempPageData = { ...tablePageData };
                    tempPageData.count = response.total_rows;
                    setTablePageData(tempPageData);
                    setRows(results);
                }

                setIsLoading(false);
            }, 100);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTabCounts = async () => {
        try {
            let tempTabs = tableTabs;
            for(let t of tempTabs) {
                let filterString = '';
                if (t.filter) {
                    filterString = `&$filter=${t.filter}`;
                }
                await api({ 
                    entity: entity,
                    urlParams: `$count=true&$top=0${filterString}`
                })
                .then((response) => {
                    if (response.status == "200") {
                        response.json().then(json => {
                            t.count = json["@odata.count"];
                        });
                    }
                })
            }
            setTableTabs(tempTabs);
        } catch (error) {
            console.log(error);
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