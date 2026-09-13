/**
 * Persist flight roster filter/sort controls per flight in localStorage.
 */

export const ROSTER_CONTROLS_SCHEMA_VERSION = 1;

export const DEFAULT_ROSTER_CONTROLS = {
  nameFilter: '',
  statusFilter: 'all',
  busFilter: 'all',
  assignedCallerFilter: 'all',
  sortBy: 'name',
};

const STATUS_FILTER_VALUES = new Set(['all', 'ok', 'issues', 'nofly']);
const SORT_BY_VALUES = new Set(['name', 'bus', 'assignment', 'status', 'seat']);

/**
 * @param {string} flightId
 * @returns {string}
 */
export function getFlightRosterControlsStorageKey(flightId) {
  return `sshf.flightRosterControls.v1.${flightId}`;
}

/**
 * @param {unknown} value
 * @param {Set<string>} allowed
 * @param {string} fallback
 * @returns {string}
 */
function normalizeEnum(value, allowed, fallback) {
  return typeof value === 'string' && allowed.has(value) ? value : fallback;
}

/**
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
function normalizeString(value, fallback) {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Load saved roster controls for a flight.
 * @param {string | null | undefined} flightId
 * @returns {typeof DEFAULT_ROSTER_CONTROLS}
 */
export function loadFlightRosterControls(flightId) {
  if (typeof window === 'undefined' || !flightId) {
    return { ...DEFAULT_ROSTER_CONTROLS };
  }

  try {
    const raw = localStorage.getItem(getFlightRosterControlsStorageKey(flightId));
    if (!raw) {
      return { ...DEFAULT_ROSTER_CONTROLS };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_ROSTER_CONTROLS };
    }

    return {
      nameFilter: normalizeString(parsed.nameFilter, DEFAULT_ROSTER_CONTROLS.nameFilter),
      statusFilter: normalizeEnum(
        parsed.statusFilter,
        STATUS_FILTER_VALUES,
        DEFAULT_ROSTER_CONTROLS.statusFilter
      ),
      busFilter: normalizeString(parsed.busFilter, DEFAULT_ROSTER_CONTROLS.busFilter),
      assignedCallerFilter: normalizeString(
        parsed.assignedCallerFilter,
        DEFAULT_ROSTER_CONTROLS.assignedCallerFilter
      ),
      sortBy: normalizeEnum(parsed.sortBy, SORT_BY_VALUES, DEFAULT_ROSTER_CONTROLS.sortBy),
    };
  } catch (error) {
    console.warn('Failed to load flight roster controls:', error);
    return { ...DEFAULT_ROSTER_CONTROLS };
  }
}

/**
 * Save roster controls for a flight.
 * @param {string | null | undefined} flightId
 * @param {Partial<typeof DEFAULT_ROSTER_CONTROLS>} controls
 */
export function saveFlightRosterControls(flightId, controls) {
  if (typeof window === 'undefined' || !flightId) {
    return;
  }

  const payload = {
    version: ROSTER_CONTROLS_SCHEMA_VERSION,
    nameFilter: normalizeString(controls.nameFilter, DEFAULT_ROSTER_CONTROLS.nameFilter),
    statusFilter: normalizeEnum(
      controls.statusFilter,
      STATUS_FILTER_VALUES,
      DEFAULT_ROSTER_CONTROLS.statusFilter
    ),
    busFilter: normalizeString(controls.busFilter, DEFAULT_ROSTER_CONTROLS.busFilter),
    assignedCallerFilter: normalizeString(
      controls.assignedCallerFilter,
      DEFAULT_ROSTER_CONTROLS.assignedCallerFilter
    ),
    sortBy: normalizeEnum(controls.sortBy, SORT_BY_VALUES, DEFAULT_ROSTER_CONTROLS.sortBy),
  };

  try {
    localStorage.setItem(getFlightRosterControlsStorageKey(flightId), JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save flight roster controls:', error);
  }
}

/**
 * Reset persisted roster controls for a flight to defaults.
 * @param {string | null | undefined} flightId
 * @returns {typeof DEFAULT_ROSTER_CONTROLS}
 */
export function resetFlightRosterControls(flightId) {
  const defaults = { ...DEFAULT_ROSTER_CONTROLS };
  saveFlightRosterControls(flightId, defaults);
  return defaults;
}
