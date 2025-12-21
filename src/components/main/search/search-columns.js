import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import { dayjs } from '@/lib/dayjs';
import { Chip } from '@mui/material';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { MedalMilitary as MedalMilitaryIcon } from '@phosphor-icons/react/dist/ssr/MedalMilitary';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';
import { LinkBreak } from '@phosphor-icons/react/dist/ssr/LinkBreak';

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

// Remove SSHF- prefix from flight names
const formatFlightName = (flightName) => {
  if (!flightName || flightName === "None") {
    return flightName;
  }
  return flightName.replace(/^SSHF-/i, '');
};

export const searchColumns = [
    { 
        field: 'type', 
        name: 'Type', 
        width: '70px', 
        formatter: (row) => 
        {
            let label = <Typography variant='body2' >{row.type}</Typography>;
            let icon = (
                <Tooltip title="Guardian" arrow placement="top">
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5px' }}>
                        <UserIcon size="40" color="#ff9999" weight="regular" />
                    </span>
                </Tooltip>
            );

            if (row.type == "Veteran") {
                icon = (
                    <Tooltip title="Veteran" arrow placement="top">
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MedalMilitaryIcon size="50" color="#b5ccf6" weight="fill" />
                        </span>
                    </Tooltip>
                );
            }

            return (
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Box 
                        sx={{
                        bgcolor: 'var(--mui-palette-background-level1)',
                        borderRadius: 1.5,
                        flex: '0 0 auto',
                        p: '2px 12px',
                        textAlign: 'center',
                        width: 70
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            );
        }, 
    },
    { 
        field: 'name',
        name: 'Name',
        width: '200px',
        formatter: (row) => 
        {
            return (
                <Typography 
                    variant='subtitle1' 
                    sx={{ 
                        color: 'primary.main',
                        fontWeight: 'medium'
                    }}
                >
                    {row.name}
                </Typography>
            );
        }
    },
    { 
        field: 'flight',
        name: 'Flight',
        width: '150px',
        formatter: (row) => 
        {
            let label = formatFlightName(row.flight);
            let icon = <XCircleIcon color="var(--mui-palette-warning-main)" weight="fill" />;

            if (row.flight != "None") {
                icon = <AirplaneTiltIcon color="var(--mui-palette-success-main)" weight="fill" />;
            }

            return (<Chip icon={icon} label={label} size="small" variant="outlined" />);
        }, 
    },
    { 
        field: 'status',
        name: 'Status',
        width: '150px', 
        formatter: (row) => 
        {
            return (
                <Chip
                    label={row.status || 'No Status'}
                    color={getStatusColor(row.status)}
                    size="small"
                    sx={{
                        borderRadius: 1,
                        fontWeight: 'medium'
                    }}
                />
            );
        }, 
    },
    { 
        field: 'pairing',
        name: 'Pairing',
        width: '200px',
        formatter: (row) => 
        {
            if (row.pairing === "None" || !row.pairing) {
                const message = row.type === "Veteran" ? "No Guardian Paired" : "No Veterans Paired";
                return (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <LinkBreak color="var(--mui-palette-warning-main)" weight="regular" size={18} />
                        <Typography variant='body2'>{message}</Typography>
                    </Stack>
                );
            }
            
            return (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Users color="var(--mui-palette-success-main)" weight="fill" size={18} />
                    <Typography variant='body2'>{row.pairing}</Typography>
                </Stack>
            );
        }
    },
    {
        field: 'appdate',
        name: 'App Date',
        width: '70px',
        formatter: (row) => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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
        </Stack>
        ),
    },
];