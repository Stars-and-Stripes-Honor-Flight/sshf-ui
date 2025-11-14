'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { config } from '@/config';
import { paths } from '@/paths';

export default function Page() {
  React.useEffect(() => {
    document.title = `Guardian Details | ${config.site.name}`;
  }, []);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Box
        sx={{
          maxWidth: 'var(--Content-maxWidth)',
          m: 'var(--Content-margin)',
          p: 'var(--Content-padding)',
          width: 'var(--Content-width)',
        }}
      >
        <Stack spacing={4} sx={{ alignItems: 'center' }}>
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.lighter',
                    borderRadius: '50%',
                    p: 3,
                    display: 'inline-flex'
                  }}
                >
                  <MagnifyingGlassIcon size={48} color="var(--mui-palette-primary-main)" weight="duotone" />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Guardian Details
                </Typography>
                
                <Typography variant="body1" color="text.secondary">
                  Use our search feature to find a specific guardian. From the search results, you can view and edit guardian details.
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  href={paths.main.search.list}
                  startIcon={<MagnifyingGlassIcon size={20} />}
                  sx={{ mt: 2 }}
                >
                  Go to Search
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}

