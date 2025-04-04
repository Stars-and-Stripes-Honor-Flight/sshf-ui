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
import { veteranSchema } from '@/schemas/veteran';

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
  service: {
    branch: '',
    rank: '',
    dates: '',
    activity: ''
  },
  vet_type: '',
  birth_date: '',
  gender: 'M',
  weight: 0,
  app_date: new Date().toISOString().split('T')[0],
  medical: {
    level: '3',
    alt_level: '3',
    food_restriction: 'None',
    usesCane: false,
    usesWalker: false,
    usesWheelchair: false,
    isWheelchairBound: false,
    usesScooter: false,
    requiresOxygen: false,
    examRequired: false,
    form: false,
    release: false,
    limitations: '',
    review: ''
  },
  flight: {
    status: 'Active',
    group: '',
    waiver: false,
    vaccinated: false
  }
};

export function VeteranCreateForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues, resolver: zodResolver(veteranSchema) });

  const onSubmit = React.useCallback(
    async (data) => {
      try {
        // Make API request
        toast.success('Veteran created');
        router.push(paths.main.veterans.list);
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
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="service.branch"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.service?.branch)} fullWidth>
                        <InputLabel required>Branch</InputLabel>
                        <Select {...field}>
                          <Option value="">Select a branch</Option>
                          <Option value="Army">Army</Option>
                          <Option value="Air Force">Air Force</Option>
                          <Option value="Navy">Navy</Option>
                          <Option value="Marines">Marines</Option>
                          <Option value="Coast Guard">Coast Guard</Option>
                        </Select>
                        {errors.service?.branch ? <FormHelperText>{errors.service.branch.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="vet_type"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.vet_type)} fullWidth>
                        <InputLabel required>War Era</InputLabel>
                        <Select {...field}>
                          <Option value="">Select war era</Option>
                          <Option value="WWII">WWII</Option>
                          <Option value="Korea">Korea</Option>
                          <Option value="Vietnam">Vietnam</Option>
                          <Option value="Afghanistan">Afghanistan</Option>
                          <Option value="Iraq">Iraq</Option>
                          <Option value="Other">Other</Option>
                        </Select>
                        {errors.vet_type ? <FormHelperText>{errors.vet_type.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>

            {/* Add more sections for:
                - Contact Information
                - Service Details
                - Medical Information
                - Flight Details
                Based on the schema */}

          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button color="secondary" component={RouterLink} href={paths.main.veterans.list}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create Veteran
          </Button>
        </CardActions>
      </Card>
    </form>
  );
} 