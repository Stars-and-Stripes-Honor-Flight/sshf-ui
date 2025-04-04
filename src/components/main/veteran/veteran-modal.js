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
import Image from 'next/image';

import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';
import { PropertyItem } from '@/components/core/property-item';
import { PropertyList } from '@/components/core/property-list';

const getBranchImage = (branch) => {
  const images = {
    'Air Force': '/assets/AirForce.png',
    'Army': '/assets/Army.png',
    'Coast Guard': '/assets/CoastGuard.png',
    'Marines': '/assets/Marines.png',
    'Navy': '/assets/Navy.png'
  };
  return images[branch] || '';
};

export function VeteranModal({ open, veteran }) {
  const router = useRouter();

  const handleClose = React.useCallback(() => {
    router.push(paths.main.veterans.list);
  }, [router]);

  if (!veteran) {
    return null;
  }

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
          <IconButton onClick={handleClose}>
            <XIcon />
          </IconButton>
        </Stack>
        <Stack spacing={3} sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Veteran Details</Typography>
              <Button
                color="secondary"
                component={RouterLink}
                href={paths.main.veterans.details(veteran.id)}
                startIcon={<PencilSimpleIcon />}
              >
                Edit
              </Button>
            </Stack>
            <Card sx={{ borderRadius: 1 }} variant="outlined">
              <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                    <Image
                      src={getBranchImage(veteran.service.branch)}
                      alt={veteran.service.branch}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                  <Stack spacing={1}>
                    <Typography variant="h6">
                      {veteran.name.first} {veteran.name.middle} {veteran.name.last}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {veteran.service.branch} - {veteran.service.rank}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {veteran.vet_type}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                  {veteran.service.dates}
                </Typography>
              </Stack>
              <Divider />
              <PropertyList divider={<Divider />} sx={{ '--PropertyItem-padding': '12px 24px' }}>
                <PropertyItem name="Status" value={
                  <Chip
                    icon={<CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />}
                    label={veteran.flight.status}
                    size="small"
                    variant="outlined"
                  />
                } />
                <PropertyItem name="Phone" value={veteran.address.phone_day || 'N/A'} />
                <PropertyItem name="Email" value={veteran.address.email || 'N/A'} />
                <PropertyItem name="Birth Date" value={dayjs(veteran.birth_date).format('MMMM D, YYYY')} />
                <PropertyItem name="Application Date" value={dayjs(veteran.app_date).format('MMMM D, YYYY')} />
              </PropertyList>
            </Card>
            <Stack spacing={3}>
              <Typography variant="h6">Flight Information</Typography>
              <Card sx={{ borderRadius: 1 }} variant="outlined">
                <PropertyList divider={<Divider />} sx={{ '--PropertyItem-padding': '12px 24px' }}>
                  <PropertyItem name="Flight Group" value={veteran.flight.group || 'Unassigned'} />
                  <PropertyItem name="Bus" value={veteran.flight.bus || 'Not Assigned'} />
                  <PropertyItem name="Seat" value={veteran.flight.seat || 'Not Assigned'} />
                  <PropertyItem name="Status Note" value={veteran.flight.status_note || 'None'} />
                  <PropertyItem name="Waiver" value={
                    <Chip
                      label={veteran.flight.waiver ? "Received" : "Not Received"}
                      color={veteran.flight.waiver ? "success" : "warning"}
                      size="small"
                      variant="outlined"
                    />
                  } />
                </PropertyList>
              </Card>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
} 