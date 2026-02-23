import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { MedalMilitary as MedalMilitaryIcon } from '@phosphor-icons/react/dist/ssr/MedalMilitary';
import { dayjs } from '@/lib/dayjs';
import { paths } from '@/paths';

const getIcon = (type) => {
  if (type === 'veterans') {
    return (
      <Tooltip title="Veteran" arrow placement="top">
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <MedalMilitaryIcon size="24" color="#b5ccf6" weight="fill" />
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title="Guardian" arrow placement="top">
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <UserIcon size="24" color="#ff9999" weight="regular" />
      </span>
    </Tooltip>
  );
};

export function WaitlistMobileCard({ entry, type }) {
  const detailUrl = type === 'veterans' 
    ? paths.main.veterans.details(entry.id)
    : paths.main.guardians.details(entry.id);

  const appDate = dayjs(entry.appdate).format('MMM D, YYYY');
  const birthDate = entry.birth_date ? dayjs(entry.birth_date).format('MMM D, YYYY') : '—';

  return (
    <Card>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Stack spacing={2}>
          {/* Header with icon and name */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box 
              sx={{
                bgcolor: 'var(--mui-palette-background-level1)',
                borderRadius: 1.5,
                p: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                minHeight: 40,
              }}
            >
              {getIcon(type)}
            </Box>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <a 
                href={detailUrl}
                style={{
                  color: 'var(--mui-palette-primary-main)',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                {entry.name}
              </a>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {entry.city}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          {/* Details rows */}
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Stack spacing={0.25} sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Age
                </Typography>
                <Typography variant="body2">
                  {entry.age !== null ? entry.age : '—'}
                </Typography>
              </Stack>
              <Stack spacing={0.25} sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Birth Date
                </Typography>
                <Typography variant="body2">
                  {birthDate}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Stack spacing={0.25} sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Application Date
                </Typography>
                <Typography variant="body2">
                  {appDate}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Notes if present */}
          {entry.prefs && (
            <>
              <Divider />
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Notes
                </Typography>
                <Typography variant="body2">
                  {entry.prefs}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
