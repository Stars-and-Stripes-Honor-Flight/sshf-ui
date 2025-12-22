'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';

export function StickyHeader({ 
  name, 
  status, 
  statusColor, 
  additionalInfo,
  type = 'veteran',
  nickname,
  fullName
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Show header when scrolled down more than 100px
      const scrollY = window.scrollY || window.pageYOffset;
      setIsVisible(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = nickname || name;
  if (!displayName) return null;

  return (
    <Slide direction="down" in={isVisible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, lg: 'var(--SideNav-width)' },
          right: 0,
          zIndex: 1300,
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: (theme) => theme.shadows[4],
          px: 3,
          py: 2
        }}
      >
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          justifyContent="space-between"
          sx={{
            maxWidth: 'var(--Content-maxWidth)',
            margin: '0 auto',
            width: '100%'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flex={1} sx={{ minWidth: 0 }}>
            {nickname ? (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {nickname}
                </Typography>
                {fullName && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      fontStyle: 'italic',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {fullName}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  minWidth: 0
                }}
              >
                {name}
              </Typography>
            )}
            {status && (
              <Chip
                label={status}
                color={statusColor || 'default'}
                size="small"
                sx={{
                  borderRadius: 1,
                  fontWeight: 'medium',
                  flexShrink: 0
                }}
              />
            )}
            {additionalInfo && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {additionalInfo}
              </Typography>
            )}
          </Stack>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              flexShrink: 0,
              display: { xs: 'none', md: 'block' }
            }}
          >
            {type === 'veteran' ? 'Editing Veteran' : 'Editing Guardian'}
          </Typography>
        </Stack>
      </Box>
    </Slide>
  );
}

