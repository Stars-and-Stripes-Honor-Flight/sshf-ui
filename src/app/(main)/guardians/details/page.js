'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';
import { GuardianEditForm } from '@/components/main/guardian/guardian-edit-form';
import { api } from '@/lib/api';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guardianId = searchParams.get('id');
  
  const [guardian, setGuardian] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [backLinkText, setBackLinkText] = React.useState('Back to Search');
  
  // Determine back link text based on previous page
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const previousPage = sessionStorage.getItem('previousPage');
      
      if (previousPage === 'veteran-details') {
        setBackLinkText('Back to Veteran Details');
      } else {
        setBackLinkText('Back to Search');
      }
    }
  }, []);
  
  // Helper function to navigate back with fallback
  const handleGoBack = React.useCallback(() => {
    // If we came from veteran details, set flag to scroll back to guardian pairing section
    const previousPage = sessionStorage.getItem('previousPage');
    
    if (previousPage === 'veteran-details') {
      sessionStorage.setItem('scrollToSection', 'guardian-pairing');
    }
    
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(paths.main.search.list);
    }
  }, [router]);

  React.useEffect(() => {
    const fetchGuardian = async () => {
      try {
        setLoading(true);
        const data = await api.getGuardian(guardianId);
        setGuardian(data);
      } catch (err) {
        console.error('Failed to fetch guardian details:', err);
        setError('Failed to load guardian details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (guardianId) {
      fetchGuardian();
    } else {
      setError('No guardian ID provided');
      setLoading(false);
    }
  }, [guardianId]);

  React.useEffect(() => {
    document.title = `Guardian Details | ${config.site.name}`;
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
              onClick={handleGoBack}
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 1, cursor: 'pointer' }}
              variant="subtitle2"
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
              {backLinkText}
            </Link>
          </div>
          <div>
            <Typography variant="h4">Guardian Details</Typography>
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
          
          {!loading && !error && guardian && (
            <GuardianEditForm guardian={guardian} />
          )}
        </Stack>
      </Box>
    </Box>
  );
} 