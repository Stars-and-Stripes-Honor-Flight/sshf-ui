'use client';

import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Warning } from '@phosphor-icons/react';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';

import { MobileNav } from '../mobile-nav';
import { UserPopover } from '../user-popover/user-popover';

export function MainNav({ items }) {
  const [openNav, setOpenNav] = React.useState(false);
  const { user } = useUser();
  const [isTestEnvironment, setIsTestEnvironment] = React.useState(false);
  
  // Show test environment indicator if NODE_ENV is not production or if explicitly set
  // Only check on client side to avoid hydration mismatches
  React.useEffect(() => {
    const isTest = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_TEST_BANNER === 'true';
    setIsTestEnvironment(isTest);
  }, []);

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          '--MainNav-background': 'var(--mui-palette-background-default)',
          '--MainNav-divider': 'var(--mui-palette-divider)',
          bgcolor: 'var(--MainNav-background)',
          left: 0,
          position: 'sticky',
          pt: { lg: 'var(--Layout-gap)' },
          top: 0,
          width: '100%',
          zIndex: 'var(--MainNav-zIndex)',
        }}
      >
        <Box
          sx={{
            borderBottom: '1px solid var(--MainNav-divider)',
            display: 'flex',
            flex: '1 1 auto',
            minHeight: 'var(--MainNav-height)',
            px: { xs: 2, lg: 3 },
            py: 1,
            position: 'relative',
          }}
        >
          {isTestEnvironment ? (
            <>
              {/* Mobile menu button - positioned absolutely on the left */}
              <IconButton
                onClick={() => {
                  setOpenNav(true);
                }}
                sx={{ 
                  display: { lg: 'none' },
                  position: 'absolute',
                  left: { xs: 2 },
                  zIndex: 1,
                }}
              >
                <ListIcon />
              </IconButton>
              
              {/* Test Environment Banner - takes up full width */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: { xs: 5, md: 3 },
                  mr: { xs: 4, md: 4 },
                  ml: { xs: 4, md: 0 },
                  py: 1,
                  backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.35),
                  width: '100%',
                  justifyContent: 'center',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                      boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.4)',
                    },
                    '50%': {
                      opacity: 0.95,
                      boxShadow: '0 0 0 6px rgba(255, 152, 0, 0.1)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    animation: 'wiggle 2s ease-in-out infinite',
                    '@keyframes wiggle': {
                      '0%, 100%': { transform: 'rotate(0deg)' },
                      '25%': { transform: 'rotate(-10deg)' },
                      '75%': { transform: 'rotate(10deg)' },
                    },
                  }}
                >
                  <Warning 
                    weight="fill" 
                    size={20}
                    style={{
                      color: 'var(--mui-palette-warning-dark)',
                    }}
                  />
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                    color: 'warning.darker',
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🧪 TEST ENVIRONMENT
                </Box>
              </Box>
              
              {/* Avatar - positioned absolutely on the right */}
              <Box
                sx={{
                  position: 'absolute',
                  right: { xs: 2, lg: 3 },
                  zIndex: 1,
                }}
              >
                <UserButton user={ user } />
              </Box>
            </>
          ) : (
            <>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
                <IconButton
                  onClick={() => {
                    setOpenNav(true);
                  }}
                  sx={{ display: { lg: 'none' } }}
                >
                  <ListIcon />
                </IconButton>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}
              >
                <ContactsButton />
                <Divider
                  flexItem
                  orientation="vertical"
                  sx={{ borderColor: 'var(--MainNav-divider)', display: { xs: 'none', lg: 'block' } }}
                />
                <UserButton user={ user } />
              </Stack>
            </>
          )}
        </Box>
      </Box>
      <MobileNav
        items={items}
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}

function ContactsButton() {
  return (
    <React.Fragment>
    </React.Fragment>
  );
}


function Client({ client }) {
  return (
    <Tooltip title={ "Stars and Stripes Honor Flight" }>
        <Box sx={{ height: '40px', width: '40px' }}>
          <Box alt={ "Stars and Stripes Honor Flight" } component="img" src={ "https://avatars.githubusercontent.com/u/189932599?s=200&v=4" } sx={{ height: 'auto', width: '100%' }} />
        </Box>
    </Tooltip>
  );
}

function UserButton({ user }) {
  const popover = usePopover();

  return (
    <React.Fragment>
      <Box
        component="button"
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        sx={{ border: 'none', background: 'transparent', cursor: 'pointer', p: 0 }}
      >
        <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          color="success"
          sx={{
            '& .MuiBadge-dot': {
              border: '2px solid var(--MainNav-background)',
              borderRadius: '50%',
              bottom: '6px',
              height: '12px',
              right: '6px',
              width: '12px',
            },
          }}
          variant="dot"
        >
          <Avatar src={user?.avatar} />
        </Badge>
      </Box>
      <UserPopover user={ user } anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
    </React.Fragment>
  );
}

