'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid2';
import { FormTextField } from './form-text-field';

export function NameFields({ control, errors, showNickname = true, nicknameGridProps = { xs: 12, md: 4 }, disabled = false }) {
  return (
    <>
      <FormTextField
        control={control}
        name="name.first"
        label="First Name"
        error={errors.name?.first}
        required
        disabled={disabled}
        gridProps={{ xs: 12, md: 4 }}
      />
      <FormTextField
        control={control}
        name="name.middle"
        label="Middle Name"
        error={errors.name?.middle}
        disabled={disabled}
        gridProps={{ xs: 12, md: 4 }}
      />
      <FormTextField
        control={control}
        name="name.last"
        label="Last Name"
        error={errors.name?.last}
        required
        disabled={disabled}
        gridProps={{ xs: 12, md: 4 }}
      />
      {showNickname && (
        <FormTextField
          control={control}
          name="name.nickname"
          label="Nickname"
          error={errors.name?.nickname}
          disabled={disabled}
          gridProps={nicknameGridProps}
        />
      )}
    </>
  );
}

