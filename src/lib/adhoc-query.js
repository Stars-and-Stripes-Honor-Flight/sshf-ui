// Ad-hoc Query is a Mango _find UI. It must stay off in environments whose
// CouchDB is too old. NEXT_PUBLIC_FEATURE_ADHOC_QUERY is inlined at build time.
export function isAdhocQueryEnabled() {
  return (process.env.NEXT_PUBLIC_FEATURE_ADHOC_QUERY || '').trim() === 'true';
}
