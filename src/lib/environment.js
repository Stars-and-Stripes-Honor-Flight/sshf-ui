// Environment identity for the client bundle. NEXT_PUBLIC_ENVIRONMENT is
// inlined at build time (e.g. "Development", "Production"); anything other
// than Production shows the warning banner so non-prod deployments are obvious.
export function getEnvironmentBanner() {
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT || '').trim();
  const isProduction = environment.toLowerCase() === 'production';

  return {
    show: !isProduction,
    label: `${(environment || 'Test').toUpperCase()} ENVIRONMENT`,
  };
}
