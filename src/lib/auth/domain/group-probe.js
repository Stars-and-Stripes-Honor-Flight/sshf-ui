/**
 * Interpret GET /user/hasgroup for UI role preloading.
 * A transport/API failure is not the same as "not a member".
 */
export function rolesFromGroupProbe(groupEmail, result = {}) {
  if (result.error) {
    return { roles: [], probeFailed: true };
  }

  if (result.hasgroup && groupEmail) {
    return {
      roles: [{ name: groupEmail, email: groupEmail }],
      probeFailed: false,
    };
  }

  return { roles: [], probeFailed: false };
}
