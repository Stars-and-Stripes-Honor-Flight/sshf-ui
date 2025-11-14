'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
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
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';
import { guardianSchema } from '@/schemas/guardian';

const defaultValues = {
  name: {
    first: '',
    middle: '',
    last: '',
    nickname: ''
  },
  address: {
    street: '',
    city: '',
    county: '',
    state: '',
    zip: '',
    phone_day: '',
    phone_eve: '',
    phone_mbl: '',
    email: ''
  },
  birth_date: '',
  gender: 'M',
  weight: 0,
  occupation: '',
  app_date: new Date().toISOString().split('T')[0],
  notes: {
    service: 'N',
    other: ''
  },
  medical: {
    level: '',
    food_restriction: 'None',
    can_push: false,
    can_lift: false,
    limitations: '',
    experience: '',
    release: false,
    form: false
  },
  flight: {
    status: 'Active',
    id: '',
    group: '',
    bus: '',
    seat: '',
    waiver: false,
    vaccinated: false,
    training: 'None',
    training_complete: false,
    training_see_doc: false,
    training_notes: '',
    status_note: '',
    mediaWaiver: false,
    infection_test: false,
    nofly: false,
    booksOrdered: 0,
    confirmed_date: '',
    confirmed_by: '',
    paid: false,
    exempt: false
  }
};

export function GuardianCreateForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues, resolver: zodResolver(guardianSchema) });

  const onSubmit = React.useCallback(
    async (data) => {
      try {
        // Make API request
        toast.success('Guardian created');
        router.push(paths.main.guardians.list);
      } catch (err) {
        logger.error(err);
        toast.error('Something went wrong!');
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
              <Typography variant="h6">Basic Information</Typography>
              <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="name.first"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.name?.first)} fullWidth>
                        <InputLabel required>First Name</InputLabel>
                        <OutlinedInput {...field} />
                        {errors.name?.first ? <FormHelperText>{errors.name.first.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="name.middle"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.name?.middle)} fullWidth>
                        <InputLabel>Middle Name</InputLabel>
                        <OutlinedInput {...field} />
                        {errors.name?.middle ? <FormHelperText>{errors.name.middle.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="name.last"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.name?.last)} fullWidth>
                        <InputLabel required>Last Name</InputLabel>
                        <OutlinedInput {...field} />
                        {errors.name?.last ? <FormHelperText>{errors.name.last.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Controller
                    control={control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.birth_date)} fullWidth>
                        <InputLabel required>Birth Date</InputLabel>
                        <OutlinedInput {...field} type="date" />
                        {errors.birth_date ? <FormHelperText>{errors.birth_date.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.gender)} fullWidth>
                        <InputLabel required>Gender</InputLabel>
                        <Select {...field}>
                          <Option value="M">Male</Option>
                          <Option value="F">Female</Option>
                        </Select>
                        {errors.gender ? <FormHelperText>{errors.gender.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>

            {/* Add more sections for:
                - Contact Information
                - Medical Information
                - Flight Details
                Based on the schema */}

          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button color="secondary" component={RouterLink} href={paths.main.guardians.list}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create Guardian
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}

