'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/custom/client';
import { useUser } from '@/hooks/use-user';
import { DynamicLogo } from '@/components/core/logo';
import { toast } from '@/components/core/toaster';

const oAuthProviders = [
  { id: 'google', name: 'Google', logo: '/assets/logo-google.svg' }
];

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

const defaultValues = { email: '', password: '' };

export function SignInForm() {

  const router = useRouter();

  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState();

  const [isPending, setIsPending] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues, resolver: zodResolver(schema) });

  const onAuth = React.useCallback(async (providerId) => {
    setIsPending(true);

    const { error } = await authClient.signInWithOAuth({ provider: providerId });

    if (error) {
      setIsPending(false);
      toast.error(error);
      return;
    }

    setIsPending(false);

    // Redirect to OAuth provider
  }, []);

  const onSubmit = React.useCallback(
    async (values) => {
      setIsPending(true);

      const { error } = await authClient.signInWithPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={4}>
      <div>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DynamicLogo colorDark="light" colorLight="dark" height={200} width={200} />
        </Box>
      </div>
      <Stack spacing={3}>
        <Stack spacing={2}>
          {oAuthProviders.map((provider) => (
            <Button
              color="secondary"
              disabled={isPending}
              endIcon={<Box alt="" component="img" height={24} src={provider.logo} width={24} />}
              key={provider.id}
              onClick={() => {
                onAuth(provider.id).catch(() => {
                  // noop
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
