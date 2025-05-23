'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
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
import Chip from '@mui/material/Chip';
import { 
  User, 
  Person,
  Airplane,
  Phone,
  UsersFour,
  EnvelopeSimple,
  TShirt,
  FirstAid,
  Bed
} from '@phosphor-icons/react';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';
import { guardianSchema } from '@/schemas/guardian';

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

// Component for section headers
const SectionHeader = ({ icon: Icon, title }) => (
  <Stack 
    direction="row" 
    alignItems="center" 
    spacing={2}
    sx={{ mb: 3 }}
  >
    <Box
      sx={{
        backgroundColor: 'primary.main',
        width: 4,
        height: 24,
        borderRadius: 1
      }}
    />
    <Stack direction="row" spacing={1} alignItems="center">
      {Icon && (
        <Icon 
          size={24}
          weight="bold" 
          color="var(--mui-palette-primary-main)"
        />
      )}
      <Typography 
        variant="h6"
        sx={{ fontWeight: 'bold' }}
      >
        {title}
      </Typography>
    </Stack>
  </Stack>
);

export function GuardianEditForm({ guardian }) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  // Default values based on API structure
  const defaultValues = React.useMemo(() => ({
    _id: guardian._id || '',
    name: guardian.name || { first: '', middle: '', last: '', nickname: '' },
    address: guardian.address || { 
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
    birth_date: guardian.birth_date || '',
    gender: guardian.gender || '',
    weight: guardian.weight || '',
    occupation: guardian.occupation || '',
    app_date: guardian.app_date || '',
    notes: guardian.notes || { service: 'N', other: '' },
    medical: guardian.medical || { 
      level: '', 
      food_restriction: 'None', 
      can_push: false, 
      can_lift: false,
      limitations: '',
      experience: ''
    },
    flight: guardian.flight || { 
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
      paid: false,
      exempt: false
    },
    emerg_contact: guardian.emerg_contact || { 
      name: '', 
      relation: '', 
      address: { 
        phone: '', 
        email: '' 
      } 
    },
    veteran: guardian.veteran || { 
      pref_notes: '',
      pairings: []
    },
    shirt: guardian.shirt || { size: 'None' },
    apparel: guardian.apparel || { 
      item: 'None',
      jacket_size: 'None', 
      shirt_size: 'None',
      delivery: 'None' 
    },
    accommodations: guardian.accommodations || { 
      hotel_name: '', 
      room_type: 'None', 
      arrival_date: '', 
      departure_date: '', 
      notes: '' 
    }
  }), [guardian]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues,
    resolver: zodResolver(guardianSchema)
  });

  const onSubmit = React.useCallback(
    async (data) => {
      try {
        setSaving(true);
        // TODO: Update this to use the guardian API endpoint when available
        await api.updateVeteran(data._id, data);
        toast.success('Guardian updated successfully');
        router.push(paths.main.search.list);
      } catch (err) {
        logger.error(err);
        toast.error('Failed to update guardian: ' + (err.message || 'Unknown error'));
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  const watchStatus = watch('flight.status');
  const watchTraining = watch('flight.training');

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      style={{ paddingBottom: '80px' }}
    >
      <Grid container spacing={4}>
        <Grid xs={12} md={4}>
          <Card 
            id="guardian-info"
            sx={{
              position: 'sticky',
              top: 24,
              backgroundColor: 'background.neutral',
              boxShadow: (theme) => theme.shadows[8]
            }}
          >
            <CardContent>
              <Stack spacing={3}>
                <Box
                  sx={{
                    height: '200px',
                    width: '100%',
                    backgroundColor: 'primary.lighter',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: (theme) => theme.shadows[4]
                  }}
                >
                  <Person 
                    size={120}
                    weight="duotone"
                    color="var(--mui-palette-primary-main)"
                  />
                </Box>
                <Stack spacing={2}>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    justifyContent="space-between"
                  >
                    <Typography 
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      {guardian.name?.first} {guardian.name?.last}
                    </Typography>
                    <Chip
                      label={watchStatus || 'No Status'}
                      color={getStatusColor(watchStatus)}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        fontWeight: 'medium'
                      }}
                    />
                  </Stack>
                  <Divider />
                  <Stack spacing={2}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 'medium'
                      }}
                    >
                      Guardian
                    </Typography>
                    <Typography variant="body2">
                      {watchTraining ? `Training: ${watchTraining}` : 'No Training Completed'}
                    </Typography>
                    {guardian.veteran?.pairings?.length > 0 ? (
                      <Typography variant="body2">
                        Paired with: {guardian.veteran.pairings.map(p => p.name).join(', ')}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Not paired with any veterans
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={8}>
          <Stack spacing={4}>
            {/* Essential Information Group */}
            <Stack spacing={3}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  px: 2 
                }}
              >
                Essential Information
              </Typography>
              
              {/* Personal Information Card */}
              <Card
                elevation={2}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent>
                  <SectionHeader 
                    icon={User} 
                    title="Personal Information" 
                  />
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
                </CardContent>
              </Card>

              {/* Flight Status Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={Airplane} 
                    title="Flight Status" 
                  />
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
                              <Option value="Copied">Copied</Option>
                            </Select>
                            {errors.flight?.status ? <FormHelperText>{errors.flight.status.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.id"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.id)} fullWidth>
                            <InputLabel>Flight ID</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.flight?.id ? <FormHelperText>{errors.flight.id.message}</FormHelperText> : null}
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
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Alpha1">Alpha1</Option>
                              <Option value="Alpha2">Alpha2</Option>
                              <Option value="Alpha3">Alpha3</Option>
                              <Option value="Alpha4">Alpha4</Option>
                              <Option value="Alpha5">Alpha5</Option>
                              <Option value="Bravo1">Bravo1</Option>
                              <Option value="Bravo2">Bravo2</Option>
                              <Option value="Bravo3">Bravo3</Option>
                              <Option value="Bravo4">Bravo4</Option>
                              <Option value="Bravo5">Bravo5</Option>
                            </Select>
                            {errors.flight?.bus ? <FormHelperText>{errors.flight.bus.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.seat"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.seat)} fullWidth>
                            <InputLabel>Seat Assignment</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.flight?.seat ? <FormHelperText>{errors.flight.seat.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
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
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="flight.vaccinated"
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Vaccinated"
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="flight.paid"
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Paid"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>

            {/* Contact Information Group */}
            <Stack spacing={3}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  px: 2,
                  pt: 2 
                }}
              >
                Contact Information
              </Typography>

              {/* Address Information Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
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
                        name="address.phone_eve"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.phone_eve)} fullWidth>
                            <InputLabel>Evening Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.phone_eve && <FormHelperText>{errors.address.phone_eve.message}</FormHelperText>}
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
                    <Grid xs={12}>
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

              {/* Emergency Contact Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={Phone} 
                    title="Emergency Contact" 
                  />
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
                </CardContent>
              </Card>

              {/* Veteran Pairing Information Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={UsersFour} 
                    title="Veteran Pairing Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="veteran.pref_notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.veteran?.pref_notes)} fullWidth>
                            <InputLabel>Veteran Preference Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={2} />
                            {errors.veteran?.pref_notes && <FormHelperText>{errors.veteran.pref_notes.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    {guardian.veteran?.pairings?.length > 0 && (
                      <Grid xs={12}>
                        <Typography variant="subtitle1">Currently Paired Veterans:</Typography>
                        <Box sx={{ mt: 1 }}>
                          {guardian.veteran.pairings.map((pairing, index) => (
                            <Chip
                              key={pairing.id || index}
                              label={pairing.name}
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Stack>

            {/* Additional Details Group */}
            <Stack spacing={3}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  px: 2,
                  pt: 2 
                }}
              >
                Additional Details
              </Typography>

              {/* Apparel Information Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={TShirt} 
                    title="Apparel Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="shirt.size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.shirt?.size)} fullWidth>
                            <InputLabel>Shirt Size</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                              <Option value="4XL">4X-Large</Option>
                              <Option value="5XL">5X-Large</Option>
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
                              <Option value="XS">X-Small</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                              <Option value="4XL">4X-Large</Option>
                              <Option value="5XL">5X-Large</Option>
                            </Select>
                            {errors.apparel?.jacket_size && <FormHelperText>{errors.apparel.jacket_size.message}</FormHelperText>}
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
                            <InputLabel>Delivery Method</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Mailed">Mailed</Option>
                              <Option value="Training">Training</Option>
                              <Option value="Home">Home</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.item"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Apparel Items</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Jacket">Jacket</Option>
                              <Option value="Polo">Polo</Option>
                              <Option value="Both">Both</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 2,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1200,
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}
      >
        <Button 
          color="inherit" 
          component={RouterLink} 
          href={paths.main.search.list}
          sx={{
            borderRadius: 2,
            fontWeight: 'medium'
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          disabled={saving}
          sx={{
            borderRadius: 2,
            fontWeight: 'medium',
            boxShadow: (theme) => theme.shadows[4]
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </form>
  );
} 