import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';
import { VeteranModal } from '@/components/main/veteran/veteran-modal';
import { VeteransFilters } from '@/components/main/veteran/veterans-filters';
import { VeteransPagination } from '@/components/main/veteran/veterans-pagination';
import { VeteransTable } from '@/components/main/veteran/veterans-table';

export const metadata = { title: `List | Veterans | Dashboard | ${config.site.name}` };

// This would come from your API
const veterans = [
  {
    id: 'VET-001',
    name: {
      first: 'Theodore',
      middle: 'Gene',
      last: 'Atkinson',
      nickname: 'Ted'
    },
    service: {
      branch: 'Navy',
      rank: 'RD3',
    },
    flight: {
      status: 'Active',
      group: 'SSHF-Nov2024',
    },
    medical: {
      level: '3',
    },
    app_date: '2024-01-29',
    birth_date: '1948-12-19',
    vet_type: 'Vietnam',
  },
  // Add more example veterans as needed
];

export default function Page({ searchParams }) {
  const { status, flightGroup, branch, previewId, sortDir } = searchParams;

  const orderedVeterans = applySort(veterans, sortDir);
  const filteredVeterans = applyFilters(orderedVeterans, { status, flightGroup, branch });

  return (
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
              <Typography variant="h4">Veterans</Typography>
            </Box>
            <div>
              <Button
                component={RouterLink}
                href={paths.main.veterans.create}
                startIcon={<PlusIcon />}
                variant="contained"
              >
                Add
              </Button>
            </div>
          </Stack>
          <Card>
            <VeteransFilters filters={{ status, flightGroup, branch }} sortDir={sortDir} />
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <VeteransTable rows={filteredVeterans} />
            </Box>
            <Divider />
            <VeteransPagination count={filteredVeterans.length} page={0} />
          </Card>
        </Stack>
      </Box>
      <VeteranModal open={Boolean(previewId)} />
    </React.Fragment>
  );
}

function applySort(rows, sortDir) {
  return rows.sort((a, b) => {
    if (sortDir === 'asc') {
      return new Date(a.app_date).getTime() - new Date(b.app_date).getTime();
    }
    return new Date(b.app_date).getTime() - new Date(a.app_date).getTime();
  });
}

function applyFilters(rows, { status, flightGroup, branch }) {
  return rows.filter((item) => {
    if (status && item.flight.status !== status) {
      return false;
    }
    if (flightGroup && item.flight.group !== flightGroup) {
      return false;
    }
    if (branch && item.service.branch !== branch) {
      return false;
    }
    return true;
  });
} 