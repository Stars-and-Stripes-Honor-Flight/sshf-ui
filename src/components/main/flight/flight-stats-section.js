'use client';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Bus as BusIcon } from '@phosphor-icons/react/dist/ssr/Bus';

/**
 * FlightStatsSection - Collapsible accordion wrapper for flight statistics.
 * 
 * @param {Object} props
 * @param {Object} props.stats - Flight statistics object with flight, tours, and buses breakdowns
 * @param {string} props.flightId - Flight ID for sessionStorage key
 * @returns {JSX.Element}
 */
export function FlightStatsSection({ stats, flightId }) {
  const storageKey = `flight-stats-expanded-${flightId}`;
  
  // Initialize expanded state from sessionStorage, default to collapsed (false)
  const [expanded, setExpanded] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const handleChange = (event, isExpanded) => {
    setExpanded(isExpanded);
    try {
      sessionStorage.setItem(storageKey, String(isExpanded));
    } catch {
      // Silently ignore storage errors (quota, private browsing, etc.)
    }
  };

  if (!stats) {
    return null;
  }

  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleChange}
      sx={{
        '&:before': { display: 'none' }, // Remove default MUI divider
        boxShadow: 'var(--mui-shadows-8)',
        borderRadius: 1,
        '&.Mui-expanded': {
          margin: 0, // Override MUI's default expanded margin
        }
      }}
    >
      <AccordionSummary
        expandIcon={<CaretDownIcon size={20} />}
        aria-controls="flight-stats-content"
        id="flight-stats-header"
        sx={{
          '& .MuiAccordionSummary-content': {
            my: 1.5,
          }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Flight Statistics
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
            {/* Flight & Tour Stats Combined */}
            <Card sx={{ flex: '1 1 auto', minWidth: 250 }}>
              <CardContent>
                <Stack spacing={2.5}>
                  {/* Flight Stats */}
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <AirplaneTiltIcon size={20} />
                      <Typography color="text.secondary" variant="caption">
                        Flight Breakdown
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {Object.entries(stats.flight).map(([key, value]) => (
                        <Box 
                          key={key} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            ...(key === 'None' && value > 0 && { 
                              backgroundColor: 'rgba(211, 47, 47, 0.08)', 
                              p: 1, 
                              borderRadius: 0.5 
                            }) 
                          }}
                        >
                          <Typography variant="body2">{key}</Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              ...(key === 'None' && value > 0 && { 
                                color: 'var(--mui-palette-error-main)' 
                              }) 
                            }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ borderTop: 1, borderColor: 'divider' }} />

                  {/* Tour Stats */}
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <UsersIcon size={20} />
                      <Typography color="text.secondary" variant="caption">
                        Tour Breakdown
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {Object.entries(stats.tours).map(([key, value]) => (
                        <Box 
                          key={key} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            ...(key === 'None' && value > 0 && { 
                              backgroundColor: 'rgba(211, 47, 47, 0.08)', 
                              p: 1, 
                              borderRadius: 0.5 
                            }) 
                          }}
                        >
                          <Typography variant="body2">{key}</Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              ...(key === 'None' && value > 0 && { 
                                color: 'var(--mui-palette-error-main)' 
                              }) 
                            }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Bus Capacity */}
            <Card sx={{ flex: '1 1 auto', minWidth: 250, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <BusIcon size={20} />
                  <Typography color="text.secondary" variant="caption">
                    Bus Breakdown
                  </Typography>
                </Stack>
                <Stack spacing={1.5} sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                  {Object.entries(stats.buses).map(([bus, count]) => (
                    <Box 
                      key={bus} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        ...(bus === 'None' && count > 0 && { 
                          backgroundColor: 'rgba(211, 47, 47, 0.08)', 
                          p: 1, 
                          borderRadius: 0.5 
                        }) 
                      }}
                    >
                      <Typography variant="body2">{bus}</Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          ...(bus === 'None' && count > 0 && { 
                            color: 'var(--mui-palette-error-main)' 
                          }) 
                        }}
                      >
                        {count}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
