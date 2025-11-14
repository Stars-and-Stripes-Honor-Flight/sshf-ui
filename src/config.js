import { AuthStrategy } from '@/lib/auth/strategy';
import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';

export const config = {
  site: {
    name: 'Stars and Stripes Honor Flight',
    description: '',
    language: 'en',
    themeColor: '#090a0b',
    primaryColor: 'honorFlightBlue',
    url: getSiteURL(),
    version: process.env.NEXT_PUBLIC_SITE_VERSION || '0.0.0',
  },
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || LogLevel.ALL,
  auth: { strategy: AuthStrategy.DOMAIN },
  mapbox: { apiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY },
  gtm: { id: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID },





};
