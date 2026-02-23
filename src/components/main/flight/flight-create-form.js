'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';
import { refreshFlights } from '@/lib/flights';

// Validation schema for flight creation
const flightSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Flight name is required' })
    .max(255, { message: 'Flight name must be less than 255 characters' }),
  flight_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Flight date must be in YYYY-MM-DD format' }),
  capacity: z
    .number()
    .int({ message: 'Capacity must be a whole number' })
    .min(1, { message: 'Capacity must be at least 1' })
    .max(1000, { message: 'Capacity cannot exceed 1000' }),
});

const defaultValues = {
  name: '',
  flight_date: new Date().toISOString().split('T')[0],
  capacity: '',
};

export function FlightCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ 
    defaultValues, 
    resolver: zodResolver(flightSchema),
    mode: 'onChange'
  });

  const onSubmit = React.useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        // Prepend SSHF- if not already present
        const flightName = data.name.startsWith('SSHF-') ? data.name : `SSHF-${data.name}`;

        // Create the flight via API
        await api.createFlight({
          type: 'Flight',
          name: flightName,
          flight_date: data.flight_date,
          capacity: parseInt(data.capacity, 10),
          completed: false,
        });

        toast.success('Flight created successfully');
        
        // Refresh the flights cache in local storage
        await refreshFlights();
        
        router.push(paths.main.search.flights);
      } catch (err) {
        logger.error(err);
        toast.error(err?.message || 'Failed to create flight');
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <Stack divider={<Divider />} spacing={4}>
            <Stack spacing={3}>
              <Typography variant="h6">Flight Information</Typography>
              <Grid container spacing={3}>
                <Grid xs={12}>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.name)} fullWidth>
                        <InputLabel required>Flight Name</InputLabel>
                        <OutlinedInput 
                          {...field} 
                          placeholder="e.g., SSHF-Nov2024"
                        />
                        {errors.name ? (
                          <FormHelperText>{errors.name.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Controller
                    control={control}
                    name="flight_date"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.flight_date)} fullWidth>
                        <InputLabel required>Flight Date</InputLabel>
                        <OutlinedInput 
                          {...field}
                          type="date"
                          inputProps={{
                            min: new Date().toISOString().split('T')[0],
                          }}
                        />
                        {errors.flight_date ? (
                          <FormHelperText>{errors.flight_date.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Controller
                    control={control}
                    name="capacity"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.capacity)} fullWidth>
                        <InputLabel required>Capacity</InputLabel>
                        <OutlinedInput 
                          {...field}
                          type="number"
                          inputProps={{
                            min: 1,
                            max: 1000,
                            step: 1,
                          }}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                            field.onChange(value);
                          }}
                        />
                        {errors.capacity ? (
                          <FormHelperText>{errors.capacity.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            color="secondary"
            component={RouterLink}
            href={paths.main.search.flights}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Flight'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
