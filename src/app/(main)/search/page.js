'use client'

import * as React from 'react';
import Card from '@mui/material/Card';

import { ListPageLayout } from '@/components/main/layout/list-page-layout';
import { SearchPageView } from '@/components/main/search/search-page-view';

export default function Page() {
  return (
    <ListPageLayout title="Search Veterans & Guardians">
      <Card>
        <SearchPageView />
      </Card>
    </ListPageLayout>
  );
}
