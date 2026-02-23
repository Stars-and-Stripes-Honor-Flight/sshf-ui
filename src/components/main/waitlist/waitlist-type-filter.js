import * as React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const WAITLIST_TYPES = [
  { label: 'Veterans', value: 'veterans' },
  { label: 'Guardians', value: 'guardians' },
];

export function WaitlistTypeFilter({ value, onChange }) {
  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel>Waitlist Type</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Waitlist Type"
      >
        {WAITLIST_TYPES.map((type) => (
          <MenuItem key={type.value} value={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
