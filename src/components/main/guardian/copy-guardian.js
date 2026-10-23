/**
 * Build a POST /guardians payload from a saved guardian.
 * Matches the legacy HF Basic copy-new field list: personal and contact
 * details are kept, and call, flight, pairings, apparel, and medical release
 * are reset. Identity and metadata are omitted so the API stamps a new record.
 * Does not mutate `source`.
 */
function formatHistoryId(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function cloneGuardian(source) {
  return JSON.parse(JSON.stringify(source));
}

export function buildCopiedGuardianPayload(source, { copiedBy = '', now = new Date() } = {}) {
  const copy = cloneGuardian(source);
  const sourceId = copy._id ?? '';
  const sourceRev = copy._rev ?? '';

  delete copy._id;
  delete copy._rev;
  delete copy.metadata;

  const historyId = formatHistoryId(now);

  copy.type = 'Guardian';
  copy.app_date = historyId.slice(0, 10);

  copy.call = {
    assigned_to: '',
    notes: '',
    fm_number: '',
    email_sent: false,
    mail_sent: false,
    how_heard_about: 'Unknown',
  };

  copy.flight = {
    id: 'None',
    status: 'Copied',
    group: '',
    bus: 'None',
    seat: '',
    confirmed_date: '',
    confirmed_by: '',
    status_note: '',
    nofly: false,
    vaccinated: false,
    mediaWaiver: false,
    infection_test: false,
    waiver: false,
    training: 'None',
    training_notes: '',
    training_see_doc: false,
    training_complete: false,
    paid: false,
    exempt: false,
    booksOrdered: 0,
    history: [
      {
        id: historyId,
        change: `copied guardian from doc id: ${sourceId} rev: ${sourceRev} by: ${copiedBy}`,
      },
    ],
  };

  copy.veteran = {
    pref_notes: '',
    pairings: [],
  };

  copy.medical = {
    ...(copy.medical || {}),
    release: false,
    limitations: '',
  };

  copy.apparel = {
    item: 'None',
    jacket_size: 'None',
    shirt_size: 'None',
    delivery: 'None',
    date: '',
    by: '',
    notes: '',
  };

  return copy;
}
