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
import { Medal, Airplane, FirstAid, Clock } from '@phosphor-icons/react';
import { Option } from '@/components/core/option';
import { FormSectionHeader } from '@/components/main/shared/form-section-header';
import { PersonalInformationCard } from '@/components/main/shared/personal-information-card';

export function EssentialInfoSection({ control, errors, veteran, onOpenHistory }) {
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
      />

      {/* Service Information Card */}
      <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <FormSectionHeader 
            icon={Medal} 
            title="Service Information" 
          />
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
            <Grid xs={12}>
              <Controller
                control={control}
                name="service.activity"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.service?.activity)} fullWidth>
                    <InputLabel>Activities During Military Service</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.service?.activity ? <FormHelperText>{errors.service.activity.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Medical Information Card */}
      <Card id="medical-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent>
          <FormSectionHeader 
            icon={FirstAid} 
            title="Medical Information" 
          />
          <Grid container spacing={3}>
            <Grid xs={12} md={4}>
              <Controller
                control={control}
                name="medical.level"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.level)} fullWidth>
                    <InputLabel>Medical Level</InputLabel>
                    <OutlinedInput {...field} inputProps={{ maxLength: 3 }} />
                    {errors.medical?.level ? <FormHelperText>{errors.medical.level.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Controller
                control={control}
                name="medical.alt_level"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.alt_level)} fullWidth>
                    <InputLabel>3rd-Party Level</InputLabel>
                    <OutlinedInput {...field} inputProps={{ maxLength: 3 }} />
                    {errors.medical?.alt_level ? <FormHelperText>{errors.medical.alt_level.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Controller
                control={control}
                name="medical.food_restriction"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.food_restriction)} fullWidth>
                    <InputLabel>Food Restriction</InputLabel>
                    <Select {...field}>
                      <Option value="None">None</Option>
                      <Option value="Gluten Free">Gluten Free</Option>
                      <Option value="Vegetarian">Vegetarian</Option>
                      <Option value="Vegan">Vegan</Option>
                    </Select>
                    {errors.medical?.food_restriction ? <FormHelperText>{errors.medical.food_restriction.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
                Mobility Equipment Used:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="medical.usesCane"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Cane"
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="medical.usesWalker"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Walker"
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="medical.usesWheelchair"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Wheelchair"
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="medical.usesScooter"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Scooter"
                />
              </Stack>
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="medical.isWheelchairBound"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Wheelchair Bound (unable to transfer)"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="medical.requiresOxygen"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Requires Oxygen"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="medical.examRequired"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Medical Exam Required"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="medical.release"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Medical Waiver Received"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="medical.form"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  />
                }
                label="Medical Form Received"
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="medical.review"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.medical?.review)} fullWidth>
                    <InputLabel>Medical Notes</InputLabel>
                    <OutlinedInput {...field} multiline rows={3} />
                    {errors.medical?.review ? <FormHelperText>{errors.medical.review.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            {/* Hidden field for medical limitations */}
            <Controller
              control={control}
              name="medical.limitations"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
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
              onClick={() => onOpenHistory('Flight Status', veteran?.flight?.history || [])}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              History ({veteran?.flight?.history?.length || 0})
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
                    <OutlinedInput {...field} inputProps={{ maxLength: 15 }} />
                    {errors.flight?.group ? <FormHelperText>{errors.flight.group.message}</FormHelperText> : null}
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
                    <InputLabel>Assigned Flight</InputLabel>
                    <OutlinedInput {...field} />
                    {errors.flight?.id ? <FormHelperText>{errors.flight.id.message}</FormHelperText> : null}
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
                    <InputLabel>Assigned Seat</InputLabel>
                    <OutlinedInput {...field} inputProps={{ maxLength: 10 }} />
                    {errors.flight?.seat ? <FormHelperText>{errors.flight.seat.message}</FormHelperText> : null}
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
                    <InputLabel>Assigned Bus</InputLabel>
                    <Select {...field}>
                      <Option value="">None</Option>
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
                    <OutlinedInput {...field} inputProps={{ maxLength: 30 }} />
                    {errors.flight?.confirmed_by ? <FormHelperText>{errors.flight.confirmed_by.message}</FormHelperText> : null}
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
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
                Flight Requirements:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="flight.waiver"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Liability Waiver Received"
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="flight.mediaWaiver"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Media Waiver Received"
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="flight.vaccinated"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Vaccinated"
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="flight.infection_test"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Infection Tested"
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={control}
                      name="flight.nofly"
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="Not Flying"
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

