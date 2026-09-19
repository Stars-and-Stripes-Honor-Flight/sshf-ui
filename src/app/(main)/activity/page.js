'use client'

import * as React from 'react';
import Card from '@mui/material/Card';

import { ActivityList } from '@/components/main/activity/activity-list';
import { ListPageLayout } from '@/components/main/layout/list-page-layout';

export default function Page() {
  return (
    <ListPageLayout
      title="Recent Activity"
      description="View recent changes to veterans, guardians, flights, and calls"
    >
      <Card>
        <ActivityList />
      </Card>
    </ListPageLayout>
  );
}
