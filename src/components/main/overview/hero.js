'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';

export function Hero() {
  const { colorScheme } = useColorScheme();

  const [img, setImg] = React.useState('/assets/home-hero-light.png');

  React.useEffect(() => {
    setImg(colorScheme === 'dark' ? '/assets/home-hero-dark.png' : '/assets/home-hero-light.png');
  }, [colorScheme]);

  return (
    <Box
      sx={{
        bgcolor: '#191919',
        color: 'var(--mui-palette-common-white)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
    </Box>
  );
}