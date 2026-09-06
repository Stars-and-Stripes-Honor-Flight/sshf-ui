/**
 * Cell renderer functions for flight roster grid columns
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Bus as BusIcon } from '@phosphor-icons/react/dist/ssr/Bus';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';

import { getAssignedTo } from './roster-helpers';

/**
 * Render seat cell (editable for veteran, display for guardian)
 */
export function renderSeatCell(person, personType, handlers) {
  if (!person) return null;
  
  if (personType === 'Veteran') {
    const { EditableField, handleSeatChange } = handlers;
    return (
      <EditableField
        value={person.seat || ''}
        onBlur={(newValue) => handleSeatChange(newValue, person.id, personType)}
        placeholder="e.g., A1"
        maxWidth={100}
      />
    );
  }
  
  return <Typography variant="body2">{person.seat || '—'}</Typography>;
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
 */
export function renderStatusCell(pair) {
  return (
    <>
      {pair.busMismatch && (
        <Chip label="Bus Mismatch" size="small" color="warning" variant="outlined" />
      )}
      {pair.missingPairedPerson && (
        <Chip label="Missing Person" size="small" color="error" variant="outlined" />
      )}
      {!pair.busMismatch && !pair.missingPairedPerson && (
        <Chip label="OK" size="small" color="success" variant="outlined" />
      )}
    </>
  );
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
 * Render medical level / experience cell (vet: level, grd: experience)
 */
export function renderMedicalLevelCell(person, personType) {
  if (!person) return null;
  
  if (personType === 'Veteran') {
    return <Typography variant="body2">{person.medical_level || '—'}</Typography>;
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
    default:
      return null;
  }
}
