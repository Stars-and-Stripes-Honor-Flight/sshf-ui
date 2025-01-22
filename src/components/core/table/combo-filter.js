'use client';

import * as React from 'react';
import { 
    FormControl,
    Select,
    Button } from '@mui/material';
import { Option } from '@/components/core/option';
import { FilterButton, FilterPopover, useFilterContext } from '@/components/core/filter-button';

export function ComboFilterButton ({ value, label, handleChange, options = [] }) {

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
        popover={<ComboFilterPopover label={label} options={options} />}
        value={value || undefined}
      />
    );
}

function ComboFilterPopover ({options, label}) {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title={`Filter by ${label}`}>
      <FormControl>
      <Select
          onChange={(event) => {
            setValue(event.target.value);
          }}
          value={value}
        >
          <Option key="" value="">Select a {label}</Option>
          {options}
        </Select>
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