const listeners = new Set();

/** Subscribe to permission-summary refreshes (token refresh or a permission 403). */
export function onPermissionsStale(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyPermissionsStale() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      console.error('Failed to refresh permissions');
    }
  }
}
