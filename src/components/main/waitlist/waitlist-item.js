import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { dayjs } from '@/lib/dayjs';
import { paths } from '@/paths';
import { StatusChip, ConflictChip, PairingLinks } from '@/components/main/waitlist/waitlist-indicators';

export function WaitlistItem({ entry, type, position }) {
  const detailUrl = type === 'veterans' 
    ? paths.main.veterans.details(entry.id)
    : paths.main.guardians.details(entry.id);

  const appDate = dayjs(entry.appdate).format('MMM D, YYYY');
  const birthDate = entry.birth_date ? dayjs(entry.birth_date).format('MMM D, YYYY') : '—';

  return (
    <TableRow hover>
      <TableCell sx={{ width: '60px' }}>
        <Tooltip title={type === 'veterans' ? 'Veteran' : 'Guardian'} arrow placement="top">
          <Box 
            sx={{
              bgcolor: 'var(--mui-palette-background-level1)',
              borderRadius: 1.5,
              flex: '0 0 auto',
              p: '4px 8px',
              textAlign: 'center',
              fontWeight: 600,
              width: 50
            }}
          >
            {position}
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
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
            {entry.name}
          </a>
          <StatusChip status={entry.status} />
        </Stack>
      </TableCell>
      <TableCell>{entry.age !== null ? entry.age : '—'}</TableCell>
      <TableCell>{birthDate}</TableCell>
      <TableCell>{entry.city}</TableCell>
      <TableCell>{appDate}</TableCell>
      {type === 'veterans' && (
        <>
          <TableCell>
            <ConflictChip vetType={entry.vet_type} /> 
            {!entry.vet_type && '—'}
          </TableCell>
          <TableCell>{entry.group || '—'}</TableCell>
        </>
      )}
      <TableCell>
        <PairingLinks pairings={entry.pairings} type={type} />
      </TableCell>
      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {entry.prefs || '—'}
      </TableCell>
    </TableRow>
  );
}
