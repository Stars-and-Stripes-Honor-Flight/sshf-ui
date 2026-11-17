'use client';

import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import { formatPhoneNumber } from '@/lib/format-phone-number';
import { PhoneNumberInput } from '@/components/main/shared/phone-number-input';

/**
 * Inline roster mobile phone editor (issue #281). Legacy 10-digit values display formatted;
 * blur saves only after the user edits the field.
 */
export function RosterMobilePhoneField({
  value,
  onBlur,
  disabled = false,
  placeholder = 'Mobile',
  maxWidth = 170,
  inputProps = {},
}) {
  const [localValue, setLocalValue] = React.useState(() => formatPhoneNumber(value ?? ''));
  const [isSaving, setIsSaving] = React.useState(false);
  const userEditedRef = React.useRef(false);

  React.useEffect(() => {
    setLocalValue(formatPhoneNumber(value ?? ''));
    userEditedRef.current = false;
  }, [value]);

  const commitBlur = async () => {
    if (!userEditedRef.current) {
      return;
    }
    const formatted = formatPhoneNumber(localValue);
    if (formatted === formatPhoneNumber(value ?? '')) {
      return;
    }
    setIsSaving(true);
    try {
      await onBlur(formatted);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      disabled={disabled || isSaving}
      variant="outlined"
      sx={{ maxWidth, position: 'relative' }}
      InputProps={{
        disableInjectingGlobalStyles: true,
        inputComponent: PhoneNumberInput,
        inputProps: {
          value: localValue,
          onChange: (next) => {
            userEditedRef.current = true;
            setLocalValue(next);
          },
          onBlur: () => {
            void commitBlur();
          },
          disabled: disabled || isSaving,
          inputProps,
        },
        endAdornment: isSaving ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null,
      }}
      // MUI TextField controlled shell; PhoneNumberInput owns the value.
      value={localValue}
      onChange={() => {}}
    />
  );
}
