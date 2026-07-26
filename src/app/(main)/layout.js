import * as React from 'react';
import PropTypes from 'prop-types';
import { AuthGuard } from '@/components/auth/auth-guard';
import { FullAccessGuard } from '@/components/auth/full-access-guard';
import { DynamicLayout } from '@/components/main/layout/dynamic-layout';

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <DynamicLayout>
        <FullAccessGuard>{children}</FullAccessGuard>
      </DynamicLayout>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.any.isRequired
};
