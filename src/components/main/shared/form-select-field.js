'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid2';
import { Option } from '@/components/core/option';

export function FormSelectField({ 
  control, 
  name, 
  label, 
  error, 
  required = false, 
  fullWidth = true,
  options = [],
  gridProps = {},
  ...other 
}) {
  return (
    <Grid {...gridProps}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FormControl error={Boolean(error)} fullWidth={fullWidth}>
            <InputLabel required={required}>{label}</InputLabel>
            <Select {...field} {...other}>
              {options.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            {error ? <FormHelperText>{error.message}</FormHelperText> : null}
          </FormControl>
        )}
      />
    </Grid>
  );
}

