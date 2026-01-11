'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Eye, Gear, LinkBreak } from '@phosphor-icons/react';
import { paths } from '@/paths';

export function PairingDisplay({ 
  pairings = [], 
  singlePairing = null, // For single pairing (veteran form with one guardian)
  type = 'guardian', // 'guardian' or 'veteran'
  onManageClick,
  emptyMessage = null
}) {
  const router = useRouter();
  
  // Normalize to array: use singlePairing if provided, otherwise use pairings array
  const normalizedPairings = React.useMemo(() => {
    if (singlePairing && singlePairing.id && singlePairing.name) {
      return [singlePairing];
    }
    return Array.isArray(pairings) ? pairings : [];
  }, [pairings, singlePairing]);
  
  const getEmptyMessage = () => {
    if (emptyMessage) return emptyMessage;
    return type === 'guardian' 
      ? 'No Guardian Paired' 
      : 'No Veterans Paired';
  };
  
  const getDetailsPath = (id) => {
    return type === 'guardian' 
      ? paths.main.guardians.details(id)
      : paths.main.veterans.details(id);
  };
  
  const handlePairingClick = (id, event) => {
    // Prevent default link behavior
    event.preventDefault();
    
    // Check for modifier keys or middle-click
    const isModifierClick = event.ctrlKey || event.metaKey;
    const isMiddleClick = event.button === 1;
    
    // For middle-click or modifier+click, open in new tab
    if (isMiddleClick || isModifierClick) {
      window.open(getDetailsPath(id), '_blank');
      return;
    }
    
    // For regular left-click, use router
    router.push(getDetailsPath(id));
  };
  
  // Only show gear icon for veteran pairings (on guardian page), not for guardian pairings (on veteran page)
  const showManageButton = type === 'veteran' && onManageClick;

  if (normalizedPairings.length === 0) {
    return (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LinkBreak size={16} color="var(--mui-palette-warning-main)" />
            <Typography variant="caption" color="text.secondary">
              {getEmptyMessage()}
            </Typography>
          </Stack>
          {showManageButton && (
            <Tooltip title="Manage Pairings" arrow placement="top">
              <IconButton
                size="small"
                onClick={onManageClick}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <Gear size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    );
  }
  
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {type === 'guardian' ? 'Paired Guardian' : 'Paired Veterans'}
        </Typography>
        {showManageButton && (
          <Tooltip title="Manage Pairings" arrow placement="top">
            <IconButton
              size="small"
              onClick={onManageClick}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Gear size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Stack spacing={1}>
        {normalizedPairings.map((pairing, index) => (
          <a
            key={pairing.id || index}
            href={getDetailsPath(pairing.id)}
            onClick={(event) => handlePairingClick(pairing.id, event)}
            style={{
              textDecoration: 'none',
              display: 'block'
            }}
          >
            <Card
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main'
                }
              }}
            >
              <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.primary">
                    {pairing.name}
                  </Typography>
                  <Eye size={16} color="var(--mui-palette-primary-main)" />
                </Stack>
              </CardContent>
            </Card>
          </a>
        ))}
      </Stack>
    </Box>
  );
}

