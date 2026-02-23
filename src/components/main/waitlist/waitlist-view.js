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
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import { useMediaQuery, useTheme } from '@mui/material';

import { api } from '@/lib/api';
import { WaitlistTypeFilter } from '@/components/main/waitlist/waitlist-type-filter';
import { WaitlistItem } from '@/components/main/waitlist/waitlist-item';
import { WaitlistMobileCard } from '@/components/main/waitlist/waitlist-mobile-card';

const DEFAULT_PAGE_SIZE = 20;

export function WaitlistView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [entries, setEntries] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(0);

  const waitlistType = searchParams.get('type') || 'veterans';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 0;
  const offset = currentPage * DEFAULT_PAGE_SIZE;

  const handleTypeChange = (newType) => {
    const params = new URLSearchParams(window.location.search);
    params.set('type', newType);
    params.set('page', '0');
    const newUrl = params.toString() ? `?${params.toString()}` : '/waitlist';
    router.replace(newUrl, { scroll: false });
  };

  const handlePageChange = (event, newPage) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    const newUrl = params.toString() ? `?${params.toString()}` : '/waitlist';
    router.replace(newUrl, { scroll: false });
  };

  const handleRowsPerPageChange = (event) => {
    // Fixed page size for now
  };

  React.useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch one extra record to detect if there are more pages
        const response = await api.getWaitlist({
          type: waitlistType,
          offset: offset,
          limit: DEFAULT_PAGE_SIZE + 1,
        });

        // Handle both array and object response formats
        let allResults = Array.isArray(response) ? response : (response.rows || []);
        
        // Check if we got more than the page size (indicating there are more pages)
        const hasMorePages = allResults.length > DEFAULT_PAGE_SIZE;
        
        // Only display the page-sized amount
        const pageEntries = allResults.slice(0, DEFAULT_PAGE_SIZE);
        setEntries(pageEntries);
        
        // Estimate total
        if (hasMorePages) {
          setTotalRows(offset + DEFAULT_PAGE_SIZE + 1);
        } else if (Array.isArray(response)) {
          setTotalRows(offset + pageEntries.length);
        } else {
          setTotalRows(response.total_rows || offset + pageEntries.length);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch waitlist');
        setEntries([]);
        setTotalRows(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlist();
  }, [waitlistType, offset]);

  return (
    <Stack spacing={2}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <WaitlistTypeFilter value={waitlistType} onChange={handleTypeChange} />
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
      ) : entries.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No {waitlistType} on waitlist
        </Box>
      ) : isMobile ? (
        // Mobile Card View
        <Stack spacing={2} sx={{ p: 2 }}>
          {entries.map((entry, index) => (
            <WaitlistMobileCard key={`${waitlistType}-${entry.id}-${index}`} entry={entry} type={waitlistType} />
          ))}
        </Stack>
      ) : (
        // Desktop Table View
        <>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '50px' }}></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Birth Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Application Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry, index) => (
                  <WaitlistItem key={`${waitlistType}-${entry.id}-${index}`} entry={entry} type={waitlistType} />
                ))}
              </TableBody>
            </Table>
          </Card>
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
