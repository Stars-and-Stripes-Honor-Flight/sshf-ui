'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Phone, Headset, EnvelopeSimple, Clock, Users } from '@phosphor-icons/react';
import { AddressInformationCard } from '@/components/main/shared/address-information-card';
import { PairingInformationCard } from '@/components/main/shared/pairing-information-card';
import { FormSectionHeader } from '@/components/main/shared/form-section-header';

export function ContactInfoSection({ 
  control, 
  errors, 
  veteran, 
  onOpenHistory, 
  guardianPairingRef, 
  onManagePairing 
}) {
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
        emailGridProps={{ xs: 12, md: 4 }}
      />

      {/* Call Center Information Card */}
      <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
            <FormSectionHeader 
              icon={Headset} 
              title="Call Center Information" 
            />
            <Button
              startIcon={<Clock size={18} weight="bold" />}
              variant="outlined"
              size="small"
              onClick={() => onOpenHistory('Call Center', veteran?.call?.history || [])}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              History ({veteran?.call?.history?.length || 0})
            </Button>
          </Stack>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="call.assigned_to"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.call?.assigned_to)} fullWidth>
                    <InputLabel>Call Assigned To</InputLabel>
                    <OutlinedInput {...field} inputProps={{ maxLength: 30 }} />
                    {errors.call?.assigned_to ? <FormHelperText>{errors.call.assigned_to.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="call.notes"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.call?.notes)} fullWidth>
                    <InputLabel>Call Center Notes</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.call?.notes ? <FormHelperText>{errors.call.notes.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="call.mail_sent"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Veteran Mail Sent"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="call.email_sent"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Email Veteran"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
            <Grid xs={12}>
              <Controller
                control={control}
                name="emerg_contact.address.street"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.emerg_contact?.address?.street)} fullWidth>
                    <InputLabel>Street Address</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.emerg_contact?.address?.street && <FormHelperText>{errors.emerg_contact.address.street.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="emerg_contact.address.city"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.emerg_contact?.address?.city)} fullWidth>
                    <InputLabel>City</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.emerg_contact?.address?.city && <FormHelperText>{errors.emerg_contact.address.city.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="emerg_contact.address.state"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.emerg_contact?.address?.state)} fullWidth>
                    <InputLabel>State</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.emerg_contact?.address?.state && <FormHelperText>{errors.emerg_contact.address.state.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="emerg_contact.address.zip"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.emerg_contact?.address?.zip)} fullWidth>
                    <InputLabel>ZIP Code</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.emerg_contact?.address?.zip && <FormHelperText>{errors.emerg_contact.address.zip.message}</FormHelperText>}
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
                    <InputLabel>Day Phone</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.emerg_contact?.address?.phone && <FormHelperText>{errors.emerg_contact.address.phone.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="emerg_contact.address.phone_mbl"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.emerg_contact?.address?.phone_mbl)} fullWidth>
                    <InputLabel>Mobile Phone</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.emerg_contact?.address?.phone_mbl && <FormHelperText>{errors.emerg_contact.address.phone_mbl.message}</FormHelperText>}
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
                    <OutlinedInput {...field} type="email" />
                    {errors.emerg_contact?.address?.email && <FormHelperText>{errors.emerg_contact.address.email.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Alternate Contact Card */}
      <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <FormSectionHeader 
            icon={Phone} 
            title="Alternate Contact" 
          />
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.name"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.name)} fullWidth>
                    <InputLabel>Alternate Contact Name</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.name && <FormHelperText>{errors.alt_contact.name.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.relation"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.relation)} fullWidth>
                    <InputLabel>Relationship</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.relation && <FormHelperText>{errors.alt_contact.relation.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="alt_contact.address.street"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.address?.street)} fullWidth>
                    <InputLabel>Street Address</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.address?.street && <FormHelperText>{errors.alt_contact.address.street.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.address.city"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.address?.city)} fullWidth>
                    <InputLabel>City</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.address?.city && <FormHelperText>{errors.alt_contact.address.city.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.address.state"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.address?.state)} fullWidth>
                    <InputLabel>State</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.address?.state && <FormHelperText>{errors.alt_contact.address.state.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.address.zip"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.address?.zip)} fullWidth>
                    <InputLabel>ZIP Code</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.address?.zip && <FormHelperText>{errors.alt_contact.address.zip.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.address.phone"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.address?.phone)} fullWidth>
                    <InputLabel>Day Phone</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.address?.phone && <FormHelperText>{errors.alt_contact.address.phone.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.address.phone_mbl"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.address?.phone_mbl)} fullWidth>
                    <InputLabel>Mobile Phone</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.alt_contact?.address?.phone_mbl && <FormHelperText>{errors.alt_contact.address.phone_mbl.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="alt_contact.address.email"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.alt_contact?.address?.email)} fullWidth>
                    <InputLabel>Email</InputLabel>
                    <OutlinedInput {...field} type="email" />
                    {errors.alt_contact?.address?.email && <FormHelperText>{errors.alt_contact.address.email.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Guardian Information Card */}
      <PairingInformationCard
        control={control}
        errors={errors}
        cardId="guardian-pairing"
        cardRef={guardianPairingRef}
        title="Guardian Pairing Information"
        icon={Users}
        pairingType="guardian"
        preferenceNotesFieldName="guardian.pref_notes"
        preferenceNotesPlaceholder="Guardian Preference Notes"
        onManagePairing={onManagePairing}
        showHiddenFields={true}
        entity={veteran}
      />

      {/* Mail Call Information Card */}
      <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <FormSectionHeader 
            icon={EnvelopeSimple} 
            title="Mail Call Information" 
          />
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
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="mail_call.address.phone"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.mail_call?.address?.phone)} fullWidth>
                    <InputLabel>Mail Call Phone</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.mail_call?.address?.phone ? <FormHelperText>{errors.mail_call.address.phone.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="mail_call.address.email"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.mail_call?.address?.email)} fullWidth>
                    <InputLabel>Mail Call Email</InputLabel>
                    <OutlinedInput {...field} type="email" />
                    {errors.mail_call?.address?.email ? <FormHelperText>{errors.mail_call.address.email.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="mail_call.received"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Mail Call Received"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="mail_call.adopt"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Mail Call Adoption"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

