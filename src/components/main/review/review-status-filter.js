'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { REVIEW_APPLICATION_STATUSES } from '@/lib/review/constants';

export function ReviewStatusFilter({ value, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="Review application status"
    >
      {REVIEW_APPLICATION_STATUSES.map((status) => (
        <Tab key={status} label={status} value={status} />
      ))}
    </Tabs>
  );
}
