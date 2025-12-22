'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useNavigationBack } from '@/hooks/use-navigation-back';

export default function Page() {
  const searchParams = useSearchParams();
  const veteranId = searchParams.get('id');
  
  const [veteran, setVeteran] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [backLinkText, setBackLinkText] = React.useState('Back to Search');
  
  // Determine back link text based on previous page
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const previousPage = sessionStorage.getItem('previousPage');
      
      if (previousPage === 'guardian-details') {
        setBackLinkText('Back to Guardian Details');
      } else {
        setBackLinkText('Back to Search');
      }
    }
  }, []);
  
  // Use shared navigation back hook
  const handleGoBack = useNavigationBack();

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
        py: 1
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
              onClick={handleGoBack}
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 1, cursor: 'pointer' }}
              variant="subtitle2"
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
              {backLinkText}
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
            <VeteranEditForm veteran={veteran} />
          )}
        </Stack>
      </Box>
    </Box>
  );
} 