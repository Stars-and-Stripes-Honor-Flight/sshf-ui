'use client'

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useMediaQuery, useTheme } from '@mui/material';

import { api } from '@/lib/api';
import { dayjs } from '@/lib/dayjs';
import { ActivityTypeFilter } from '@/components/main/activity/activity-type-filter';
import { ActivityListItem } from '@/components/main/activity/activity-list-item';
import { ActivityMobileCard } from '@/components/main/activity/activity-mobile-card';

const ACTIVITY_TYPES = [
  { label: 'All', value: null },
  { label: 'Modified', value: 'modified' },
  { label: 'Added', value: 'added' },
  { label: 'Call', value: 'call' },
  { label: 'Flight', value: 'flight' },
  { label: 'Pairing', value: 'pairing' },
];

const DEFAULT_PAGE_SIZE = 20;

export function ActivityList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [activities, setActivities] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);

  const activityType = searchParams.get('type') || 'modified';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 0;
  const offset = currentPage * DEFAULT_PAGE_SIZE;

  // Use modified as default, always pass it to the API
  const apiActivityType = activityType || 'modified';

  const handleTypeChange = (newType) => {
    const params = new URLSearchParams(window.location.search);
    if (newType) {
      params.set('type', newType);
    } else {
      params.delete('type');
    }
    params.set('page', '0');
    const newUrl = params.toString() ? `?${params.toString()}` : '/activity';
    router.replace(newUrl, { scroll: false });
  };

  const handlePageChange = (event, newPage) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    const newUrl = params.toString() ? `?${params.toString()}` : '/activity';
    router.replace(newUrl, { scroll: false });
  };

  const handleRowsPerPageChange = (event) => {
    // For now, we'll keep it simple with a fixed page size
    // If you want to make it configurable, you can add this logic
  };

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch one extra record to detect if there are more pages
        const response = await api.getRecentActivity({
          type: apiActivityType,
          offset: offset,
          limit: DEFAULT_PAGE_SIZE + 1,
        });

        // Handle both array and object response formats
        let allResults = Array.isArray(response) ? response : (response.rows || []);
        
        // Check if we got more than the page size (indicating there are more pages)
        const hasMorePages = allResults.length > DEFAULT_PAGE_SIZE;
        setHasMore(hasMorePages);
        
        // Only display the page-sized amount
        const pageActivities = allResults.slice(0, DEFAULT_PAGE_SIZE);
        setActivities(pageActivities);
        
        // Estimate total: if on this page we got all requested items + 1, 
        // then total is at least offset + length. Otherwise it's the current data
        if (hasMorePages) {
          // We know there are more pages, estimate conservatively
          setTotalRows(offset + DEFAULT_PAGE_SIZE + 1);
        } else if (Array.isArray(response)) {
          // Last page or only page
          setTotalRows(offset + pageActivities.length);
        } else {
          // Structured response with actual total
          setTotalRows(response.total_rows || offset + pageActivities.length);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch activities');
        setActivities([]);
        setTotalRows(0);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [apiActivityType, offset]);

  return (
    <Stack spacing={2}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <ActivityTypeFilter value={activityType} onChange={handleTypeChange} />
      </Box>

      {error && (
        <Box sx={{ p: 2, color: 'error.main' }}>
          {error}
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : activities.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No activities found
        </Box>
      ) : isMobile ? (
        // Mobile Card View
        <Stack spacing={2} sx={{ p: 2 }}>
          {activities.map((activity) => (
            <ActivityMobileCard key={activity.id} activity={activity} />
          ))}
        </Stack>
      ) : (
        // Desktop Table View
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: '50px' }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Change</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Changed By</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date/Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <ActivityListItem key={activity.id} activity={activity} />
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Box sx={{ p: isMobile ? 1 : 0 }}>
        <TablePagination
          component="div"
          count={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={currentPage}
          rowsPerPage={DEFAULT_PAGE_SIZE}
          rowsPerPageOptions={[DEFAULT_PAGE_SIZE]}
          labelDisplayedRows={({ from, to }) => `${from}–${to}`}
        />
      </Box>
    </Stack>
  );
}
