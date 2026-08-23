import { rolesFromGroupProbe } from '../group-probe';

describe('rolesFromGroupProbe', () => {
  const groupEmail = 'sshf_app_dev_full_access@example.com';

  test('returns the role when the API reports membership', () => {
    expect(rolesFromGroupProbe(groupEmail, { hasgroup: true })).toEqual({
      roles: [{ name: groupEmail, email: groupEmail }],
      probeFailed: false,
    });
  });

  test('returns no roles when the API reports non-membership', () => {
    expect(rolesFromGroupProbe(groupEmail, { hasgroup: false })).toEqual({
      roles: [],
      probeFailed: false,
    });
  });

  test('marks probeFailed when the hasgroup request errors instead of treating it as non-membership', () => {
    expect(rolesFromGroupProbe(groupEmail, { error: new Error('Failed to fetch') })).toEqual({
      roles: [],
      probeFailed: true,
    });
  });
});
