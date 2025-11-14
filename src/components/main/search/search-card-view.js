'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { MedalMilitary as MedalMilitaryIcon } from '@phosphor-icons/react/dist/ssr/MedalMilitary';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';

import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';

const status = {
  Active: { label: 'Active', icon: <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" /> },
  Flown: { label: 'Flown', icon: <CheckCircleIcon color="var(--mui-palette-primary-main)" weight="fill" /> },
  Deceased: { label: 'Deceased', icon: <XCircleIcon color="var(--mui-palette-error-main)" weight="fill" /> },
  Removed: { label: 'Removed', icon: <XCircleIcon color="var(--mui-palette-warning-main)" weight="fill" /> }
};

export function SearchCardView({ rows, currentUrl = '/search' }) {
  const returnUrl = encodeURIComponent(currentUrl);

  if (!rows || rows.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
          No results found
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {rows.map((row) => {
        const isVeteran = row.type === "Veteran";
        const detailUrl = isVeteran
          ? paths.main.veterans.details(row.id)
          : paths.main.guardians.details(row.id);
        const fullUrl = returnUrl ? `${detailUrl}&returnUrl=${returnUrl}` : detailUrl;
        
        const { label, icon } = status[row.status] ?? { label: 'Unknown', icon: null };

        return (
          <Card 
            key={row.id}
            sx={{ 
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              textDecoration: 'none',
              '&:hover': {
                boxShadow: 3
              }
            }}
            component={RouterLink}
            href={fullUrl}
          >
            <CardContent>
              <Stack spacing={2}>
                {/* Header: Type Icon and Name */}
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      bgcolor: 'var(--mui-palette-background-level1)',
                      borderRadius: 1.5,
                      p: '8px 12px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isVeteran ? (
                      <MedalMilitaryIcon size="40" color="#b5ccf6" weight="fill" />
                    ) : (
                      <UserIcon size="32" color="#ff9999" weight="regular" />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h6" 
                      component={RouterLink}
                      href={fullUrl}
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        color: 'primary.main',
                        textDecoration: 'none'
                      }}
                    >
                      {row.name} {row.lastname}
                    </Typography>
                    {/* Status and Flight Chips */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip icon={icon} label={label} size="small" variant="outlined" />
                      {row.flight && (
                        <Chip 
                          icon={<AirplaneTiltIcon color="var(--mui-palette-success-main)" weight="fill" />}
                          label={row.flight}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                  <EyeIcon size={20} />
                </Stack>

                <Divider />

                {/* Details Grid */}
                <Stack spacing={1.5}>
                  {/* Pairing */}
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Pairing:
                    </Typography>
                    {row.pairing === "None" || !row.pairing ? (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <XCircleIcon color="var(--mui-palette-warning-main)" weight="fill" size={16} />
                        <Typography variant="body2">None</Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" size={16} />
                        <Typography variant="body2">{row.pairing}</Typography>
                      </Stack>
                    )}
                  </Stack>

                  {/* Application Date */}
                  {row.appdate && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        App Date:
                      </Typography>
                      <Typography variant="body2">
                        {dayjs(row.appdate).format('MMM D, YYYY')}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}

