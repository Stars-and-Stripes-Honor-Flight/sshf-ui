'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';

import { config } from '@/config';
// import { setSettings as setPersistedSettings } from '@/lib/settings/set-settings';
import { useSettings } from '@/hooks/use-settings';

import { SettingsDrawer } from './settings-drawer';

export function SettingsButton() {
  const { settings } = useSettings();
  const { setColorScheme } = useColorScheme();
  const router = useRouter();

  const [openDrawer, setOpenDrawer] = React.useState(false);

  const handleUpdate = async (values) => {
    if (values.colorScheme) {
      setColorScheme(values.colorScheme);
    }

    const updatedSettings = { ...settings, ...values };

    // await setPersistedSettings(updatedSettings);

    // Refresh the router to apply the new settings.
    router.refresh();
  };

  const handleReset = async () => {
    setColorScheme(config.site.colorScheme);

    // await setPersistedSettings({});

    // Refresh the router to apply the new settings.
    router.refresh();
  };

  return (
    <React.Fragment>
    </React.Fragment>
  );
}
