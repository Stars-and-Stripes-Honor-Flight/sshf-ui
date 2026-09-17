/**
 * Helper functions for filtering and sorting flight roster pairs
 */

/**
 * Get the assigned-to caller value from a person
 * @param {Object} person - The person object
 * @returns {string} The assigned caller name
 */
export function getAssignedTo(person) {
  return person?.assigned_to ?? person?.call?.assigned_to ?? '';
}

/**
 * Veteran flight group for roster display and sort (trimmed; empty when missing or guardian).
 * @param {Object|undefined|null} person
 * @returns {string}
 */
export function getVeteranGroup(person) {
  if (!person || person.type !== 'Veteran') {
    return '';
  }
  return (person.group ?? '').trim();
}

/**
 * Flight group used when sorting pairs (veteran's group).
 * @param {Object} pair
 * @returns {string}
 */
export function getPairSortGroup(pair) {
  const veteran = pair.people?.find((p) => p.type === 'Veteran');
  return getVeteranGroup(veteran);
}

/**
 * Normalize a seat string for display-independent comparison (trim, uppercase letter).
 * @param {string|undefined|null} seat
 * @returns {string}
 */
function normalizeSeatString(seat) {
  return (seat ?? '').trim();
}

/**
 * Parse a seat label into row number and row letter, or null when not parseable.
 * Accepts one- or two-digit row with optional leading zero, e.g. 3A, 03A, 11B.
 * @param {string|undefined|null} seat
 * @returns {{ row: number, letter: string } | null}
 */
export function parseSeatNumber(seat) {
  const normalized = normalizeSeatString(seat);
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d+)\s*([A-Za-z])$/);
  if (!match) {
    return null;
  }

  return {
    row: Number.parseInt(match[1], 10),
    letter: match[2].toUpperCase(),
  };
}

/**
 * Seat used for roster sort: veteran's seat when set, otherwise guardian's.
 * @param {Object} pair - Flight roster pair
 * @returns {string}
 */
export function getPairSortSeat(pair) {
  const veteran = pair.people?.find((p) => p.type === 'Veteran');
  const guardian = pair.people?.find((p) => p.type === 'Guardian');

  const veteranSeat = normalizeSeatString(veteran?.seat);
  if (veteranSeat) {
    return veteranSeat;
  }

  return normalizeSeatString(guardian?.seat);
}

/**
 * Compare two seat labels for roster ordering: row (numeric), then letter.
 * Empty or unparseable seats sort after valid seats.
 * @param {string} seatA
 * @param {string} seatB
 * @returns {number}
 */
export function compareSeatNumbers(seatA, seatB) {
  const parsedA = parseSeatNumber(seatA);
  const parsedB = parseSeatNumber(seatB);

  if (!parsedA && !parsedB) {
    return normalizeSeatString(seatA).localeCompare(normalizeSeatString(seatB));
  }
  if (!parsedA) {
    return 1;
  }
  if (!parsedB) {
    return -1;
  }

  if (parsedA.row !== parsedB.row) {
    return parsedA.row - parsedB.row;
  }

  return parsedA.letter.localeCompare(parsedB.letter);
}

/**
 * Get detailed list of status issues for a pair
 * @param {Object} pair - The pair object
 * @returns {Array} Array of issue objects { id, label, severity, personType }
 */
export function getPairStatusIssues(pair) {
  const issues = [];
  
  // Pair-level issues
  if (pair.busMismatch) {
    issues.push({ id: 'busMismatch', label: 'Bus Mismatch', severity: 'warning' });
  }
  if (pair.missingPairedPerson) {
    issues.push({ id: 'missingPairedPerson', label: 'Missing Person', severity: 'error' });
  }
  
  // Per-person readiness checks
  const veteran = pair.people.find(p => p.type === 'Veteran');
  const guardian = pair.people.find(p => p.type === 'Guardian');
  
  // Check veteran
  if (veteran) {
    if (veteran.confirmed === false) {
      issues.push({ id: 'veteranNotConfirmed', label: 'Vet Not Confirmed', severity: 'warning', personType: 'Veteran' });
    }
    if (veteran.medical_form === false) {
      issues.push({ id: 'veteranMedicalForm', label: 'Vet Medical Form', severity: 'warning', personType: 'Veteran' });
    }
    if (!veteran.medical_level || veteran.medical_level.trim() === '') {
      issues.push({ id: 'veteranMedicalLevel', label: 'Vet Medical Level', severity: 'warning', personType: 'Veteran' });
    }
    if (!veteran.bus || veteran.bus === 'None') {
      issues.push({ id: 'veteranNoBus', label: 'Vet No Bus', severity: 'warning', personType: 'Veteran' });
    }
  }
  
  // Check guardian
  if (guardian) {
    if (guardian.confirmed === false) {
      issues.push({ id: 'guardianNotConfirmed', label: 'Grd Not Confirmed', severity: 'warning', personType: 'Guardian' });
    }
    if (guardian.medical_form === false) {
      issues.push({ id: 'guardianMedicalForm', label: 'Grd Medical Form', severity: 'warning', personType: 'Guardian' });
    }
    // Training check: training_complete === false or missing/empty training
    if (guardian.training_complete === false || !guardian.training || guardian.training.trim() === '') {
      issues.push({ id: 'guardianTraining', label: 'Grd Training', severity: 'warning', personType: 'Guardian' });
    }
    if (!guardian.bus || guardian.bus === 'None') {
      issues.push({ id: 'guardianNoBus', label: 'Grd No Bus', severity: 'warning', personType: 'Guardian' });
    }
  }
  
  return issues;
}

/**
 * Get all unique assigned callers from pairs
 * @param {Array} pairs - Array of pair objects
 * @returns {Array} Sorted array of unique caller names (excluding empty)
 */
export function getUniqueAssignedCallers(pairs) {
  const callers = new Set();
  
  pairs.forEach(pair => {
    pair.people.forEach(person => {
      const assignedTo = getAssignedTo(person);
      if (assignedTo) {
        callers.add(assignedTo);
      }
    });
  });
  
  return Array.from(callers).sort();
}

/**
 * Check if a pair has validation issues
 * @param {Object} pair - The pair object
 * @returns {boolean} True if the pair has issues
 */
export function pairHasIssues(pair) {
  return getPairStatusIssues(pair).length > 0;
}

/**
 * Filter pairs based on search criteria
 * @param {Array} pairs - Array of pair objects
 * @param {Object} filters - Filter criteria
 * @param {string} filters.nameFilter - Name search string
 * @param {string} filters.statusFilter - Status filter (all/ok/issues/nofly)
 * @param {string} filters.busFilter - Bus filter
 * @param {string} filters.assignedCallerFilter - Assigned caller filter
 * @returns {Array} Filtered pairs
 */
export function filterPairs(pairs, filters) {
  const { nameFilter = '', statusFilter = 'all', busFilter = 'all', assignedCallerFilter = 'all' } = filters;
  
  return pairs.filter(pair => {
    const veteran = pair.people.find(p => p.type === 'Veteran');
    const guardian = pair.people.find(p => p.type === 'Guardian');
    
    // Name filter: search in name, phone, and city
    if (nameFilter) {
      const searchLower = nameFilter.toLowerCase();
      const veteranMatches = veteran && (
        `${veteran.name_first} ${veteran.name_last}`.toLowerCase().includes(searchLower) ||
        (veteran.phone_mbl || '').toLowerCase().includes(searchLower) ||
        (veteran.city || '').toLowerCase().includes(searchLower)
      );
      const guardianMatches = guardian && (
        `${guardian.name_first} ${guardian.name_last}`.toLowerCase().includes(searchLower) ||
        (guardian.phone_mbl || '').toLowerCase().includes(searchLower) ||
        (guardian.city || '').toLowerCase().includes(searchLower)
      );
      
      if (!veteranMatches && !guardianMatches) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter === 'ok' && pairHasIssues(pair)) {
      return false;
    }
    if (statusFilter === 'issues') {
      const hasNoBus = pair.people.some(p => !p.bus || p.bus === 'None');
      if (!pairHasIssues(pair) && !hasNoBus) {
        return false;
      }
    }
    if (statusFilter === 'nofly') {
      const hasNoFly = pair.people.some(p => p.nofly);
      if (!hasNoFly) {
        return false;
      }
    }
    
    // Bus filter
    if (busFilter !== 'all') {
      const veteranBus = veteran?.bus;
      if (veteranBus !== busFilter) {
        return false;
      }
    }
    
    // Assigned caller filter
    if (assignedCallerFilter !== 'all') {
      const veteranCaller = getAssignedTo(veteran);
      const guardianCaller = guardian ? getAssignedTo(guardian) : '';
      if (veteranCaller !== assignedCallerFilter && guardianCaller !== assignedCallerFilter) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort pairs based on the sort criteria
 * Most sort keys use the veteran in the pair; seat uses veteran seat or guardian when absent.
 * @param {Array} pairs - Array of pair objects
 * @param {string} sortBy - Sort criteria (name/bus/assignment/group/status/seat)
 * @returns {Array} Sorted pairs (new array)
 */
export function sortPairs(pairs, sortBy) {
  const sorted = [...pairs];
  
  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => {
        const vetA = a.people.find(p => p.type === 'Veteran');
        const vetB = b.people.find(p => p.type === 'Veteran');
        const nameA = vetA ? `${vetA.name_last} ${vetA.name_first}`.toLowerCase() : '';
        const nameB = vetB ? `${vetB.name_last} ${vetB.name_first}`.toLowerCase() : '';
        return nameA.localeCompare(nameB);
      });
      break;
      
    case 'bus':
      sorted.sort((a, b) => {
        const vetA = a.people.find(p => p.type === 'Veteran');
        const vetB = b.people.find(p => p.type === 'Veteran');
        const busA = vetA?.bus || 'None';
        const busB = vetB?.bus || 'None';
        return busA.localeCompare(busB);
      });
      break;
      
    case 'assignment':
      sorted.sort((a, b) => {
        const vetA = a.people.find(p => p.type === 'Veteran');
        const vetB = b.people.find(p => p.type === 'Veteran');
        const assignA = getAssignedTo(vetA).toLowerCase();
        const assignB = getAssignedTo(vetB).toLowerCase();
        return assignA.localeCompare(assignB);
      });
      break;

    case 'group':
      sorted.sort((a, b) => {
        const groupA = getPairSortGroup(a).toLowerCase();
        const groupB = getPairSortGroup(b).toLowerCase();
        return groupA.localeCompare(groupB);
      });
      break;
      
    case 'status':
      sorted.sort((a, b) => {
        const hasIssuesA = pairHasIssues(a);
        const hasIssuesB = pairHasIssues(b);
        
        // Issues first, then OK
        if (hasIssuesA && !hasIssuesB) return -1;
        if (!hasIssuesA && hasIssuesB) return 1;
        
        // Within same status, sort by veteran name
        const vetA = a.people.find(p => p.type === 'Veteran');
        const vetB = b.people.find(p => p.type === 'Veteran');
        const nameA = vetA ? `${vetA.name_last} ${vetA.name_first}`.toLowerCase() : '';
        const nameB = vetB ? `${vetB.name_last} ${vetB.name_first}`.toLowerCase() : '';
        return nameA.localeCompare(nameB);
      });
      break;

    case 'seat':
      sorted.sort((a, b) =>
        compareSeatNumbers(getPairSortSeat(a), getPairSortSeat(b))
      );
      break;
      
    default:
      // No sort
      break;
  }
  
  return sorted;
}
