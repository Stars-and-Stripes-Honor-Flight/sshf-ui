/**
 * Build a full veteran or guardian PUT body from a fetched record plus a partial update.
 * Nested name, address, flight, and call objects are merged so a roster edit does not
 * drop sibling fields. History arrays are omitted; the API records those itself.
 */

const NESTED_MERGE_KEYS = ['name', 'address', 'flight', 'call'];

/**
 * @param {Object} fullPerson - Record returned by getVeteran or getGuardian
 * @param {Object} updates - Partial nested update from the roster
 * @param {string} personType - "Veteran" or "Guardian"
 * @returns {Object}
 */
export function buildPersonUpdatePayload(fullPerson, updates, personType) {
  const payload = {
    ...fullPerson,
    ...updates,
    _rev: fullPerson?._rev,
    type: personType,
  };

  for (const key of NESTED_MERGE_KEYS) {
    if (updates?.[key] && typeof updates[key] === 'object') {
      payload[key] = {
        ...(fullPerson?.[key] || {}),
        ...updates[key],
      };
    }
  }

  delete payload.metadata;

  if (payload.flight?.history) delete payload.flight.history;
  if (payload.veteran?.history) delete payload.veteran.history;
  if (payload.guardian?.history) delete payload.guardian.history;
  if (payload.call?.history) delete payload.call.history;

  return payload;
}
