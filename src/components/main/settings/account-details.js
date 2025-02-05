'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Camera as CameraIcon } from '@phosphor-icons/react/dist/ssr/Camera';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';

import { Option } from '@/components/core/option';

export function AccountDetails() {
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user-data');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  if (!userData) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar 
            src={userData.avatar} 
            sx={{ '--Avatar-size': '40px' }}
          >
            <UserIcon fontSize="var(--Icon-fontSize)" />
          </Avatar>
        }
        title="Account Details"
      />
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Full Name
            </Typography>
            <Typography variant="body1">
              {`${userData.firstName} ${userData.lastName}`}
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Email Address
            </Typography>
            <Typography variant="body1">
              {userData.email}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
