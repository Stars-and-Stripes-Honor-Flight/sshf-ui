'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { Warning } from '@phosphor-icons/react';

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
  const [isTestEnvironment, setIsTestEnvironment] = React.useState(false);
  
  // Show test environment indicator if NODE_ENV is not production or if explicitly set
  // Only check on client side to avoid hydration mismatches
  React.useEffect(() => {
    const isTest = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_TEST_BANNER === 'true';
    setIsTestEnvironment(isTest);
  }, []);

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
          href={paths.main.search.list} 
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <DynamicLogo colorDark="light" colorLight="dark" height={200} width={200} />
        </Box>
      </div>
      <Stack spacing={3}>
        {isTestEnvironment && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              px: 3,
              py: 1.5,
              backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.35),
              width: '100%',
              borderRadius: 1,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                  boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.4)',
                },
                '50%': {
                  opacity: 0.95,
                  boxShadow: '0 0 0 6px rgba(255, 152, 0, 0.1)',
                },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                animation: 'wiggle 2s ease-in-out infinite',
                '@keyframes wiggle': {
                  '0%, 100%': { transform: 'rotate(0deg)' },
                  '25%': { transform: 'rotate(-10deg)' },
                  '75%': { transform: 'rotate(10deg)' },
                },
              }}
            >
              <Warning 
                weight="fill" 
                size={20}
                style={{
                  color: 'var(--mui-palette-warning-dark)',
                }}
              />
            </Box>
            <Box
              component="span"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '0.7rem', md: '0.8rem' },
                color: 'warning.darker',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
              }}
            >
              🧪 TEST ENVIRONMENT
            </Box>
          </Box>
        )}
        <Stack spacing={2}>
          {oAuthProviders.map((provider) => (
            <Button
              color="primary"
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
              variant="contained"
              size="large"
              sx={{
                color: '#ffffff',
                '&:hover': {
                  color: '#ffffff',
                }
              }}
            >
              Continue with {provider.name}
            </Button>
          ))}
        </Stack>
      </Stack>
      
      {/* Mobile-only buttons - hidden on large screens where split-layout shows them */}
      <Box sx={{ display: { xs: 'block', lg: 'none' }, mt: 3 }}>
        <Divider />
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Looking for something else?
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            href="https://www.starsandstripeshonorflight.org/veteran-application/"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
          >
            Veteran Application
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            href="https://www.starsandstripeshonorflight.org/"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
          >
            Visit Main Website
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
