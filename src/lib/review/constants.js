/** Review workflow statuses (matches OpenAPI / legacy hf-app-review). */
export const REVIEW_APPLICATION_STATUSES = ['New', 'Hold', 'Accepted', 'Rejected', 'Trash'];

/** Statuses reviewers can set via PATCH /review/applications/:id/status. */
export const REVIEW_PATCHABLE_STATUSES = ['New', 'Hold', 'Rejected', 'Trash'];

export const REVIEW_APPLICATION_TYPES = {
  VETERAN: 'VeteranApp',
  GUARDIAN: 'GuardianApp',
};

export const VET_TYPES = ['WWII', 'Korea', 'Vietnam', 'Afghanistan', 'Iraq', 'Other'];

export const SERVICE_BRANCHES = [
  '',
  'Unknown',
  'Army',
  'Air Force',
  'Navy',
  'Marines',
  'Coast Guard',
];

export const SHIRT_SIZES = ['None', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

export const DEFAULT_LIST_LIMIT = 100;

export const ACCEPT_CONFLICT_MESSAGE =
  'Could not save to waitlist. The logistics record was already modified since the last accept.';
