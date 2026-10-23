import { ACTIVITY_PRESETS, getColumnConfig } from '@/components/main/flight/column-configs';

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * First A–Z letter of a last name after trimming, accent folding, and skipping
 * a leading non-letter. Null when the name has no A–Z letter.
 * @param {string|undefined|null} nameLast
 * @returns {string|null}
 */
export function lastNameLetter(nameLast) {
  const trimmed = (nameLast ?? '').trim();
  if (!trimmed) return null;

  const folded = trimmed.normalize('NFD').replace(/\p{M}/gu, '');
  const match = folded.match(/\p{L}/u);
  if (!match) return null;

  const upper = match[0].toLocaleUpperCase('en-US');
  if (!/^[A-Z]$/.test(upper)) return null;
  return upper;
}

function compareGuardianNames(left, right) {
  const byLast = (left.name_last ?? '').localeCompare(right.name_last ?? '', 'en', { sensitivity: 'base' });
  if (byLast !== 0) return byLast;

  const byFirst = (left.name_first ?? '').localeCompare(right.name_first ?? '', 'en', { sensitivity: 'base' });
  if (byFirst !== 0) return byFirst;

  return String(left.id ?? '').localeCompare(String(right.id ?? ''));
}

function letterIndex(letter) {
  return letter.charCodeAt(0);
}

/**
 * A mail-call box is checked only when every paired veteran on this flight
 * has the flag. One veteran uses that veteran's flag. None is blank.
 * @param {Array} veterans
 * @param {string} field
 * @returns {boolean}
 */
function allVeteransHaveFlag(veterans, field) {
  if (!veterans.length) return false;
  return veterans.every((veteran) => veteran?.[field] === true);
}

/**
 * Guardians whose last-name letter is inside an inclusive A–Z range.
 * One row per guardian id. Mail-call flags use the all-veterans rule.
 * @param {Array} pairs
 * @param {string} fromLetter
 * @param {string} toLetter
 * @returns {{ ok: boolean, reason?: string, guardians: Array, omittedUnlettered: number }}
 */
export function selectGuardiansInLetterRange(pairs, fromLetter, toLetter) {
  const from = typeof fromLetter === 'string' ? fromLetter.toUpperCase() : '';
  const to = typeof toLetter === 'string' ? toLetter.toUpperCase() : '';
  if (!/^[A-Z]$/.test(from) || !/^[A-Z]$/.test(to)) {
    return { ok: false, reason: 'invalid-letter', guardians: [], omittedUnlettered: 0 };
  }
  if (letterIndex(from) > letterIndex(to)) {
    return { ok: false, reason: 'inverted-range', guardians: [], omittedUnlettered: 0 };
  }

  const byId = new Map();

  for (const pair of pairs || []) {
    const people = Array.isArray(pair?.people) ? pair.people : [];
    const guardians = people.filter((person) => person?.type === 'Guardian' && person.id != null);
    const veterans = people.filter((person) => person?.type === 'Veteran');

    for (const guardian of guardians) {
      const existing = byId.get(guardian.id);
      if (existing) {
        existing.veterans.push(...veterans);
      } else {
        byId.set(guardian.id, { person: guardian, veterans: [...veterans] });
      }
    }
  }

  const guardians = [];
  let omittedUnlettered = 0;

  for (const entry of byId.values()) {
    const letter = lastNameLetter(entry.person.name_last);
    if (!letter) {
      omittedUnlettered += 1;
      continue;
    }
    if (letterIndex(letter) < letterIndex(from) || letterIndex(letter) > letterIndex(to)) {
      continue;
    }
    guardians.push({
      person: entry.person,
      mailCallReceived: allVeteransHaveFlag(entry.veterans, 'mail_call_received'),
      mailCallAdopt: allVeteransHaveFlag(entry.veterans, 'mail_call_adopt'),
    });
  }

  guardians.sort((left, right) => compareGuardianNames(left.person, right.person));

  return { ok: true, guardians, omittedUnlettered };
}

/**
 * @param {object|undefined|null} person
 * @returns {string}
 */
export function formatGuardianListName(person) {
  const last = (person?.name_last ?? '').trim();
  const first = (person?.name_first ?? '').trim();
  if (last && first) return `${last}, ${first}`;
  return last || first || '—';
}

/**
 * MMMM DD, YYYY from a YYYY-MM-DD string, without Date parsing.
 * @param {string|undefined|null} isoDate
 * @returns {string}
 */
export function formatFlightDateLong(isoDate) {
  const text = String(isoDate ?? '').trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return text || '—';

  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return text;
  return `${month} ${match[3]}, ${match[1]}`;
}

/**
 * Printed timestamp. Omit timeZone to use the runtime local zone.
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {string}
 */
export function formatPrintedAt(date, timeZone) {
  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  };
  if (timeZone) options.timeZone = timeZone;
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * PDF date of birth. A real YYYY-MM-DD prints as MM/DD/YYYY.
 * Missing, non-dates, and impossible calendar dates print an em dash.
 * The roster formatter still returns an unrecognized string unchanged.
 * @param {string|undefined|null} value
 * @returns {string}
 */
function formatGuardianListDob(value) {
  if (typeof value !== 'string') return '—';
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '—';

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    return '—';
  }

  return `${match[2]}/${match[3]}/${match[1]}`;
}

/**
 * @param {Array<{ person: object, mailCallReceived: boolean, mailCallAdopt: boolean }>} guardians
 * @returns {Array}
 */
export function buildGuardianListRows(guardians) {
  return (guardians || []).map(({ person, mailCallReceived, mailCallAdopt }) => {
    const training = (person?.training ?? '').trim();
    return {
      id: person?.id,
      name: formatGuardianListName(person),
      middle: (person?.name_middle ?? '').trim(),
      mobile: typeof person?.phone_mbl === 'string' ? person.phone_mbl : '',
      dob: formatGuardianListDob(person?.birth_date),
      training: training || '—',
      trainingComplete: Boolean(person?.training_complete),
      trainingNotes: person?.flight_training_notes ?? '',
      waiver: Boolean(person?.flight_waiver),
      seeDoc: Boolean(person?.flight_training_see_doc),
      mailCallReceived: Boolean(mailCallReceived),
      mailCallAdopt: Boolean(mailCallAdopt),
    };
  });
}

/**
 * PDF columns: Name, guardian Training labels, Mail Rcvd, Mail Adopt, Checked in.
 * @returns {Array<{ id: string, label: string }>}
 */
export function getGuardianListColumns() {
  const training = getColumnConfig(ACTIVITY_PRESETS.TRAINING, true).map(({ id, label }) => ({ id, label }));
  return [
    { id: 'name', label: 'Name' },
    ...training,
    { id: 'mail_call_received', label: 'Mail Rcvd' },
    { id: 'mail_call_adopt', label: 'Mail Adopt' },
    { id: 'checked_in', label: 'Checked in' },
  ];
}
