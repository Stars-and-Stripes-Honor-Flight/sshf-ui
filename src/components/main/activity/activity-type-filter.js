import * as React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const ACTIVITY_TYPES = [
  { label: 'Modified', value: 'modified' },
  { label: 'Added', value: 'added' },
  { label: 'Call', value: 'call' },
  { label: 'Flight', value: 'flight' },
  { label: 'Pairing', value: 'pairing' },
];

export function ActivityTypeFilter({ value, onChange }) {
  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel>Activity Type</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Activity Type"
      >
        {ACTIVITY_TYPES.map((type) => (
          <MenuItem key={type.value} value={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
