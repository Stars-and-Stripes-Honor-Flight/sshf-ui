'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Grid2';

export function FormTextField({ 
  control, 
  name, 
  label, 
  error, 
  required = false, 
  fullWidth = true,
  type = 'text',
  multiline = false,
  rows = 1,
  inputProps = {},
  InputProps: inputPropsProp,
  gridProps = {},
  ...other 
}) {
  return (
    <Grid {...gridProps}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          // Extract ref from field to avoid passing it to OutlinedInput
          const { ref, ...fieldProps } = field;
          // Extract InputProps from other to prevent it from being passed to DOM
          const { InputProps: otherInputProps, ...restOther } = other;
          // Combine InputProps from both sources
          const finalInputProps = inputPropsProp || otherInputProps;
          // Ensure InputProps is never in restOther (extra safety)
          const { InputProps: _, ...safeRestOther } = restOther;
          return (
            <FormControl error={Boolean(error)} fullWidth={fullWidth}>
              <InputLabel required={required}>{label}</InputLabel>
              <OutlinedInput 
                {...fieldProps}
                inputRef={ref}
                type={type}
                multiline={multiline}
                rows={rows}
                inputProps={inputProps}
                {...(finalInputProps ? { InputProps: finalInputProps } : {})}
                {...safeRestOther}
              />
              {error ? <FormHelperText>{error.message}</FormHelperText> : null}
            </FormControl>
          );
        }}
      />
    </Grid>
  );
}

