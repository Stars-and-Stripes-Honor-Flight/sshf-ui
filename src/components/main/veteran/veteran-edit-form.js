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
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
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

function getDefaultValues(veteran) {
  return {
    _id: veteran._id ?? '',
    _rev: veteran._rev ?? '',
    type: 'Veteran',
    name: {
      first: veteran.name?.first ?? '',
      middle: veteran.name?.middle ?? '',
      last: veteran.name?.last ?? '',
      nickname: veteran.name?.nickname ?? ''
    },
    address: {
      street: veteran.address?.street ?? '',
      city: veteran.address?.city ?? '',
      county: veteran.address?.county ?? '',
      state: veteran.address?.state ?? '',
      zip: veteran.address?.zip ?? '',
      phone_day: veteran.address?.phone_day ?? '',
      phone_eve: veteran.address?.phone_eve ?? '',
      phone_mbl: veteran.address?.phone_mbl ?? '',
      email: veteran.address?.email ?? ''
    },
    service: {
      branch: veteran.service?.branch ?? '',
      rank: veteran.service?.rank ?? '',
      dates: veteran.service?.dates ?? '',
      activity: veteran.service?.activity ?? ''
    },
    vet_type: veteran.vet_type ?? '',
    birth_date: veteran.birth_date ?? '',
    gender: veteran.gender ?? 'M',
    weight: veteran.weight ?? 0,
    app_date: veteran.app_date ?? new Date().toISOString().split('T')[0],
    medical: {
      level: veteran.medical?.level ?? '3',
      alt_level: veteran.medical?.alt_level ?? '3',
      food_restriction: veteran.medical?.food_restriction ?? 'None',
      usesCane: veteran.medical?.usesCane ?? false,
      usesWalker: veteran.medical?.usesWalker ?? false,
      usesWheelchair: veteran.medical?.usesWheelchair ?? false,
      isWheelchairBound: veteran.medical?.isWheelchairBound ?? false,
      usesScooter: veteran.medical?.usesScooter ?? false,
      requiresOxygen: veteran.medical?.requiresOxygen ?? false,
      examRequired: veteran.medical?.examRequired ?? false,
      form: veteran.medical?.form ?? false,
      release: veteran.medical?.release ?? false,
      limitations: veteran.medical?.limitations ?? '',
      review: veteran.medical?.review ?? ''
    },
    flight: {
      status: veteran.flight?.status ?? 'Active',
      id: veteran.flight?.id ?? '',
      group: veteran.flight?.group ?? '',
      bus: veteran.flight?.bus ?? 'None',
      seat: veteran.flight?.seat ?? '',
      confirmed_date: veteran.flight?.confirmed_date ?? '',
      confirmed_by: veteran.flight?.confirmed_by ?? '',
      waiver: veteran.flight?.waiver ?? false,
      vaccinated: veteran.flight?.vaccinated ?? false,
      status_note: veteran.flight?.status_note ?? ''
    }
  };
}

export function VeteranEditForm({ veteran }) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: getDefaultValues(veteran),
    resolver: zodResolver(veteranSchema)
  });

  const onSubmit = React.useCallback(
    async (data) => {
      try {
        // Make API request
        toast.success('Veteran updated');
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
      <Stack spacing={4}>
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
                </Grid>
              </Stack>

              <Stack spacing={3}>
                <Typography variant="h6">Flight Status</Typography>
                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <Controller
                      control={control}
                      name="flight.status"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.flight?.status)} fullWidth>
                          <InputLabel required>Status</InputLabel>
                          <Select {...field}>
                            <Option value="Active">Active</Option>
                            <Option value="Flown">Flown</Option>
                            <Option value="Deceased">Deceased</Option>
                            <Option value="Removed">Removed</Option>
                            <Option value="Future-Spring">Future-Spring</Option>
                            <Option value="Future-Fall">Future-Fall</Option>
                            <Option value="Future-PostRestriction">Future-PostRestriction</Option>
                          </Select>
                          {errors.flight?.status ? <FormHelperText>{errors.flight.status.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Controller
                      control={control}
                      name="flight.group"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.flight?.group)} fullWidth>
                          <InputLabel>Flight Group</InputLabel>
                          <OutlinedInput {...field} />
                          {errors.flight?.group ? <FormHelperText>{errors.flight.group.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Controller
                      control={control}
                      name="flight.waiver"
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="Waiver Received"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Stack>

              {/* Add more sections for:
                  - Contact Information
                  - Service Details
                  - Medical Information
                  Based on the schema */}

            </Stack>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button color="secondary" component={RouterLink} href={paths.main.veterans.list}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </CardActions>
        </Card>
      </Stack>
    </form>
  );
} 