'use client';

import * as React from 'react';
import { 
    FormControl,
    OutlinedInput,
    Button,
    Typography } from '@mui/material';
import { FilterButton, FilterPopover, useFilterContext } from '@/components/core/filter-button';

// Debounce function to delay execution
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export function TextFilterButton ({
  value,
  label,
  handleChange,
  applyMode = 'debounced',
  helperText = '*Filter is Case Insensitive',
  placeholder = '',
  validate,
}) {

    return (
        <FilterButton
            key={label}
            displayValue={value || undefined}
            label={label}
            onFilterApply={(value) => {
              handleChange(value);
            }}
            onFilterDelete={() => {
              handleChange();
            }}
            popover={
              <TextFilterPopover
                label={label}
                applyMode={applyMode}
                helperText={helperText}
                placeholder={placeholder}
                validate={validate}
              />
            }
            value={value || undefined}
        />
    );
}

function TextFilterPopover ({
  label = '',
  applyMode = 'debounced',
  helperText = '*Filter is Case Insensitive',
  placeholder = '',
  validate,
}) {
    const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
    const [value, setValue] = React.useState('');
    const [validationMessage, setValidationMessage] = React.useState('');
    
    // Create a debounced version of onApply that doesn't close the popover
    const debouncedApply = React.useCallback(
      debounce((newValue) => {
        // Apply the filter without closing the popover
        onApply(newValue, { keepOpen: true });
      }, 500),
      [onApply]
    );

    const runValidation = React.useCallback((nextValue) => {
      if (!validate) {
        setValidationMessage('');
        return { valid: true };
      }

      const result = validate(nextValue);
      setValidationMessage(result.valid ? '' : result.message);
      return result;
    }, [validate]);
  
    React.useEffect(() => {
      setValue(initialValue ?? '');
      setValidationMessage('');
    }, [initialValue]);
  
    // Handle input change
    const handleInputChange = (event) => {
      const newValue = event.target.value;
      setValue(newValue);

      if (applyMode === 'debounced') {
        debouncedApply(newValue);
        return;
      }

      runValidation(newValue);
    };

    const handleApply = () => {
      if (validate) {
        const result = runValidation(value);
        if (!result.valid) {
          return;
        }
      }

      onApply(value);
    };
  
    return (
      <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title={`Filter by ${label}`}>
        <FormControl>
          <OutlinedInput
            onChange={handleInputChange}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                handleApply();
              }
            }}
            placeholder={placeholder}
            value={value}
          />
          <Typography variant="caption" color={validationMessage ? 'error' : 'textSecondary'}>
            {validationMessage || helperText}
          </Typography>
        </FormControl>
        <Button
          onClick={handleApply}
          variant="contained"
        >
          Apply
        </Button>
      </FilterPopover>
    );
  }
