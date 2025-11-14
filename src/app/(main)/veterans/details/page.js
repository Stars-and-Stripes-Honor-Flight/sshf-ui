'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';
import { VeteranEditForm } from '@/components/main/veteran/veteran-edit-form';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const veteranId = searchParams.get('id');
  const returnUrl = searchParams.get('returnUrl') || paths.main.search.list;
  
  const [veteran, setVeteran] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchVeteran = async () => {
      try {
        setLoading(true);
        const data = await api.getVeteran(veteranId);
        setVeteran(data);
      } catch (err) {
        console.error('Failed to fetch veteran details:', err);
        setError('Failed to load veteran details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (veteranId) {
      fetchVeteran();
    } else {
      setError('No veteran ID provided');
      setLoading(false);
    }
  }, [veteranId]);

  React.useEffect(() => {
    document.title = `Veteran Details | ${config.site.name}`;
  }, []);

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
            <Typography variant="h4">Veteran Details</Typography>
          </div>
          
          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && veteran && (
            <VeteranEditForm veteran={veteran} returnUrl={returnUrl} />
          )}
        </Stack>
      </Box>
    </Box>
  );
} 