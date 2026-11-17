'use client';

import * as React from 'react';

/**
 * Masked phone input (issue #281). Stub only.
 * Tests in `phone-number-input.test.js` pin the controlled string contract:
 * `onChange` and `onBlur` receive the formatted string, `name` and `inputProps`
 * reach the native input, and `disabled` disables it.
 */
export const PhoneNumberInput = React.forwardRef(function PhoneNumberInput(
  { value = '', onChange, onBlur, name, disabled = false, placeholder, inputProps = {} },
  ref
) {
  return (
    <input
      ref={ref}
      name={name}
      disabled={disabled}
      placeholder={placeholder}
      {...inputProps}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      onBlur={(event) => onBlur?.(event.target.value)}
    />
  );
});
