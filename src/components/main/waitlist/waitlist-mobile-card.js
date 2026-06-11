import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { dayjs } from '@/lib/dayjs';
import { paths } from '@/paths';
import { StatusChip, ConflictChip, PairingLinks } from '@/components/main/waitlist/waitlist-indicators';

function DetailField({ label, children }) {
  return (
    <Stack spacing={0.25} sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {children}
      </Typography>
    </Stack>
  );
}

export function WaitlistMobileCard({ entry, type, position }) {
  const detailUrl = type === 'veterans' 
    ? paths.main.veterans.details(entry.id)
    : paths.main.guardians.details(entry.id);

  const appDate = dayjs(entry.appdate).format('MMM D, YYYY');
  const birthDate = entry.birth_date ? dayjs(entry.birth_date).format('MMM D, YYYY') : '—';

  return (
    <Card>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Stack spacing={2}>
          {/* Header with position and name */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Tooltip title={type === 'veterans' ? 'Veteran' : 'Guardian'} arrow placement="top">
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
                  fontWeight: 600,
                }}
              >
                {position}
              </Box>
            </Tooltip>
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
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <StatusChip status={entry.status} />
                {type === 'veterans' && <ConflictChip vetType={entry.vet_type} />}
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Details rows */}
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <DetailField label="Age">
                {entry.age !== null ? entry.age : '—'}
              </DetailField>
              <DetailField label="Birth Date">
                {birthDate}
              </DetailField>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <DetailField label="Application Date">
                {appDate}
              </DetailField>
              {type === 'veterans' && (
                <DetailField label="Group">
                  {entry.group || '—'}
                </DetailField>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <DetailField label={type === 'veterans' ? 'Guardian' : 'Veteran(s)'}>
                <PairingLinks pairings={entry.pairings} type={type} />
              </DetailField>
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
