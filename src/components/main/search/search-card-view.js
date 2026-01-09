'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { MedalMilitary as MedalMilitaryIcon } from '@phosphor-icons/react/dist/ssr/MedalMilitary';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';
import { LinkBreak } from '@phosphor-icons/react/dist/ssr/LinkBreak';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';

import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';
import { pushNavigationEntry } from '@/lib/navigation-stack';
import { formatFlightNameForDisplay } from '@/lib/flights';

// Store search URL when navigating to details page
const handleCardClick = (isVeteran, detailUrl, veteranId) => {
  if (typeof window !== 'undefined') {
    const searchUrl = window.location.pathname + window.location.search;
    // Store search URL for back navigation
    sessionStorage.setItem('searchUrl', searchUrl);
    
    // If veteranId is present and clicking on a guardian, store it in session storage
    // (instead of URL to avoid extra back button presses)
    if (!isVeteran && veteranId) {
      sessionStorage.setItem('pairingVeteranId', veteranId);
    }
    
    // Track navigation to detail page
    pushNavigationEntry({
      type: isVeteran ? 'veteran-details' : 'guardian-details',
      url: detailUrl,
      title: 'Back to Search',
    });
  }
};

// Status color mapping to match edit screens
const getStatusColor = (status) => {
  const colors = {
    'Active': 'success',
    'Flown': 'info',
    'Deceased': 'default',
    'Removed': 'error',
    'Future-Spring': 'warning',
    'Future-Fall': 'warning',
    'Future-PostRestriction': 'warning',
    'Copied': 'default'
  };
  return colors[status] || 'default';
};

export function SearchCardView({ rows }) {
  // Get veteranId from session storage if present (for pairing flow)
  const [veteranId, setVeteranId] = React.useState(null);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVeteranId = sessionStorage.getItem('pairingVeteranId');
      setVeteranId(storedVeteranId);
    }
  }, []);

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
        
        // If veteranId is present and clicking on a guardian, it's already in session storage
        // (stored when navigating from veteran page or from search with veteranId)

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
            href={detailUrl}
            onClick={() => handleCardClick(isVeteran, detailUrl, veteranId)}
          >
            <CardContent sx={{ 
              pt: 2, 
              px: 2, 
              pb: '12px !important',
              '&:last-child': { 
                paddingBottom: '12px !important' 
              }
            }}>
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
                      sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main',
                        textDecoration: 'none'
                      }}
                    >
                      {row.name} {row.lastname}
                    </Typography>
                  </Box>
                </Stack>

                {/* Status, Flight, Pairing, and App Date */}
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 0 }}>
                  {/* Left Column: Status, Flight and Pairing */}
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    {/* Status Chip */}
                    <Chip
                      label={row.status || 'No Status'}
                      color={getStatusColor(row.status)}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        fontWeight: 'medium',
                        alignSelf: 'flex-start'
                      }}
                    />
                    {/* Flight Chip */}
                    <Chip 
                      icon={
                        <AirplaneTiltIcon 
                          color={row.flight !== "None" ? "var(--mui-palette-success-main)" : "var(--mui-palette-warning-main)"} 
                          weight="fill" 
                        />
                      }
                      label={formatFlightNameForDisplay(row.flight)}
                      size="small"
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                    {/* Pairing */}
                    {row.pairing === "None" || !row.pairing ? (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <LinkBreak color="var(--mui-palette-warning-main)" weight="regular" size={18} />
                        <Typography variant='body2'>
                          {row.type === "Veteran" ? "No Guardian Paired" : "No Veterans Paired"}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Users color="var(--mui-palette-success-main)" weight="fill" size={18} />
                        <Typography variant='body2'>{row.pairing}</Typography>
                      </Stack>
                    )}
                  </Stack>

                  {/* Right Column: Application Date */}
                  {row.appdate && (
                    <Box
                      sx={{
                        bgcolor: 'var(--mui-palette-background-level1)',
                        borderRadius: 1.5,
                        flex: '0 0 auto',
                        p: '2px 12px',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2">{dayjs(row.appdate).format('MMM').toUpperCase()}</Typography>
                      <Typography variant="h6">{dayjs(row.appdate).format('DD')} </Typography>
                      <Typography variant="caption">{dayjs(row.appdate).format('YY')}</Typography>
                    </Box>
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

