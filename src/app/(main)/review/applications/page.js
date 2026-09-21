'use client';

import * as React from 'react';

import { ListPageLayout } from '@/components/main/layout/list-page-layout';
import { ReviewApplicationsView } from '@/components/main/review/review-applications-view';

export default function Page() {
  React.useEffect(() => {
    document.title = 'Application Review | Stars and Stripes Honor Flight';
  }, []);

  return (
    <ListPageLayout
      title="Application Review"
      description="Review online veteran and guardian applications before accepting them into logistics"
    >
      <ReviewApplicationsView />
    </ListPageLayout>
  );
}
