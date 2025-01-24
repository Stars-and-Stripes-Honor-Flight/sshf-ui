'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { Members } from '@/components/main/settings/members';

export default function Page() {
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    document.title = `Team | Settings ${config.site.name}`;
  }, []);

  return (
    <Stack spacing={4}>
      <div>
        <Typography variant="h4">Team</Typography>
      </div>
      <Members members={ members } disableEnableUser={ disableEnableUser } createUser={ createUser } />
    </Stack>
  );
}


