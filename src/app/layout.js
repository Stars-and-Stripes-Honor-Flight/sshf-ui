import * as React from 'react';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import '@/styles/global.css';

import { applyDefaultSettings } from '@/lib/settings/apply-default-settings';
import { ClientProviders } from './client-providers';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#090a0b',
};

export default async function Layout({ children }) {
  const settings = applyDefaultSettings();

  return (
    <html lang={settings.language} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <ClientProviders settings={settings}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
