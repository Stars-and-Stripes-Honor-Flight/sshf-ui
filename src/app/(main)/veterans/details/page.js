'use client'

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { useSearchParams } from 'next/navigation';

import { paths } from '@/paths';
import { config } from '@/config';
import { VeteranEditForm } from '@/components/main/search/search-edit-form';
import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';

export default function Page() {
  const initialized = React.useRef(false);
  const urlParams = useSearchParams();
  const [veteran, setVeteran] = React.useState({});

  React.useEffect(() => {
    document.title = 'Loading Veteran...';
    async function fetchVeteran() {
      try {
        await api({ 
          entity: `ClientFieldVeteran`,
          id: urlParams.get("id"),
        })
        .then((response) => {
          if (response.status == "200") {
            response.json().then(json => {
              document.title = `Edit Veteran - ${json.clientFieldValue} | ${config.site.name}`;
              setVeteran(json);
            });
          } else {
            toast.error('Something went wrong! Or we could not find this Veteran Record');
          }
          
        })
      } catch (error) {
        console.log(error)
      }
    }
    if (!initialized.current) {
      initialized.current = true
      fetchVeteran();
    }
  }, []);


  return (
    <React.Suspense>
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
              <Typography variant="h4">Edit veteran</Typography>
            </div>
          </Stack>
          <VeteranEditForm
            veteran = {veteran}
          />
        </Stack>
      </Box>
    </React.Suspense>
  );
}
