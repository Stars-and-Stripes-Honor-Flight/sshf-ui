'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All applications' },
  { value: 'VeteranApp', label: 'Veteran applications' },
  { value: 'GuardianApp', label: 'Guardian applications' },
];

export function ReviewTypeFilter({ value, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 220 }}>
      <InputLabel id="review-type-filter-label">Type</InputLabel>
      <Select
        labelId="review-type-filter-label"
        label="Type"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
