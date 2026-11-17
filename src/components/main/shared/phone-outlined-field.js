'use client';

import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import { PhoneNumberInput } from '@/components/main/shared/phone-number-input';

export function PhoneOutlinedField({ field, label, error, required = false, disabled = false, helperText }) {
  return (
    <FormControl error={Boolean(error)} fullWidth disabled={disabled}>
      <InputLabel required={required}>{label}</InputLabel>
      <OutlinedInput
        value={field.value ?? ''}
        onChange={() => {}}
        inputRef={field.ref}
        inputComponent={PhoneNumberInput}
        inputProps={{
          value: field.value ?? '',
          onChange: field.onChange,
          onBlur: field.onBlur,
          name: field.name,
          disabled,
        }}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
