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

export function TextFilterButton ({ value, label, handleChange }) {

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
            popover={<TextFilterPopover label={label} />}
            value={value || undefined}
        />
    );
}

function TextFilterPopover ({ label = '' }) {
    const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
    const [value, setValue] = React.useState('');
    
    // Create a debounced version of onApply that doesn't close the popover
    const debouncedApply = React.useCallback(
      debounce((newValue) => {
        // Apply the filter without closing the popover
        onApply(newValue, { keepOpen: true });
      }, 500),
      [onApply]
    );
  
    React.useEffect(() => {
      setValue(initialValue ?? '');
    }, [initialValue]);
  
    // Handle input change
    const handleInputChange = (event) => {
      const newValue = event.target.value;
      setValue(newValue);
      debouncedApply(newValue);
    };
  
    return (
      <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title={`Filter by ${label}`}>
        <FormControl>
          <OutlinedInput
            onChange={handleInputChange}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                onApply(value);
              }
            }}
            value={value}
          />
          <Typography variant="caption">*Filter is Case Insensitive</Typography>
        </FormControl>
        <Button
          onClick={() => {
            onApply(value);
          }}
          variant="contained"
        >
          Apply
        </Button>
      </FilterPopover>
    );
  }