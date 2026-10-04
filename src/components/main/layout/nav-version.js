'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';

import { loadApiVersion } from '@/lib/api-version';
import { getUiVersion } from '@/lib/ui-version';

export function NavVersionLine() {
  const uiVersion = getUiVersion();
  const [apiVersion, setApiVersion] = React.useState(undefined);

  React.useEffect(() => {
    let active = true;

    loadApiVersion().then((version) => {
      if (active) {
        setApiVersion(version);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const apiLabel = apiVersion ? apiVersion : apiVersion === null ? 'unknown' : null;
  const label = apiLabel ? `UI ${uiVersion} · API ${apiLabel}` : `UI ${uiVersion}`;

  return (
    <Typography
      component="p"
      sx={{
        color: 'var(--NavGroup-title-color)',
        flexShrink: 0,
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
        m: 0,
        px: 2,
        py: 1.5,
        textAlign: 'center',
      }}
    >
      {label}
    </Typography>
  );
}
