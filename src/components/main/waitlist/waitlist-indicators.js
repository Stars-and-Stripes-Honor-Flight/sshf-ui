import Chip from '@mui/material/Chip';
import { paths } from '@/paths';

// The waitlist view only returns Active and Future-* statuses
const STATUS_CHIP_COLORS = {
  'Future-Spring': 'success',
  'Future-Fall': 'warning',
  'Future-PostRestriction': 'error',
};

// Soft color coding per conflict era; unlisted eras render neutral
const CONFLICT_CHIP_STYLES = {
  WWII: { bgcolor: '#fdf0c2', color: '#7a5d00' },
  Korea: { bgcolor: '#d6e4ff', color: '#1d4ed8' },
  Vietnam: { bgcolor: '#d8f3dc', color: '#1b6e3c' },
};

export function StatusChip({ status }) {
  if (!status || status === 'Active') {
    return null;
  }
  return (
    <Chip
      label={status}
      size="small"
      color={STATUS_CHIP_COLORS[status] || 'default'}
      sx={{ fontWeight: 500 }}
    />
  );
}

export function ConflictChip({ vetType }) {
  if (!vetType) {
    return null;
  }
  const style = CONFLICT_CHIP_STYLES[vetType];
  return (
    <Chip
      label={vetType}
      size="small"
      sx={{ fontWeight: 500, ...(style || {}) }}
    />
  );
}

export function PairingLinks({ pairings, type }) {
  if (!pairings || pairings.length === 0) {
    return '—';
  }

  // Veterans pair with guardians and vice versa
  const detailPath = type === 'veterans'
    ? paths.main.guardians.details
    : paths.main.veterans.details;

  return pairings.map((pairing, index) => (
    <span key={`${pairing.id}-${index}`}>
      {index > 0 && ', '}
      {pairing.id ? (
        <a
          href={detailPath(pairing.id)}
          style={{
            color: 'var(--mui-palette-primary-main)',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          {pairing.name}
        </a>
      ) : (
        pairing.name
      )}
    </span>
  ));
}
