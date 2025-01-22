'use client';

import * as React from 'react';
import { 
    FormControl,
    OutlinedInput,
    Button,
    Typography } from '@mui/material';
import { FilterButton, FilterPopover, useFilterContext } from '@/components/core/filter-button';

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
  
    React.useEffect(() => {
      setValue(initialValue ?? '');
    }, [initialValue]);
  
    return (
      <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title={`Filter by ${label}`}>
        <FormControl>
          <OutlinedInput
            onChange={(event) => {
              setValue(event.target.value);
            }}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                onApply(value);
              }
            }}
            value={value}
          />
          <Typography variant="caption">*Filter is Case Sensitive</Typography>
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