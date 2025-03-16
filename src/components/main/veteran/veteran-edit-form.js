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
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import Chip from '@mui/material/Chip';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';
import { veteranSchema } from '@/schemas/veteran';

const getBranchImage = (branch) => {
  const images = {
    'Air Force': '/assets/AirForce.png',
    'Army': '/assets/Army.png',
    'Coast Guard': '/assets/CoastGuard.png',
    'Marines': '/assets/Marines.png',
    'Navy': '/assets/Navy.png'
  };
  return images[branch] || '';
};

const getStatusColor = (status) => {
  const colors = {
    'Active': 'success',
    'Flown': 'info',
    'Deceased': 'error',
    'Removed': 'error',
    'Future-Spring': 'warning',
    'Future-Fall': 'warning'
  };
  return colors[status] || 'default';
};

export function VeteranEditForm({ veteran }) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: veteran,
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

  const watchBranch = watch('service.branch');
  const watchRank = watch('service.rank');
  const watchDates = watch('service.dates');
  const watchVetType = watch('vet_type');
  const watchStatus = watch('flight.status');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {watchBranch ? (
                  <Box
                    sx={{
                      position: 'relative',
                      height: '200px',
                      width: '100%',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Image
                      src={getBranchImage(watchBranch)}
                      alt={watchBranch}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: '200px',
                      width: '100%',
                      backgroundColor: 'var(--mui-palette-background-level2)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography color="text.secondary">
                      Select a branch of service
                    </Typography>
                  </Box>
                )}
                <Stack spacing={2}>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    justifyContent="space-between"
                  >
                    <Typography variant="h4">
                      {veteran.name.first} {veteran.name.last}
                    </Typography>
                    <Chip
                      label={watchStatus || 'No Status'}
                      color={getStatusColor(watchStatus)}
                      size="small"
                    />
                  </Stack>
                  <Stack spacing={1}>
                    <Stack spacing={1}>
                      <Typography variant="h6">
                        {watchBranch || 'Branch Not Specified'}
                      </Typography>
                      <Typography variant="h6">
                        {watchRank || 'Rank Not Specified'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {watchDates || 'Service Dates Not Specified'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {watchVetType} Era
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={8}>
          <Stack divider={<Divider />} spacing={4}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Personal Information</Typography>
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
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Service Information</Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
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
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="service.rank"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.service?.rank)} fullWidth>
                            <InputLabel required>Rank</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.service?.rank ? <FormHelperText>{errors.service.rank.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="service.dates"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.service?.dates)} fullWidth>
                            <InputLabel required>Service Dates</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.service?.dates ? <FormHelperText>{errors.service.dates.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
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
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Flight Information</Typography>
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
                        name="flight.bus"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.bus)} fullWidth>
                            <InputLabel>Bus Assignment</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.flight?.bus ? <FormHelperText>{errors.flight.bus.message}</FormHelperText> : null}
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
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Emergency Contact Information</Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.name"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.name)} fullWidth>
                            <InputLabel>Emergency Contact Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.name && <FormHelperText>{errors.emerg_contact.name.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.relation"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.relation)} fullWidth>
                            <InputLabel>Relationship</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.relation && <FormHelperText>{errors.emerg_contact.relation.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.phone"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.phone)} fullWidth>
                            <InputLabel>Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.phone && <FormHelperText>{errors.emerg_contact.address.phone.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.email"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.email)} fullWidth>
                            <InputLabel>Email</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.email && <FormHelperText>{errors.emerg_contact.address.email.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Guardian Information</Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="guardian.name"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.guardian?.name)} fullWidth>
                            <InputLabel>Guardian Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.guardian?.name && <FormHelperText>{errors.guardian.name.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="guardian.pref_phone"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.guardian?.pref_phone)} fullWidth>
                            <InputLabel>Guardian Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.guardian?.pref_phone && <FormHelperText>{errors.guardian.pref_phone.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="guardian.pref_email"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.guardian?.pref_email)} fullWidth>
                            <InputLabel>Guardian Email</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.guardian?.pref_email && <FormHelperText>{errors.guardian.pref_email.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="guardian.pref_notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.guardian?.pref_notes)} fullWidth>
                            <InputLabel>Guardian Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={2} />
                            {errors.guardian?.pref_notes && <FormHelperText>{errors.guardian.pref_notes.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Mail Call Information</Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="mail_call.name"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.name)} fullWidth>
                            <InputLabel>Contact Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.mail_call?.name && <FormHelperText>{errors.mail_call.name.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="mail_call.relation"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.relation)} fullWidth>
                            <InputLabel>Relationship</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.mail_call?.relation && <FormHelperText>{errors.mail_call.relation.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="mail_call.notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.notes)} fullWidth>
                            <InputLabel>Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={2} />
                            {errors.mail_call?.notes && <FormHelperText>{errors.mail_call.notes.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Apparel Information</Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="shirt.size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.shirt?.size)} fullWidth>
                            <InputLabel>Shirt Size</InputLabel>
                            <Select {...field}>
                              <Option value="">Select size</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                            </Select>
                            {errors.shirt?.size && <FormHelperText>{errors.shirt.size.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.jacket_size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.jacket_size)} fullWidth>
                            <InputLabel>Jacket Size</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.delivery"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Delivery Status</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Delivered">Delivered</Option>
                              <Option value="Pending">Pending</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Media Permissions</Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="media_newspaper_ok"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Newspaper Permission</InputLabel>
                            <Select {...field}>
                              <Option value="Unknown">Unknown</Option>
                              <Option value="Yes">Yes</Option>
                              <Option value="No">No</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="media_interview_ok"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Interview Permission</InputLabel>
                            <Select {...field}>
                              <Option value="Unknown">Unknown</Option>
                              <Option value="Yes">Yes</Option>
                              <Option value="No">No</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Accommodations</Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="accommodations.hotel_name"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Hotel Name</InputLabel>
                            <OutlinedInput {...field} />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="accommodations.room_type"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Room Type</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Single">Single</Option>
                              <Option value="Double">Double</Option>
                              <Option value="Suite">Suite</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="accommodations.arrival_date"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Arrival Date</InputLabel>
                            <OutlinedInput {...field} type="date" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="accommodations.departure_date"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Departure Date</InputLabel>
                            <OutlinedInput {...field} type="date" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="accommodations.notes"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Accommodation Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={2} />
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button color="secondary" component={RouterLink} href={paths.main.veterans.list}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </CardActions>
        </Grid>
      </Grid>
    </form>
  );
}