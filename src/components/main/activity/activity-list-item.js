import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { MedalMilitary as MedalMilitaryIcon } from '@phosphor-icons/react/dist/ssr/MedalMilitary';
import { dayjs } from '@/lib/dayjs';
import { paths } from '@/paths';

const getDurationIcon = (personType) => {
  if (personType === 'Veteran') {
    return (
      <Tooltip title="Veteran" arrow placement="top">
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <MedalMilitaryIcon size="32" color="#b5ccf6" weight="fill" />
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title="Guardian" arrow placement="top">
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2px' }}>
        <UserIcon size="32" color="#ff9999" weight="regular" />
      </span>
    </Tooltip>
  );
};

export function ActivityListItem({ activity }) {
  const formattedDate = dayjs(activity.recdate).format('MMM D, YYYY h:mm A');
  const detailUrl = activity.type === 'Veteran' 
    ? paths.main.veterans.details(activity.id)
    : paths.main.guardians.details(activity.id);

  return (
    <TableRow hover>
      <TableCell sx={{ width: '50px' }}>
        <Box 
          sx={{
            bgcolor: 'var(--mui-palette-background-level1)',
            borderRadius: 1.5,
            flex: '0 0 auto',
            p: '4px 8px',
            textAlign: 'center',
            width: 50
          }}
        >
          {getDurationIcon(activity.type)}
        </Box>
      </TableCell>
      <TableCell>
        <a 
          href={detailUrl}
          style={{
            color: 'var(--mui-palette-primary-main)',
            fontWeight: '500',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          {activity.name}
        </a>
      </TableCell>
      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {activity.change || '—'}
      </TableCell>
      <TableCell>{activity.recby}</TableCell>
      <TableCell>{formattedDate}</TableCell>
    </TableRow>
  );
}
