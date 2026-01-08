'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid2';

export function FormCheckboxField({ 
  control, 
  name, 
  label, 
  error, 
  gridProps = {},
  ...other 
}) {
  return (
    <Grid {...gridProps}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox 
                {...field} 
                checked={field.value || false}
                {...other}
              />
            }
            label={label}
          />
        )}
      />
    </Grid>
  );
}

