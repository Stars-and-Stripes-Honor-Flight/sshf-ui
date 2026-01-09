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
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Phone, Users } from '@phosphor-icons/react';
import { AddressInformationCard } from '@/components/main/shared/address-information-card';
import { PairingInformationCard } from '@/components/main/shared/pairing-information-card';
import { FormSectionHeader } from '@/components/main/shared/form-section-header';

export function ContactInfoSection({ 
  control, 
  errors, 
  guardian, 
  veteranPairingsRef, 
  onManagePairing,
  watch
}) {
  // Create entity object with form state for pairings
  const entityWithFormState = React.useMemo(() => {
    const formPairings = watch ? watch('veteran.pairings') : null;
    return {
      ...guardian,
      veteran: {
        ...guardian.veteran,
        pairings: formPairings || guardian.veteran?.pairings || []
      }
    };
  }, [guardian, watch]);

  return (
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
      <AddressInformationCard 
        control={control} 
        errors={errors}
        emailGridProps={{ xs: 12 }}
      />

      {/* Emergency Contact Card */}
      <Card id="emergency-contact-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <FormSectionHeader 
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
      <PairingInformationCard
        control={control}
        errors={errors}
        cardId="veteran-pairings"
        cardRef={veteranPairingsRef}
        title="Veteran Pairing Information"
        icon={Users}
        pairingType="veteran"
        preferenceNotesFieldName="veteran.pref_notes"
        preferenceNotesPlaceholder="Veteran Preference Notes"
        onManagePairing={onManagePairing}
        showHiddenFields={false}
        entity={entityWithFormState}
      />
    </Stack>
  );
}

