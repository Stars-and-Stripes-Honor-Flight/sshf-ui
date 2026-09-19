'use client'

import * as React from 'react';

import { WaitlistView } from '@/components/main/waitlist/waitlist-view';
import { ListPageLayout } from '@/components/main/layout/list-page-layout';

export default function Page() {
  return (
    <ListPageLayout
      title="Waitlist"
      description="View veterans and guardians waiting to be assigned"
    >
      <WaitlistView />
    </ListPageLayout>
  );
}
