'use client';

import * as React from 'react';

import { VerticalLayout } from './vertical/vertical-layout';

export function DynamicLayout({ children }) {
  return <VerticalLayout>{children}</VerticalLayout>
}
