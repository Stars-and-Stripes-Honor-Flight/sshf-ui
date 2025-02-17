'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';
import { PropertyItem } from '@/components/core/property-item';
import { PropertyList } from '@/components/core/property-list';

export function VeteranModal({ open }) {
  const router = useRouter();

  // This component should load the veteran from the API based on the veteranId prop.
  // For now using static data as example

  const handleClose = React.useCallback(() => {
    router.push(paths.main.veterans.list);
  }, [router]);

  return (
    <Dialog
      maxWidth="sm"
      onClose={handleClose}
      open={open}
      sx={{
        '& .MuiDialog-container': { justifyContent: 'flex-end' },
        '& .MuiDialog-paper': { height: '100%', width: '100%' },
      }}
    >
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', flex: '0 0 auto', justifyContent: 'space-between' }}>
          <Typography variant="h6">VET-001</Typography>
          <IconButton onClick={handleClose}>
            <XIcon />
          </IconButton>
        </Stack>
        <Stack spacing={3} sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Details</Typography>
              <Button
                color="secondary"
                component={RouterLink}
                href={paths.main.veterans.details('VET-001')}
                startIcon={<PencilSimpleIcon />}
              >
                Edit
              </Button>
            </Stack>
            <Card sx={{ borderRadius: 1 }} variant="outlined">
              <PropertyList divider={<Divider />} sx={{ '--PropertyItem-padding': '12px 24px' }}>
                {[
                  { key: 'Name', value: 'Theodore Gene Atkinson' },
                  { key: 'Branch', value: 'Navy' },
                  { key: 'War Era', value: 'Vietnam' },
                  { key: 'Flight Group', value: 'SSHF-Nov2024' },
                  { key: 'Medical Level', value: '3' },
                  {
                    key: 'Status',
                    value: (
                      <Chip
                        icon={<CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />}
                        label="Active"
                        size="small"
                        variant="outlined"
                      />
                    ),
                  },
                  {
                    key: 'Application Date',
                    value: dayjs('2024-01-29').format('MMMM D, YYYY'),
                  },
                ].map((item) => (
                  <PropertyItem key={item.key} name={item.key} value={item.value} />
                ))}
              </PropertyList>
            </Card>
            <Stack spacing={3}>
              <Typography variant="h6">Contact Information</Typography>
              <Card sx={{ borderRadius: 1 }} variant="outlined">
                <PropertyList divider={<Divider />} sx={{ '--PropertyItem-padding': '12px 24px' }}>
                  {[
                    { key: 'Address', value: '1549 South 76th Street' },
                    { key: 'City', value: 'West Allis, WI 53214' },
                    { key: 'Phone', value: '414-607-0014' },
                    { key: 'Email', value: 'tgatkinson@msn.com' },
                  ].map((item) => (
                    <PropertyItem key={item.key} name={item.key} value={item.value} />
                  ))}
                </PropertyList>
              </Card>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
} 