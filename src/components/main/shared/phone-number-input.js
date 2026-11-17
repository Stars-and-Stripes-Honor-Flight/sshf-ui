'use client';

import * as React from 'react';

import { formatPhoneNumber } from '@/lib/format-phone-number';

function caretForDigitCount(formatted, digitCount) {
  if (digitCount <= 0) {
    return 0;
  }
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      seen += 1;
      if (seen === digitCount) {
        const next = index + 1;
        return formatted[next] === '-' ? next + 1 : next;
      }
    }
  }
  return formatted.length;
}

/**
 * Masked phone input (issue #281). Controlled string: `onChange` and `onBlur` receive the formatted value.
 */
export const PhoneNumberInput = React.forwardRef(function PhoneNumberInput(
  { value = '', onChange, onBlur, name, disabled = false, placeholder, inputProps = {} },
  ref
) {
  const inputRef = React.useRef(null);
  const pendingDigits = React.useRef(null);

  React.useImperativeHandle(ref, () => inputRef.current);

  React.useLayoutEffect(() => {
    const digits = pendingDigits.current;
    const node = inputRef.current;
    if (digits == null || !node) {
      return;
    }
    const next = caretForDigitCount(node.value, digits);
    node.setSelectionRange(next, next);
    pendingDigits.current = null;
  });

  const handleChange = (event) => {
    const raw = event.target.value;
    const selection = event.target.selectionStart ?? raw.length;
    const digitsBefore = raw.slice(0, selection).replace(/\D/g, '').length;
    const formatted = formatPhoneNumber(raw);
    pendingDigits.current = digitsBefore;
    event.target.value = formatted;
    const caret = caretForDigitCount(formatted, digitsBefore);
    event.target.setSelectionRange(caret, caret);
    onChange?.(formatted);
  };

  const handleBlur = (event) => {
    onBlur?.(formatPhoneNumber(event.target.value));
  };

  const { 'aria-label': ariaLabel, ...restInputProps } = inputProps;

  return (
    <input
      ref={inputRef}
      name={name}
      type="tel"
      inputMode="tel"
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      {...restInputProps}
      value={value ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});
