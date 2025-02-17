import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';
import { VeteranEditForm } from '@/components/main/veteran/veteran-edit-form';

export const metadata = { title: `Details | Veterans | Dashboard | ${config.site.name}` };

// The page should load the veteran from the API based on the veteranId param and pass it to the form component.
// For now using static data as example
export default function Page() {
  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        <Stack spacing={3}>
          <div>
            <Link
              color="text.primary"
              component={RouterLink}
              href={paths.main.veterans.list}
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
              variant="subtitle2"
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
              Veterans
            </Link>
          </div>
          <div>
            <Typography variant="h4">Edit Veteran</Typography>
          </div>
        </Stack>
        <VeteranEditForm
          veteran={{
            id: 'VET-001',
            name: {
              first: 'Theodore',
              middle: 'Gene', 
              last: 'Atkinson',
              nickname: 'Ted'
            },
            address: {
              street: '1549 South 76th Street',
              city: 'West Allis',
              county: 'Milwaukee',
              state: 'WI',
              zip: '53214',
              phone_day: '414-607-0014',
              phone_mbl: '414-731-4194',
              email: 'tgatkinson@msn.com'
            },
            service: {
              branch: 'Navy',
              rank: 'RD3',
              dates: 'April 16, 1969 to August 9, 1973',
              activity: 'Radarman aboard USS Anchorage'
            },
            vet_type: 'Vietnam',
            birth_date: '1948-12-19',
            gender: 'M',
            weight: 230,
            app_date: '2024-01-29',
            medical: {
              level: '3',
              alt_level: '3',
              food_restriction: 'None',
              usesCane: false,
              usesWalker: false,
              usesWheelchair: true,
              isWheelchairBound: false,
              usesScooter: false,
              requiresOxygen: false,
              examRequired: false,
              form: true,
              release: false,
              limitations: '',
              review: ''
            },
            flight: {
              status: 'Active',
              group: 'SSHF-Nov2024',
              bus: 'Bravo4',
              seat: '07D',
              waiver: true,
              vaccinated: false
            }
          }}
        />
      </Stack>
    </Box>
  );
} 