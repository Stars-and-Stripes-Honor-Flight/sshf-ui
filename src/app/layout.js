'use client';

import * as React from 'react';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import '@/styles/global.css';

import { config } from '@/config';
import { applyDefaultSettings } from '@/lib/settings/apply-default-settings';
import { UserProvider } from '@/contexts/auth/user-context';
import { SettingsProvider } from '@/contexts/settings';
import { Analytics } from '@/components/core/analytics';
import { I18nProvider } from '@/components/core/i18n-provider';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { SettingsButton } from '@/components/core/settings/settings-button';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { Toaster } from '@/components/core/toaster';


export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: config.site.themeColor,
};

export default async function Layout({ children }) {
  const settings = applyDefaultSettings();

  return (
    <html lang={settings.language} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <Analytics>
          <LocalizationProvider>
            <UserProvider>
              <SettingsProvider settings={settings}>
                <I18nProvider lng={settings.language}>
                  <ThemeProvider>
                    {children}
                    <SettingsButton />
                    <Toaster position="bottom-right" />
                  </ThemeProvider>
                </I18nProvider>
              </SettingsProvider>
            </UserProvider>
          </LocalizationProvider>
        </Analytics>
      </body>
    </html>
  );
}
