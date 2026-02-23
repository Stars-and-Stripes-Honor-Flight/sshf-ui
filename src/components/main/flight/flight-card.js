'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Circle } from '@phosphor-icons/react/dist/ssr/Circle';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';

import { dayjs } from '@/lib/dayjs';
import { formatFlightNameForDisplay } from '@/lib/flights';
import { FlightExportMenu } from './flight-export-menu';

export function FlightCard({ flight }) {
  const router = useRouter();

  if (!flight) {
    return null;
  }

  const isCompleted = flight.completed;
  const statusColor = isCompleted ? 'info' : 'success';
  const statusLabel = isCompleted ? 'Completed' : 'Active';

  const handleFlightClick = () => {
    router.push(`/flights/details?id=${flight._id}`);
  };

  return (
    <Card 
      onClick={handleFlightClick}
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ 
        pt: 2, 
        px: 2, 
        pb: '16px !important',
        '&:last-child': { 
          paddingBottom: '16px !important' 
        }
      }}>
        <Stack spacing={2}>
          {/* Header: Icon and Flight Name */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                bgcolor: 'var(--mui-palette-background-level1)',
                borderRadius: 1.5,
                p: '12px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AirplaneTiltIcon 
                size={40} 
                color={isCompleted ? 'var(--mui-palette-info-main)' : 'var(--mui-palette-success-main)'} 
                weight="fill" 
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  mb: 0.5
                }}
              >
                {formatFlightNameForDisplay(flight.name)}
              </Typography>
              <Chip
                label={statusLabel}
                color={statusColor}
                size="small"
                icon={isCompleted ? <CheckCircle weight="fill" /> : <Circle weight="fill" />}
                sx={{
                  borderRadius: 1,
                  fontWeight: 'medium',
                  height: '24px'
                }}
              />
            </Box>
            <FlightExportMenu 
              flightName={flight.name}
              stopPropagation={true}
            />
            {/* Menu removed - now handled by FlightExportMenu component */}
          </Stack>

          {/* Flight Details */}
          <Stack spacing={1.5}>
            {/* Flight Date */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Calendar size={20} color="var(--mui-palette-text-secondary)" weight="regular" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                  Flight Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {dayjs(flight.flight_date).format('MMMM DD, YYYY')}
                </Typography>
              </Box>
            </Stack>

            {/* Capacity */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Users size={20} color="var(--mui-palette-text-secondary)" weight="regular" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                  Capacity
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {flight.capacity} {flight.capacity === 1 ? 'person' : 'people'}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
