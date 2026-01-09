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
import { GuardianEditForm } from '@/components/main/guardian/guardian-edit-form';
import { api } from '@/lib/api';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/components/core/unsaved-changes-dialog';
import { initializeCurrentPage, getBackLinkText } from '@/lib/navigation-stack';

export default function Page() {
  const searchParams = useSearchParams();
  const guardianId = searchParams.get('id');
  
  const [guardian, setGuardian] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [backLinkText, setBackLinkText] = React.useState('Back to Search');
  const [isDirty, setIsDirty] = React.useState(false);
  
  // Initialize this page in navigation stack and determine back link text
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize current page in the stack
      initializeCurrentPage('guardian-details', 'Guardian Details');
      
      // Get back link text from previous navigation entry
      setBackLinkText(getBackLinkText());
    }
  }, []);
  
  // Use shared navigation back hook
  const baseHandleGoBack = useNavigationBack();
  
  // Use unsaved changes hook for page-level navigation
  const {
    handleNavigation: handleGoBack,
    unsavedChangesDialogOpen,
    handleDiscardChanges,
    handleCloseDialog,
    entityType,
  } = useUnsavedChanges({
    isDirty,
    onNavigate: baseHandleGoBack,
    entityType: 'guardian',
    interceptRouter: true, // Intercept browser back button
  });
  
  // Handle form navigation ready callback
  const handleNavigationReady = React.useCallback(({ isDirty: formIsDirty }) => {
    setIsDirty(formIsDirty);
  }, []);

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
            <GuardianEditForm 
              guardian={guardian} 
              onNavigationReady={handleNavigationReady}
              onNavigate={handleGoBack}
            />
          )}
          
          <UnsavedChangesDialog
            open={unsavedChangesDialogOpen}
            onClose={handleCloseDialog}
            onDiscard={handleDiscardChanges}
            entityType={entityType}
          />
        </Stack>
      </Box>
    </Box>
  );
} 