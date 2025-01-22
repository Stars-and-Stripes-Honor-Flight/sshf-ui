import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


import { Hero } from '@/components/main/overview/hero'
import { config } from '@/config';

export const metadata = { title: `Welcome | ${config.site.name}` };

export default function Page() {
  return (
    <Hero/>
  );
}
