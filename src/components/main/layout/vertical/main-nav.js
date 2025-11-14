'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';

import { MobileNav } from '../mobile-nav';
import { UserPopover } from '../user-popover/user-popover';

export function MainNav({ items }) {
  const [openNav, setOpenNav] = React.useState(false);
  const { user } = useUser();

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
          }}
        >
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

