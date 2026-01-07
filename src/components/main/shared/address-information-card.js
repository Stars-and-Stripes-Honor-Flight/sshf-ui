'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { FormSectionHeader } from './form-section-header';

export function AddressInformationCard({ 
  control, 
  errors, 
  emailGridProps = { xs: 12, md: 4 } // Default to veteran style, can override for guardian
}) {
  return (
    <Card id="address-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        <FormSectionHeader 
          icon={EnvelopeSimple} 
          title="Address Information" 
        />
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Controller
              control={control}
              name="address.street"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.street)} fullWidth>
                  <InputLabel required>Street Address</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.street && <FormHelperText>{errors.address.street.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Controller
              control={control}
              name="address.city"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.city)} fullWidth>
                  <InputLabel required>City</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.city && <FormHelperText>{errors.address.city.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Controller
              control={control}
              name="address.county"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.county)} fullWidth>
                  <InputLabel required>County</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.county && <FormHelperText>{errors.address.county.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Controller
              control={control}
              name="address.state"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.state)} fullWidth>
                  <InputLabel required>State</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.state && <FormHelperText>{errors.address.state.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Controller
              control={control}
              name="address.zip"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.zip)} fullWidth>
                  <InputLabel required>ZIP Code</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.zip && <FormHelperText>{errors.address.zip.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <Controller
              control={control}
              name="address.phone_day"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.phone_day)} fullWidth>
                  <InputLabel required>Day Phone</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.phone_day && <FormHelperText>{errors.address.phone_day.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <Controller
              control={control}
              name="address.phone_mbl"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.phone_mbl)} fullWidth>
                  <InputLabel>Mobile Phone</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.phone_mbl && <FormHelperText>{errors.address.phone_mbl.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid {...emailGridProps}>
            <Controller
              control={control}
              name="address.email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.email)} fullWidth>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.address?.email && <FormHelperText>{errors.address.email.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

