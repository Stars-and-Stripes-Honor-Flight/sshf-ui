/**
 * Cell renderer functions for flight roster grid columns
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Bus as BusIcon } from '@phosphor-icons/react/dist/ssr/Bus';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';

import { getAssignedTo, getPairStatusIssues, getVeteranGroup } from './roster-helpers';

/**
 * Render seat cell (editable for veteran and guardian)
 */
export function renderSeatCell(person, personType, handlers) {
  if (!person) return null;

  const { EditableField, handleSeatChange } = handlers;
  return (
    <EditableField
      value={person.seat || ''}
      onBlur={(newValue) => handleSeatChange(newValue, person.id, personType)}
      placeholder="e.g., A1"
      maxWidth={112}
      minWidth={72}
      inputProps={{
        style: { minWidth: '4.5ch', textAlign: 'center' },
        'aria-label': `${personType} seat assignment`,
      }}
    />
  );
}

/**
 * Render bus cell (selector for veteran, display for guardian)
 */
export function renderBusCell(person, personType, handlers) {
  if (!person) return null;
  
  if (personType === 'Veteran') {
    const { BusSelector, handleBusChange } = handlers;
    return (
      <BusSelector
        value={person.bus}
        onChange={handleBusChange}
        personId={person.id}
        personType={personType}
      />
    );
  }
  
  const isNone = person.bus === 'None' || !person.bus;
  return (
    <Stack 
      direction="row" 
      spacing={0.5} 
      sx={{ 
        alignItems: 'center',
        display: 'flex',
        backgroundColor: isNone ? '#FCE4EC' : '#c8e6c9',
        color: isNone ? '#C2185B' : '#1b5e20',
        padding: '4px 12px',
        borderRadius: '16px',
        width: 'fit-content'
      }}
    >
      {isNone ? (
        <>
          <XIcon size={14} weight="bold" />
          <span>None</span>
        </>
      ) : (
        <>
          <BusIcon size={14} weight="fill" />
          <span>{person.bus}</span>
        </>
      )}
    </Stack>
  );
}

/**
 * Render status cell (only on veteran row)
 * Shows issue chips or OK when no issues exist
 */
export function renderStatusCell(pair) {
  const issues = getPairStatusIssues(pair);
  
  if (issues.length === 0) {
    return <Chip label="OK" size="small" color="success" variant="outlined" />;
  }
  
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {issues.map((issue) => (
        <Chip
          key={issue.id}
          label={issue.label}
          size="small"
          color={issue.severity === 'error' ? 'error' : 'warning'}
          variant="outlined"
          sx={{ fontSize: '0.75rem', height: 'auto', py: 0.25 }}
        />
      ))}
    </Stack>
  );
}

/**
 * Render veteran flight group (read-only; guardians show em dash)
 */
export function renderGroupCell(person, personType) {
  if (!person) return null;

  if (personType !== 'Veteran') {
    return <Typography variant="body2">—</Typography>;
  }

  const group = getVeteranGroup(person);
  return <Typography variant="body2">{group || '—'}</Typography>;
}

/**
 * Render assigned-to cell (editable for veteran, display with sync for guardian)
 */
export function renderAssignedToCell(person, pair, personType, handlers, localAssignedTo, hasCallMismatch) {
  if (!person) return null;
  
  if (personType === 'Veteran') {
    const { EditableField, handleAssignedToCallChange } = handlers;
    return (
      <EditableField
        value={getAssignedTo(person)}
        onBlur={handleAssignedToCallChange}
        placeholder="Assign to call"
        maxWidth={150}
      />
    );
  }
  
  const displayAssignedTo = localAssignedTo !== null ? localAssignedTo : getAssignedTo(person);
  const { handleSyncCallAssignment } = handlers;
  
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {displayAssignedTo && (
        <Chip
          label={displayAssignedTo}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500, backgroundColor: hasCallMismatch ? '#fff3e0' : 'transparent' }}
        />
      )}
      {hasCallMismatch && (
        <Button
          size="small"
          variant="outlined"
          onClick={handleSyncCallAssignment}
          sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
        >
          Sync
        </Button>
      )}
    </Stack>
  );
}

/**
 * Render confirmed cell (boolean indicator)
 */
export function renderConfirmedCell(person) {
  if (!person) return null;
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      {person.confirmed ? (
        <CheckCircleIcon size={20} weight="fill" color="green" />
      ) : (
        <XCircleIcon size={20} weight="regular" color="#999" />
      )}
    </Box>
  );
}

/**
 * Render phone cell (mobile phone number)
 */
export function renderPhoneCell(person) {
  if (!person) return null;
  return <Typography variant="body2">{person.phone_mbl || '—'}</Typography>;
}

/**
 * Render FM # cell (family member number)
 */
export function renderFmNumberCell(person) {
  if (!person) return null;
  return <Typography variant="body2">{person.fm_number || '—'}</Typography>;
}

/**
 * Render med notes / experience cell (vet: medical_review, grd: med_exprnc)
 */
export function renderMedicalLevelCell(person, personType) {
  if (!person) return null;
  
  if (personType === 'Veteran') {
    return <Typography variant="body2">{person.medical_review || '—'}</Typography>;
  }
  
  return <Typography variant="body2">{person.med_exprnc || '—'}</Typography>;
}

/**
 * Render medical form complete cell (boolean indicator)
 */
export function renderMedicalFormCell(person) {
  if (!person) return null;
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      {person.medical_form ? (
        <CheckCircleIcon size={20} weight="fill" color="green" />
      ) : (
        <XCircleIcon size={20} weight="regular" color="#999" />
      )}
    </Box>
  );
}

/**
 * Render limitations / no-fly cell (vet: limitations, both: nofly indicator)
 */
export function renderLimitationsCell(person, personType) {
  if (!person) return null;
  
  return (
    <Stack spacing={0.5}>
      {personType === 'Veteran' && person.med_limits && (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {person.med_limits}
        </Typography>
      )}
      {person.nofly && (
        <Chip label="No Fly" size="small" color="error" variant="outlined" />
      )}
    </Stack>
  );
}

/**
 * Render shirt size cell (prefer apparel_shirt_size, fallback to shirt)
 */
export function renderShirtSizeCell(person) {
  if (!person) return null;
  const size = person.apparel_shirt_size || person.shirt;
  return <Typography variant="body2">{size || '—'}</Typography>;
}

/**
 * Render jacket size cell
 */
export function renderJacketSizeCell(person) {
  if (!person) return null;
  return <Typography variant="body2">{person.apparel_jacket_size || '—'}</Typography>;
}

function RolePlaceholder() {
  return <Typography variant="body2">—</Typography>;
}

/**
 * Format a YYYY-MM-DD birth date for the roster without timezone shifting.
 * @param {string|undefined|null} value
 * @returns {string}
 */
function formatRosterBirthDate(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return '—';
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return value;
  }

  return `${match[2]}/${match[3]}/${match[1]}`;
}

/**
 * Read-only date of birth for veteran and guardian.
 */
export function renderBirthDateCell(person) {
  if (!person) return null;
  return <Typography variant="body2">{formatRosterBirthDate(person.birth_date)}</Typography>;
}

/**
 * Editable middle name for veteran and guardian.
 */
export function renderMiddleNameCell(person, personType, handlers) {
  if (!person) return null;

  const { EditableField, handleMiddleNameChange } = handlers;
  return (
    <EditableField
      value={person.name_middle || ''}
      onBlur={(newValue) => handleMiddleNameChange(newValue, person.id, personType)}
      placeholder="Middle"
      maxWidth={140}
      inputProps={{ 'aria-label': 'Middle name' }}
    />
  );
}

/**
 * Editable mobile phone for veteran and guardian.
 */
export function renderMobilePhoneCell(person, personType, handlers) {
  if (!person) return null;

  const { EditableField, handleMobilePhoneChange } = handlers;
  return (
    <EditableField
      value={person.phone_mbl || ''}
      onBlur={(newValue) => handleMobilePhoneChange(newValue, person.id, personType)}
      placeholder="Mobile"
      maxWidth={170}
      inputProps={{ 'aria-label': 'Mobile phone' }}
    />
  );
}

/**
 * Guardian training type plus an editable training-complete checkbox.
 * Veterans show an em dash.
 */
export function renderTrainingCell(person, personType, handlers) {
  if (!person) return null;
  if (personType !== 'Guardian') return <RolePlaceholder />;

  const { EditableCheckbox, handleTrainingCompleteChange } = handlers;
  const typeLabel = (person.training || '').trim();

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="body2">{typeLabel || '—'}</Typography>
      <EditableCheckbox
        checked={Boolean(person.training_complete)}
        onChange={(next) => handleTrainingCompleteChange(next, person.id)}
        ariaLabel="Training complete"
      />
    </Stack>
  );
}

/**
 * Multiline training notes for guardians. Veterans show an em dash.
 */
export function renderTrainingNotesCell(person, personType, handlers) {
  if (!person) return null;
  if (personType !== 'Guardian') return <RolePlaceholder />;

  const { EditableField, handleTrainingNotesChange } = handlers;
  return (
    <EditableField
      value={person.flight_training_notes || ''}
      onBlur={(newValue) => handleTrainingNotesChange(newValue, person.id)}
      placeholder="Training notes"
      multiline
      minRows={2}
      maxRows={4}
      maxWidth={280}
      minWidth={180}
      inputProps={{ 'aria-label': 'Training notes' }}
    />
  );
}

function ReadOnlyCheckbox({ checked, ariaLabel }) {
  return (
    <Checkbox
      size="small"
      checked={Boolean(checked)}
      disabled
      inputProps={{ 'aria-label': ariaLabel, readOnly: true }}
      sx={{ p: 0.5 }}
    />
  );
}

/**
 * Read-only waiver checkbox for guardians. Veterans show an em dash.
 */
export function renderWaiverCell(person, personType) {
  if (!person) return null;
  if (personType !== 'Guardian') return <RolePlaceholder />;
  return <ReadOnlyCheckbox checked={person.flight_waiver} ariaLabel="Waiver" />;
}

/**
 * Read-only see-doc checkbox for guardians. Veterans show an em dash.
 */
export function renderSeeDocCell(person, personType) {
  if (!person) return null;
  if (personType !== 'Guardian') return <RolePlaceholder />;
  return <ReadOnlyCheckbox checked={person.flight_training_see_doc} ariaLabel="See doc" />;
}

/**
 * Render apparel notes cell
 */
export function renderNotesCell(person) {
  if (!person) return null;
  return (
    <Typography variant="body2" sx={{ fontSize: '0.875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {person.apparel_notes || '—'}
    </Typography>
  );
}

/**
 * Main cell renderer that routes to specific renderers based on column ID
 */
export function renderActivityCell(columnId, person, pair, personType, handlers, localAssignedTo, hasCallMismatch) {
  switch (columnId) {
    case 'seat':
      return renderSeatCell(person, personType, handlers);
    case 'bus':
      return renderBusCell(person, personType, handlers);
    case 'status':
      return personType === 'Veteran' ? renderStatusCell(pair) : null;
    case 'group':
      return renderGroupCell(person, personType);
    case 'assigned_to':
      return renderAssignedToCell(person, pair, personType, handlers, localAssignedTo, hasCallMismatch);
    case 'confirmed':
      return renderConfirmedCell(person);
    case 'phone':
      return renderPhoneCell(person);
    case 'fm_number':
      return renderFmNumberCell(person);
    case 'medical_level':
      return renderMedicalLevelCell(person, personType);
    case 'medical_form':
      return renderMedicalFormCell(person);
    case 'limitations':
      return renderLimitationsCell(person, personType);
    case 'shirt_size':
      return renderShirtSizeCell(person);
    case 'jacket_size':
      return renderJacketSizeCell(person);
    case 'notes':
      return renderNotesCell(person);
    case 'name_middle':
      return renderMiddleNameCell(person, personType, handlers);
    case 'phone_mbl':
      return renderMobilePhoneCell(person, personType, handlers);
    case 'birth_date':
      return renderBirthDateCell(person);
    case 'training':
      return renderTrainingCell(person, personType, handlers);
    case 'training_notes':
      return renderTrainingNotesCell(person, personType, handlers);
    case 'flight_waiver':
      return renderWaiverCell(person, personType);
    case 'flight_training_see_doc':
      return renderSeeDocCell(person, personType);
    default:
      return null;
  }
}
