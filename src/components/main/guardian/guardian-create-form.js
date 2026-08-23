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
import { api } from '@/lib/api';
import { guardianCreateSchema } from '@/schemas/guardian';
import { AddressInformationCard } from '@/components/main/shared/address-information-card';

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
  gender: 'M'
};

export function GuardianCreateForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues, resolver: zodResolver(guardianCreateSchema) });

  const onSubmit = React.useCallback(
    async (data) => {
      try {
        const created = await api.createGuardian({ ...data, type: 'Guardian' });
        toast.success('Guardian created');
        router.push(created?._id ? paths.main.guardians.details(created._id) : paths.main.guardians.list);
      } catch (err) {
        logger.error(err);
        toast.error('Failed to create guardian: ' + (err.message || 'Unknown error'));
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

            <Stack spacing={3}>
              <Typography variant="h6">Contact Information</Typography>
              <AddressInformationCard control={control} errors={errors} emailGridProps={{ xs: 12 }} />
            </Stack>

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

