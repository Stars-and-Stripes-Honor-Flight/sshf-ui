'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { config } from '@/config';
import { paths } from '@/paths';
import { VeteranEditForm } from '@/components/main/veteran/veteran-edit-form';
import { api } from '@/lib/api';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/components/core/unsaved-changes-dialog';

export default function Page() {
  const searchParams = useSearchParams();
  const veteranId = searchParams.get('id');
  
  const [veteran, setVeteran] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isDirty, setIsDirty] = React.useState(false);
  
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
    entityType: 'veteran',
    interceptRouter: true, // Intercept browser back button
  });
  
  // Handle form navigation ready callback
  const handleNavigationReady = React.useCallback(({ isDirty: formIsDirty }) => {
    setIsDirty(formIsDirty);
  }, []);

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
            <VeteranEditForm 
              veteran={veteran} 
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