'use client';

import * as React from 'react';

import { FlightsListView } from '@/components/main/flight/flights-list-view';
import { ListPageLayout } from '@/components/main/layout/list-page-layout';

export default function Page() {
  return (
    <ListPageLayout
      title="Search Flights"
      description="View all available flights and their details"
    >
      <FlightsListView />
    </ListPageLayout>
  );
}
