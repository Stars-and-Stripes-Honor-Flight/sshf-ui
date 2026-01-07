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
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FirstAid, Airplane, Headset, Clock } from '@phosphor-icons/react';
import { Option } from '@/components/core/option';
import { FormSectionHeader } from '@/components/main/shared/form-section-header';
import { PersonalInformationCard } from '@/components/main/shared/personal-information-card';

export function EssentialInfoSection({ control, errors, guardian, onOpenHistory }) {
  return (
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
      <PersonalInformationCard 
        control={control} 
        errors={errors}
        nicknameGridProps={{ xs: 12, md: 6 }}
      />

      {/* Medical Information Card */}
      <Card id="medical-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <FormSectionHeader 
            icon={FirstAid} 
            title="Medical Information" 
          />
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="occupation"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.occupation)} fullWidth>
                    <InputLabel>Occupation</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.occupation ? <FormHelperText>{errors.occupation.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="notes.service"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.notes?.service)} fullWidth>
                    <InputLabel>Are you a veteran?</InputLabel>
                    <Select {...field}>
                      <Option value="N">No</Option>
                      <Option value="Y">Yes</Option>
                    </Select>
                    {errors.notes?.service ? <FormHelperText>{errors.notes.service.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="medical.level"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.level)} fullWidth>
                    <InputLabel>Medical Level</InputLabel>
                    <Select {...field}>
                      <Option value="">None</Option>
                      <Option value="A">A</Option>
                      <Option value="B">B</Option>
                      <Option value="C">C</Option>
                      <Option value="D">D</Option>
                    </Select>
                    {errors.medical?.level ? <FormHelperText>{errors.medical.level.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="medical.food_restriction"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.food_restriction)} fullWidth>
                    <InputLabel>Food Restrictions</InputLabel>
                    <Select {...field}>
                      <Option value="None">None</Option>
                      <Option value="Vegetarian">Vegetarian</Option>
                      <Option value="Vegan">Vegan</Option>
                      <Option value="Gluten Free">Gluten Free</Option>
                      <Option value="Diabetic">Diabetic</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                    {errors.medical?.food_restriction ? <FormHelperText>{errors.medical.food_restriction.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="notes.other"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.notes?.other)} fullWidth>
                    <InputLabel>Service Details</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.notes?.other ? <FormHelperText>{errors.notes.other.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                Physical Capabilities
              </Typography>
              <Stack direction="row" spacing={2}>
                <Controller
                  control={control}
                  name="medical.can_push"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Can Push Wheelchair"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="medical.can_lift"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Can Lift"
                    />
                  )}
                />
              </Stack>
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="medical.limitations"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.limitations)} fullWidth>
                    <InputLabel>Medical Limitations</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.medical?.limitations ? <FormHelperText>{errors.medical.limitations.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="medical.experience"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.experience)} fullWidth>
                    <InputLabel>Medical Experience</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.medical?.experience ? <FormHelperText>{errors.medical.experience.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                Medical Forms
              </Typography>
              <Stack direction="row" spacing={2}>
                <Controller
                  control={control}
                  name="medical.release"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Medical Release Signed"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="medical.form"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Medical Form Completed"
                    />
                  )}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
              onClick={() => onOpenHistory('Call Center', guardian?.call?.history || [])}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              History ({guardian?.call?.history?.length || 0})
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
                    <OutlinedInput {...field} />
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
                    <InputLabel>Call Notes</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.call?.notes ? <FormHelperText>{errors.call.notes.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="flight.confirmed_date"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.flight?.confirmed_date)} fullWidth>
                    <InputLabel>Confirmed Date</InputLabel>
                    <OutlinedInput {...field} type="date" />
                    {errors.flight?.confirmed_date ? <FormHelperText>{errors.flight.confirmed_date.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="flight.confirmed_by"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.flight?.confirmed_by)} fullWidth>
                    <InputLabel>Confirmed By</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.flight?.confirmed_by ? <FormHelperText>{errors.flight.confirmed_by.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="call.email_sent"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Email Sent"
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Flight Status Card */}
      <Card id="flight-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
            <FormSectionHeader 
              icon={Airplane} 
              title="Flight Status" 
            />
            <Button
              startIcon={<Clock size={18} weight="bold" />}
              variant="outlined"
              size="small"
              onClick={() => onOpenHistory('Flight Status', guardian?.flight?.history || [])}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              History ({guardian?.flight?.history?.length || 0})
            </Button>
          </Stack>
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
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="flight.training"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.flight?.training)} fullWidth>
                    <InputLabel>Training</InputLabel>
                    <Select {...field}>
                      <Option value="None">None</Option>
                      <Option value="Main">Main</Option>
                      <Option value="Previous">Previous</Option>
                      <Option value="Phone">Phone</Option>
                      <Option value="Web">Web</Option>
                    </Select>
                    {errors.flight?.training ? <FormHelperText>{errors.flight.training.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="flight.booksOrdered"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.flight?.booksOrdered)} fullWidth>
                    <InputLabel>Books Ordered</InputLabel>
                    <OutlinedInput {...field} type="number" inputProps={{ min: 0 }} />
                    {errors.flight?.booksOrdered ? <FormHelperText>{errors.flight.booksOrdered.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="flight.training_notes"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.flight?.training_notes)} fullWidth>
                    <InputLabel>Training Notes</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.flight?.training_notes ? <FormHelperText>{errors.flight.training_notes.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="flight.status_note"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.flight?.status_note)} fullWidth>
                    <InputLabel>Status Note</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.flight?.status_note ? <FormHelperText>{errors.flight.status_note.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                Training & Status
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Controller
                  control={control}
                  name="flight.training_complete"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Training Complete"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="flight.training_see_doc"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Training See Doc"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="flight.mediaWaiver"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Media Waiver"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="flight.infection_test"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Infection Test"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="flight.nofly"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Not Flying"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="flight.exempt"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Exempt"
                    />
                  )}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

