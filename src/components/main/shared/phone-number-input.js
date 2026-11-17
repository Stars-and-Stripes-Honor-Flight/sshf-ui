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

function assignRef(ref, node) {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  if (ref) {
    ref.current = node;
  }
}

/**
 * Masked phone input (issue #281). Controlled string: `onChange` and `onBlur` receive the formatted value.
 * When used as MUI `inputComponent`, forwards `className`, `ref`, and other InputBase props to the native input.
 */
export const PhoneNumberInput = React.forwardRef(function PhoneNumberInput(props, ref) {
  const {
    value = '',
    onChange,
    onBlur,
    name,
    disabled = false,
    placeholder,
    inputProps = {},
    // MUI InputBase — not valid DOM attributes
    ownerState,
    slots,
    slotProps,
    className,
    ...rest
  } = props;

  void ownerState;
  void slots;
  void slotProps;

  const inputRef = React.useRef(null);
  const pendingDigits = React.useRef(null);

  const handleRef = React.useCallback(
    (node) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

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

  const { 'aria-label': ariaLabel, className: nestedClassName, ...nestedRest } = inputProps;
  const mergedClassName = [className, nestedClassName].filter(Boolean).join(' ') || undefined;

  return (
    <input
      {...rest}
      {...nestedRest}
      ref={handleRef}
      className={mergedClassName}
      name={name}
      type="tel"
      inputMode="tel"
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});