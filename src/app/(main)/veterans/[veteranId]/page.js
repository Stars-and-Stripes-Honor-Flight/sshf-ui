'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';
import { VeteranEditForm } from '@/components/main/veteran/veteran-edit-form';

// This would normally fetch the veteran from the API based on the veteranId param
export default function Page() {
  const searchParams = useSearchParams();
  const veteranId = searchParams.get('id'); // Get the id from URL query parameter
  const returnUrl = searchParams.get('returnUrl') || paths.main.search.list;
  
  React.useEffect(() => {
    document.title = `Details | Veterans | Dashboard | ${config.site.name}`;
  }, []);

  // Using the same data as in the veterans list page
  const veterans = [
    {
      id: '29d8dae1191db7e9b9ed5dcbeb674012',
      name: {
        first: 'Carl',
        last: 'Conrad',
        middle: 'A',
        nickname: ''
      },
      address: {
        street: '250 South Forest Avenue Apt 312',
        city: 'West Bend',
        county: 'Washington',
        state: 'WI',
        zip: '53095',
        phone_day: '262-353-5392',
        phone_mbl: '',
        email: 'carlconrad606@gmail.com'
      },
      service: {
        branch: 'Navy',
        rank: 'STG3',
        dates: '13 June 1966- 12 June 1968',
        activity: ''
      },
      vet_type: 'Vietnam',
      birth_date: '1946-03-22',
      gender: 'M',
      weight: '',
      app_date: '2024-11-13',
      medical: {
        level: '',
        alt_level: '',
        food_restriction: 'None',
        usesCane: false,
        usesWalker: false,
        usesWheelchair: false,
        isWheelchairBound: false,
        usesScooter: false,
        requiresOxygen: false,
        examRequired: false,
        release: false,
        limitations: '',
        review: ''
      },
      flight: {
        status: 'Active',
        group: '',
        bus: 'None',
        seat: '',
        waiver: false
      }
    },
    {
      id: '29d8dae1191db7e9b9ed5dcbeb219056',
      name: {
        first: 'Gene',
        last: 'Cook',
        middle: 'M',
        nickname: 'Gene'
      },
      address: {
        street: '5216 County Road V',
        city: 'Franksville',
        county: 'Racine',
        state: 'WI',
        zip: '53126',
        phone_day: '262-835-2520',
        phone_mbl: '262-865-7571',
        email: 'benthorseshufarm@aol.com'
      },
      service: {
        branch: 'Army',
        rank: 'E5',
        dates: 'nov 1962/nov 1965',
        activity: ''
      },
      vet_type: 'Vietnam',
      birth_date: '1943-03-01',
      gender: 'M',
      app_date: '2024-05-06',
      medical: {
        level: '',
        alt_level: '',
        food_restriction: 'None',
        usesCane: false,
        usesWalker: false,
        usesWheelchair: false,
        isWheelchairBound: false,
        usesScooter: false,
        requiresOxygen: false,
        examRequired: false,
        release: false,
        limitations: '',
        review: ''
      },
      flight: {
        status: 'Active',
        group: 'SSHF-May2025',
        bus: 'None',
        seat: '',
        waiver: false,
        status_note: 'Guardian fee waiver.mm'
      }
    }
  ];

  // Find the veteran based on the URL query parameter
  const veteran = veterans.find(v => v.id === veteranId);

  if (!veteran) {
    return (
      <Box
        sx={{
          maxWidth: 'var(--Content-maxWidth)',
          m: 'var(--Content-margin)',
          p: 'var(--Content-padding)',
          width: 'var(--Content-width)',
        }}
      >
        <Typography color="error">Veteran not found (ID: {veteranId})</Typography>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 3
      }}
    >
      <Box
        sx={{
          px: { xs: 3, lg: 4 }
        }}
      >
        <Stack spacing={3}>
          <div>
            <Link
              color="text.primary"
              component={RouterLink}
              href={decodeURIComponent(returnUrl)}
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
              variant="subtitle2"
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
              Back to Search
            </Link>
          </div>
          <div>
            <Typography variant="h4">Edit Veteran</Typography>
          </div>
          <VeteranEditForm veteran={veteran} returnUrl={returnUrl} />
        </Stack>
      </Box>
    </Box>
  );
} 