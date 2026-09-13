/**
 * Coordinates roster control hydrate vs persist so we never write default state
 * over saved localStorage in the same commit pass as hydrate.
 */

/**
 * @returns {{ skipNextPersist: boolean, hydratedFlightId: string | null }}
 */
export function createInitialRosterPersistCoordinatorState() {
  return {
    skipNextPersist: false,
    hydratedFlightId: null,
  };
}

/**
 * Call when starting hydrate for a flight (before setState from saved values).
 * @param {{ skipNextPersist: boolean, hydratedFlightId: string | null }} state
 * @returns {{ skipNextPersist: boolean, hydratedFlightId: string | null }}
 */
export function beginRosterControlsHydrate(state) {
  return {
    ...state,
    skipNextPersist: true,
    hydratedFlightId: null,
  };
}

/**
 * Decide whether a persist attempt should run and advance coordinator state.
 * @param {{ skipNextPersist: boolean, hydratedFlightId: string | null }} state
 * @param {string | null | undefined} flightId
 * @returns {{ state: { skipNextPersist: boolean, hydratedFlightId: string | null }, shouldPersist: boolean }}
 */
export function evaluateRosterControlsPersist(state, flightId) {
  if (!flightId) {
    return { state, shouldPersist: false };
  }

  if (state.skipNextPersist) {
    return {
      state: {
        skipNextPersist: false,
        hydratedFlightId: flightId,
      },
      shouldPersist: false,
    };
  }

  if (state.hydratedFlightId !== flightId) {
    return { state, shouldPersist: false };
  }

  return { state, shouldPersist: true };
}
