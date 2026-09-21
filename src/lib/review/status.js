import { ACCEPT_CONFLICT_MESSAGE, REVIEW_PATCHABLE_STATUSES } from '@/lib/review/constants';

export function isPatchableReviewStatus(status) {
  return REVIEW_PATCHABLE_STATUSES.includes(status);
}

export function getAcceptConflictMessage(error) {
  if (error?.status === 409) {
    return error.message || ACCEPT_CONFLICT_MESSAGE;
  }
  return null;
}

export function reviewStatusLabel(status) {
  const labels = {
    New: 'New',
    Hold: 'Hold',
    Accepted: 'Accepted',
    Rejected: 'Rejected',
    Trash: 'Trash',
  };
  return labels[status] || status;
}
