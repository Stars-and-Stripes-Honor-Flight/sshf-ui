'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/domain/client';
import { useUser } from '@/hooks/use-user';
import { DynamicLogo } from '@/components/core/logo';
import { toast } from '@/components/core/toaster';

const oAuthProviders = [
  { id: 'google', name: 'Google', logo: '/assets/logo-google.svg' }
];

export function SignInForm() {
  const router = useRouter();
  const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState(false);

  const onAuth = React.useCallback(async (providerId) => {
    setIsPending(true);

    try {
      const { error, data } = await authClient.signInWithOAuth({ provider: providerId });

      if (error) {
        toast.error(error);
        return;
      }

      if (!data) {
        toast.error('Authentication failed');
        return;
      }

      // Successfully authenticated - refresh the session
      await checkSession?.();
      
      // Redirect to the main application
      router.push(paths.main.search.list);
      
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setIsPending(false);
    }
  }, [checkSession, router]);

  return (
    <Stack spacing={4}>
      <div>
        <Box 
          component={RouterLink} 
          href={paths.home} 
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <DynamicLogo colorDark="light" colorLight="dark" height={200} width={200} />
        </Box>
      </div>
      <Stack spacing={3}>
        <Stack spacing={2}>
          {oAuthProviders.map((provider) => (
            <Button
              color="secondary"
              disabled={isPending}
              endIcon={
                <Box 
                  alt="" 
                  component="img" 
                  height={24} 
                  src={provider.logo} 
                  width={24} 
                />
              }
              key={provider.id}
              onClick={() => {
                onAuth(provider.id).catch(() => {
                  toast.error('Authentication failed');
                });
              }}
              variant="outlined"
            >
              Continue with {provider.name}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
