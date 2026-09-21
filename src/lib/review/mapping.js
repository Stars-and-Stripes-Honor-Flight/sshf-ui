import { normalizeServiceBranchForLogistics } from '@/lib/review/normalize';

/**
 * Mirrors sshf-api VeteranApplication.guardianPreferenceNote() — used for
 * documentation/tests; production accept mapping runs on POST .../accept.
 */
export function buildVeteranGuardianPreferenceNote(guardian = {}) {
  const details = [];
  if (guardian.pref_phone) {
    details.push(`Phone: ${guardian.pref_phone}`);
  }
  if (guardian.pref_email) {
    details.push(`Email: ${guardian.pref_email}`);
  }
  if (details.length === 0) {
    return guardian.pref_notes || '';
  }
  const suffix = `(${details.join(', ')})`;
  return guardian.pref_notes ? `${guardian.pref_notes} ${suffix}` : suffix;
}

/**
 * Preview of service branch on the logistics veteran record after accept.
 */
export function mapServiceBranchForAcceptPreview(branch) {
  return normalizeServiceBranchForLogistics(branch);
}
