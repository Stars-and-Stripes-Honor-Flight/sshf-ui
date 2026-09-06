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
  return Boolean(pair.busMismatch || pair.missingPairedPerson);
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
 * Sort key is always based on the veteran in the pair
 * @param {Array} pairs - Array of pair objects
 * @param {string} sortBy - Sort criteria (name/bus/assignment/status)
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
      
    default:
      // No sort
      break;
  }
  
  return sorted;
}
