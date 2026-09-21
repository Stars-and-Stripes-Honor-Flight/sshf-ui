import { SERVICE_BRANCHES } from '@/lib/review/constants';

/**
 * Normalize a phone number to NNN-NNN-NNNN when it contains exactly 10 digits.
 * Mirrors sshf-api `fixPhone` (legacy intake / reviewer corrections).
 */
export function fixPhone(phone) {
  if (phone === null || phone === undefined) {
    return '';
  }
  const raw = String(phone);
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return raw.trim();
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function isValidYmd(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

/**
 * Parse MM/DD/YYYY, M/D/YYYY, or YYYY-MM-DD to ISO YYYY-MM-DD.
 */
export function parseLegacyDate(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const text = String(value).trim();
  if (!text) {
    return '';
  }

  let match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    return isValidYmd(year, month, day) ? `${year}-${pad2(month)}-${pad2(day)}` : '';
  }

  match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    return isValidYmd(year, month, day) ? `${year}-${pad2(month)}-${pad2(day)}` : '';
  }

  return '';
}

/**
 * Legacy vetedit/grdedit birth date assembly from year/month/day parts.
 * Returns '' when parts are empty or the date is invalid.
 */
export function assembleBirthDateFromParts({ year, month, day }) {
  const y = String(year ?? '').trim();
  const m = String(month ?? '').trim();
  const d = String(day ?? '').trim();
  const combined = `${y}-${m}-${d}`;
  if (combined === '--' || combined === '-') {
    return '';
  }
  if (!y || !m || !d) {
    return '';
  }
  const birthYear = parseInt(y, 10);
  const birthMonth = parseInt(m, 10);
  const birthDay = parseInt(d, 10);
  if (!Number.isFinite(birthYear) || !Number.isFinite(birthMonth) || !Number.isFinite(birthDay)) {
    return '';
  }
  const date = new Date(birthYear, birthMonth - 1, birthDay);
  if (
    date.getFullYear() === birthYear
    && date.getMonth() === birthMonth - 1
    && date.getDate() === birthDay
  ) {
    return `${birthYear}-${pad2(birthMonth)}-${pad2(birthDay)}`;
  }
  return '';
}

/** First-letter gender normalization (legacy acceptVetApp / acceptGrdApp). */
export function normalizeGender(value) {
  const first = typeof value === 'string' ? value.trim().charAt(0).toUpperCase() : '';
  return first === 'F' ? 'F' : 'M';
}

export function normalizeState(state) {
  return typeof state === 'string' ? state.trim().toUpperCase() : '';
}

/**
 * Logistics records store an empty branch when the application had "Unknown".
 */
export function normalizeServiceBranchForLogistics(branch) {
  if (branch === 'Unknown') {
    return '';
  }
  return branch ?? '';
}

export function isValidServiceBranch(branch) {
  return SERVICE_BRANCHES.includes(branch ?? '');
}

function normalizeAddress(address = {}) {
  return {
    ...address,
    state: normalizeState(address.state),
    phone_day: fixPhone(address.phone_day),
    phone_mbl: fixPhone(address.phone_mbl),
  };
}

function normalizeEmergContact(emerg = {}) {
  return {
    ...emerg,
    address: {
      ...(emerg.address || {}),
      phone: fixPhone(emerg.address?.phone),
    },
  };
}

/**
 * Apply reviewer-side normalization before PUT /review/applications/:id.
 */
export function normalizeReviewApplicationFields(application) {
  const next = {
    ...application,
    gender: normalizeGender(application.gender),
    birth_date: application.birth_date ? parseLegacyDate(application.birth_date) || application.birth_date : '',
    address: normalizeAddress(application.address),
    emerg_contact: normalizeEmergContact(application.emerg_contact),
  };

  if (next.service?.branch !== undefined) {
    next.service = {
      ...next.service,
      branch: next.service.branch ?? '',
    };
  }

  return next;
}

/**
 * Merge form values onto the loaded application and normalize for save.
 */
export function prepareReviewApplicationPayload(existing, formValues) {
  const merged = {
    ...existing,
    ...formValues,
    name: { ...existing.name, ...formValues.name },
    address: { ...existing.address, ...formValues.address },
    shirt: { ...existing.shirt, ...formValues.shirt },
    emerg_contact: {
      ...existing.emerg_contact,
      ...formValues.emerg_contact,
      address: {
        ...existing.emerg_contact?.address,
        ...formValues.emerg_contact?.address,
      },
    },
    guardian: formValues.guardian
      ? { ...existing.guardian, ...formValues.guardian }
      : existing.guardian,
    veteran: formValues.veteran
      ? { ...existing.veteran, ...formValues.veteran }
      : existing.veteran,
    service: formValues.service
      ? { ...existing.service, ...formValues.service }
      : existing.service,
    medical: formValues.medical
      ? { ...existing.medical, ...formValues.medical }
      : existing.medical,
  };

  return normalizeReviewApplicationFields(merged);
}
