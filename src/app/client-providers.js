'use client';

import * as React from 'react';
import { UserProvider } from '@/contexts/auth/user-context';
import { SettingsProvider } from '@/contexts/settings';
import { Analytics } from '@/components/core/analytics';
import { I18nProvider } from '@/components/core/i18n-provider';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { SettingsButton } from '@/components/core/settings/settings-button';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { Toaster } from '@/components/core/toaster';

export function ClientProviders({ children, settings }) {
  return (
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
  );
}

