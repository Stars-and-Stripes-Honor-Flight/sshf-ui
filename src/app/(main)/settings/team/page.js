'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { Members } from '@/components/main/settings/members';

import { api } from '@/lib/api';
import { toast } from '@/components/core/toaster';

export default function Page() {
  const [members, setMembers] = React.useState([]);

  const getUsers = async () => {
    try {
      await api({ 
        entity: 'User',
      })
      .then((response) => {
        response.json().then(json => {
          setMembers(json);
        })
      })
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong!');
    }
  }

  const createUser = async (email) => {
    await api({ 
      entity: 'User',
      fetchSettings: {
        method: "POST",
        body: JSON.stringify({
          email
        })
      }
    })
    .then((response) => {
      response.json().then(async () => {
        toast.success("User Created");
        await getUsers();
      })
    })
  }

  const disableEnableUser = async (user) => {
    try {
      let enabled = !user.enabled;

      await api({ 
        entity: 'User',
        id: user.userID,
        fetchSettings: {
          method: "PUT",
          body: JSON.stringify({
            ...user,
            enabled: enabled
          })
        }
      })
      .then((response) => {
        response.json().then(async () => {
          toast.success("User Updated");
          await getUsers();
        })
      })
      
    } catch (error) {
      toast.error('Something went wrong!');
    }
  }

  let gotUsers = false;

  React.useEffect(() => {
    document.title = `Team | Settings ${config.site.name}`;

    if (!gotUsers) {
      gotUsers = true;
      getUsers();
    }
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


