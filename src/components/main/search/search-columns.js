import Box from '@mui/material/Box';
import RouterLink from 'next/link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';

import { dayjs } from '@/lib/dayjs';

import { paths } from '@/paths';
import { Chip } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { AirplaneTilt as AirplaneTiltIcon } from '@phosphor-icons/react/dist/ssr/AirplaneTilt';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { MedalMilitary as MedalMilitaryIcon } from '@phosphor-icons/react/dist/ssr/MedalMilitary';
import { FlowerLotus } from '@phosphor-icons/react/dist/ssr/FlowerLotus';
import { Flower } from '@phosphor-icons/react/dist/ssr/Flower';
import { Leaf } from '@phosphor-icons/react/dist/ssr/Leaf';
import { HourglassHigh } from '@phosphor-icons/react/dist/ssr/HourglassHigh';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';

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

            const detailUrl = row.type == "Veteran" 
                ? paths.main.veterans.details(row.id) 
                : paths.main.guardians.details(row.id);

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
                        component={RouterLink} href={detailUrl}
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
            const detailUrl = row.type == "Veteran" 
                ? paths.main.veterans.details(row.id) 
                : paths.main.guardians.details(row.id);
            
            return <Typography variant='body1' 
                component={RouterLink} 
                href={detailUrl}
                sx={{ color: 'primary.main' }}
            >
                {row.name}
            </Typography>;
        }
    },
    { field: 'city', name: 'City', width: '150px', },
    { 
        field: 'flight',
        name: 'Flight',
        width: '150px',
        formatter: (row) => 
        {
            let label = row.flight;
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
            const status = {
                'Flown': { label: 'Flown', icon: <ClockIcon color="var(--mui-palette-primary-main)" weight="fill" /> },
                'Active': { label: 'Active', icon: <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />,},
                'Removed': { label: 'Removed', icon: <XCircleIcon color="var(--mui-palette-warning-main)" weight="fill" /> },
                'Deceased': { label: 'Deceased', icon: <FlowerLotus color="var(--mui-palette-grey-500)" weight="fill" /> },
                'Future-Spring': { label: 'Future-Spring', icon: <Flower color="var(--mui-palette-success-light)" weight="fill" /> },
                'Future-Fall': { label: 'Future-Fall', icon: <Leaf color="var(--mui-palette-warning-light)" weight="fill" /> },
                'Future-PostRestriction': { label: 'Future-PostRestriction', icon: <HourglassHigh color="var(--mui-palette-info-main)" weight="fill" /> },
                'Copied': { label: 'Copied', icon: <Copy color="var(--mui-palette-info-light)" weight="fill" /> },
            };
            const { label, icon } = status[row.status] ?? { label: 'Unknown', icon: null };
        
            return (<Chip icon={icon} label={label} size="small" variant="outlined" />);
        }, 
    },
    { 
        field: 'pairing',
        name: 'Pairing',
        width: '200px',
        formatter: (row) => 
        {
            if (row.pairing === "None" || !row.pairing) {
                return (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <XCircleIcon color="var(--mui-palette-warning-main)" weight="fill" size={18} />
                        <Typography variant='body2'>None</Typography>
                    </Stack>
                );
            }
            
            return (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" size={18} />
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
    {
        formatter: (row) => {
            const detailUrl = row.type == "Veteran" 
                ? paths.main.veterans.details(row.id) 
                : paths.main.guardians.details(row.id);
            
            return (
                <IconButton component={RouterLink} href={detailUrl}>
                    <EyeIcon />
                </IconButton>
            );
        },
        name: 'Actions',
        hideName: false,
        width: '70px',
        align: 'center',
    },
];