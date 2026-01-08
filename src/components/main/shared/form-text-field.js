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
  // Extract InputProps and other props that shouldn't be passed to OutlinedInput
  // We need to be careful not to pass any unknown props to OutlinedInput
  const { 
    InputProps: otherInputProps, 
    inputProps: otherInputPropsLower,
    // Explicitly filter out any props that might cause issues
    ...restOther 
  } = other;
  // Combine InputProps from both sources
  const finalInputProps = inputPropsProp || otherInputProps;
  
  return (
    <Grid {...gridProps}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          // Extract ref from field to avoid passing it to OutlinedInput
          const { ref, ...fieldProps } = field;
          return (
            <FormControl error={Boolean(error)} fullWidth={fullWidth}>
              <InputLabel required={required}>{label}</InputLabel>
              <OutlinedInput 
                {...fieldProps}
                inputRef={ref}
                type={type}
                multiline={multiline}
                rows={rows}
                inputProps={{ ...inputProps, ...otherInputPropsLower }}
                {...(finalInputProps ? { InputProps: finalInputProps } : {})}
                // Don't spread restOther - it may contain props that shouldn't be passed to OutlinedInput
                // If additional props are needed, they should be explicitly passed
              />
              {error ? <FormHelperText>{error.message}</FormHelperText> : null}
            </FormControl>
          );
        }}
      />
    </Grid>
  );
}

