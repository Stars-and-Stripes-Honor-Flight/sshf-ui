'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { api } from '@/lib/api';
import { DEFAULT_LIST_LIMIT } from '@/lib/review/constants';
import { paths } from '@/paths';
import { ReviewStatusFilter } from '@/components/main/review/review-status-filter';
import { ReviewTypeFilter } from '@/components/main/review/review-type-filter';
import { ReviewStatusChip } from '@/components/main/review/review-status-chip';

function formatApplicationType(type) {
  if (type === 'VeteranApp') return 'Veteran';
  if (type === 'GuardianApp') return 'Guardian';
  return type || '—';
}

export function ReviewApplicationsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') || 'New';
  const typeFilter = searchParams.get('type') || 'all';

  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const updateQuery = React.useCallback(
    (updates) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      const query = params.toString();
      router.replace(query ? `?${query}` : paths.main.review.applications.list, { scroll: false });
    },
    [router]
  );

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.listReviewApplications({
          status,
          limit: DEFAULT_LIST_LIMIT,
        });
        if (!cancelled) {
          setRows(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load applications');
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const filteredRows = React.useMemo(() => {
    if (typeFilter === 'all') {
      return rows;
    }
    return rows.filter((row) => row.type === typeFilter);
  }, [rows, typeFilter]);

  const openApplication = (id) => {
    router.push(paths.main.review.applications.detail(id));
  };

  return (
    <Stack spacing={2}>
      <Card>
        <Box sx={{ px: 2, pt: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <ReviewStatusFilter
            value={status}
            onChange={(newStatus) => updateQuery({ status: newStatus })}
          />
        </Box>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ReviewTypeFilter
            value={typeFilter}
            onChange={(newType) => updateQuery({ type: newType === 'all' ? '' : newType })}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredRows.length} application{filteredRows.length === 1 ? '' : 's'}
          </Typography>
        </Box>
      </Card>

      {error ? (
        <Typography color="error" sx={{ px: 1 }}>
          {error}
        </Typography>
      ) : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredRows.length === 0 ? (
        <Typography color="text.secondary" sx={{ px: 1 }}>
          No applications with status &quot;{status}&quot;
          {typeFilter !== 'all' ? ` for ${formatApplicationType(typeFilter)}` : ''}.
        </Typography>
      ) : (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>City</TableCell>
                <TableCell>App date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Pairing / notes</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openApplication(row.id)}
                >
                  <TableCell>{row.name || '—'}</TableCell>
                  <TableCell>{formatApplicationType(row.type)}</TableCell>
                  <TableCell>{row.city || '—'}</TableCell>
                  <TableCell>{row.app_date || '—'}</TableCell>
                  <TableCell>
                    <ReviewStatusChip status={row.app_status || status} />
                  </TableCell>
                  <TableCell>{row.pairing || '—'}</TableCell>
                  <TableCell>{row.email || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}
