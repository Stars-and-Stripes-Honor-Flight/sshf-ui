'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';

import { paths } from '@/paths';
import { DataTable } from '@/components/core/data-table';

const columns = [
  {
    formatter: (row) => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <div>
          <Link
            color="text.primary"
            component={RouterLink}
            href={paths.main.veterans.preview(row.id)}
            sx={{ whiteSpace: 'nowrap' }}
            variant="subtitle2"
          >
            {`${row.name.first} ${row.name.last}`}
          </Link>
          <Typography color="text.secondary" variant="body2">
            {row.service.branch}
          </Typography>
        </div>
      </Stack>
    ),
    name: 'Name',
    width: '250px',
  },
  { 
    formatter: (row) => row.vet_type,
    name: 'War Era', 
    width: '120px' 
  },
  {
    formatter: (row) => row.flight.group || 'Unassigned',
    name: 'Flight',
    width: '150px'
  },
  {
    formatter: (row) => row.medical.level,
    name: 'Medical',
    width: '100px'
  },
  {
    formatter: (row) => {
      const mapping = {
        Active: { 
          label: 'Active', 
          icon: <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />
        },
        Flown: {
          label: 'Flown',
          icon: <CheckCircleIcon color="var(--mui-palette-info-main)" weight="fill" />
        },
        'Future-Spring': {
          label: 'Future Spring',
          icon: <ClockIcon color="var(--mui-palette-warning-main)" />
        },
        'Future-Fall': {
          label: 'Future Fall', 
          icon: <ClockIcon color="var(--mui-palette-warning-main)" />
        }
      };
      const { label, icon } = mapping[row.flight.status] ?? { label: row.flight.status, icon: null };

      return <Chip icon={icon} label={label} size="small" variant="outlined" />;
    },
    name: 'Status',
    width: '150px',
  },
  {
    formatter: (row) => (
      <IconButton component={RouterLink} href={paths.main.veterans.preview(row.id)}>
        <EyeIcon />
      </IconButton>
    ),
    name: 'Actions',
    hideName: true,
    width: '100px',
    align: 'right',
  },
];

export function VeteransTable({ rows = [] }) {
  return (
    <React.Fragment>
      <DataTable columns={columns} rows={rows} />
      {!rows.length ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
            No veterans found
          </Typography>
        </Box>
      ) : null}
    </React.Fragment>
  );
} 