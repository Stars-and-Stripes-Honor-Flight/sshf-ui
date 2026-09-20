import { ACCEPT_CONFLICT_MESSAGE } from '@/lib/review/constants';
import { getAcceptConflictMessage, isPatchableReviewStatus } from '@/lib/review/status';

describe('review status helpers', () => {
  test('isPatchableReviewStatus excludes Accepted', () => {
    expect(isPatchableReviewStatus('Hold')).toBe(true);
    expect(isPatchableReviewStatus('Accepted')).toBe(false);
  });

  test('getAcceptConflictMessage surfaces 409 errors', () => {
    expect(getAcceptConflictMessage({ status: 409, message: 'conflict' })).toBe('conflict');
    expect(getAcceptConflictMessage({ status: 400 })).toBeNull();
    expect(getAcceptConflictMessage({ status: 409 })).toBe(ACCEPT_CONFLICT_MESSAGE);
  });
});
