'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '@/lib/api';

function formatNamesCaption(names) {
  if (!names?.length) return '';
  return names.join(', ');
}

function getOptionLabel(option) {
  return typeof option === 'string' ? option : option.group;
}

export function FlightGroupField({ control, name = 'flight.group', error, disabled = false }) {
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const fetchGroups = React.useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const groups = await api.getWaitlistVeteranGroups();
      setOptions(Array.isArray(groups) ? groups : []);
      setLoaded(true);
    } catch {
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const handleOpen = React.useCallback(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, ref, onBlur } }) => (
        <Autocomplete
          freeSolo
          disableClearable
          forcePopupIcon={false}
          fullWidth
          disabled={disabled}
          loading={loading}
          options={options}
          inputValue={value ?? ''}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(option, val) => getOptionLabel(option) === getOptionLabel(val)}
          onOpen={handleOpen}
          onBlur={onBlur}
          sx={{
            '& .MuiOutlinedInput-root': {
              padding: '0 12px !important',
            },
            '& .MuiAutocomplete-input': {
              display: 'block !important',
              width: '100% !important',
              minWidth: 0,
              flex: '1 1 auto',
              padding: 0,
              textOverflow: 'clip',
            },
          }}
          slotProps={{
            popper: {
              placement: 'bottom-start',
              style: { width: 'auto' },
            },
            paper: {
              sx: {
                minWidth: 360,
                width: 400,
                maxWidth: 500,
              },
            },
            listbox: {
              sx: {
                '& .MuiAutocomplete-option': {
                  whiteSpace: 'normal',
                  alignItems: 'flex-start',
                },
              },
            },
          }}
          onChange={(_, newValue) => {
            if (typeof newValue === 'string') {
              onChange(newValue);
            } else if (newValue) {
              onChange(newValue.group);
            } else {
              onChange('');
            }
          }}
          onInputChange={(_, newInputValue, reason) => {
            if (reason === 'input' || reason === 'clear') {
              onChange(newInputValue);
            }
          }}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps} style={{ ...optionProps.style, whiteSpace: 'normal' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="body2" fontWeight={500}>
                    {option.group}
                  </Typography>
                  {option.names?.length > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      {formatNamesCaption(option.names)}
                    </Typography>
                  )}
                </Box>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={ref}
              label="Flight Group"
              error={Boolean(error)}
              helperText={error?.message}
              inputProps={{ ...params.inputProps, maxLength: 15 }}
            />
          )}
          noOptionsText={loaded && !loading ? 'No active groups' : 'Loading...'}
        />
      )}
    />
  );
}
