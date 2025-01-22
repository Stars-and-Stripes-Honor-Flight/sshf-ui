import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Image from 'next/image';

export function SplitLayout({ children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 800px' }, minHeight: '100%' }}>
      <Box
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'var(--mui-palette-background-level1)',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          p: 3,
        }}
      >
        <Stack spacing={4} sx={{ maxWidth: '800px' }}>
          <Stack spacing={1}>
            <Typography variant="h4">Welcome to the Stars and Stripes Honor Flight App</Typography>
            <Typography color="text.secondary">
              If you are looking to submit a veteran application, please click the button below.
            </Typography>
            <Link href="https://www.starsandstripeshonorflight.org/veteran-application/">Veteran Application Link</Link>
          </Stack>
          <Stack
            direction="row"
            spacing={3}
            sx={{ alignItems: 'center', color: 'var(--mui-palette-neutral-500)', flexWrap: 'wrap' }}
          >
            <Image height={140} width={140} src="/assets/AirForce.png" />
            <Image height={140} width={140} src="/assets/Army.png" />
            <Image height={140} width={140} src="/assets/CoastGuard.png" />
            <Image height={140} width={140} src="/assets/Marines.png" />
            <Image height={140} width={140} src="/assets/Navy.png" />
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ boxShadow: 'var(--mui-shadows-8)', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Box sx={{ maxWidth: '420px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
