'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ReviewApplicationEditForm } from '@/components/main/review/review-application-edit-form';
import { api } from '@/lib/api';
import { paths } from '@/paths';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get('id');

  const [application, setApplication] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    document.title = 'Review Application | Stars and Stripes Honor Flight';
  }, []);

  React.useEffect(() => {
    if (!applicationId) {
      setError('No application ID provided');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getReviewApplication(applicationId);
        if (!cancelled) {
          setApplication(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load application');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Review application</Typography>
          <Button variant="text" onClick={() => router.push(paths.main.review.applications.list)}>
            Back to queue
          </Button>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : null}

        {error ? <Alert severity="error">{error}</Alert> : null}

        {application ? (
          <ReviewApplicationEditForm
            application={application}
            onApplicationUpdated={setApplication}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
