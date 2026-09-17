'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

/**
 * Checkbox wired to react-hook-form with Controller wrapping FormControlLabel
 * so fields register correctly (required for isDirty / save-disable logic).
 */
export function FormCheckboxField({ control, name, label, disabled = false }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControlLabel
          disabled={disabled}
          control={<Checkbox {...field} checked={field.value} disabled={disabled} />}
          label={label}
        />
      )}
    />
  );
}
