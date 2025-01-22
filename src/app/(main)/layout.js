import * as React from 'react';
import PropTypes from 'prop-types';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DynamicLayout } from '@/components/main/layout/dynamic-layout';



export default function Layout({ children }) {
  return (
    <AuthGuard>
      <DynamicLayout>{children}</DynamicLayout>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.any.isRequired
};