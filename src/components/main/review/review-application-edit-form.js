'use client';

import * as React from 'react';
import Link from 'next/link';
import Alert from '@mui/material/Alert';
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
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { toast } from '@/components/core/toaster';
import { Option } from '@/components/core/option';
import { ReviewStatusChip } from '@/components/main/review/review-status-chip';
import { api } from '@/lib/api';
import { ACCEPT_CONFLICT_MESSAGE, REVIEW_APPLICATION_TYPES, SERVICE_BRANCHES, SHIRT_SIZES, VET_TYPES } from '@/lib/review/constants';
import { prepareReviewApplicationPayload } from '@/lib/review/normalize';
import { getAcceptConflictMessage, isPatchableReviewStatus } from '@/lib/review/status';
import { paths } from '@/paths';
import {
  applicationToFormDefaults,
  reviewApplicationFormSchema,
} from '@/schemas/review-application';

function formatTypeLabel(type) {
  return type === REVIEW_APPLICATION_TYPES.GUARDIAN ? 'Guardian application' : 'Veteran application';
}

export function ReviewApplicationEditForm({ application: initialApplication, onApplicationUpdated }) {
  const [application, setApplication] = React.useState(initialApplication);
  const [saving, setSaving] = React.useState(false);
  const [accepting, setAccepting] = React.useState(false);
  const [statusUpdating, setStatusUpdating] = React.useState(false);
  const [acceptMessage, setAcceptMessage] = React.useState(null);
  const [lastAcceptResult, setLastAcceptResult] = React.useState(null);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(reviewApplicationFormSchema),
    defaultValues: applicationToFormDefaults(initialApplication),
  });

  React.useEffect(() => {
    setApplication(initialApplication);
    reset(applicationToFormDefaults(initialApplication));
  }, [initialApplication, reset]);

  const isVeteranApp = application.type === REVIEW_APPLICATION_TYPES.VETERAN;
  const isAccepted = application.app_status === 'Accepted';

  const logisticsHref = isVeteranApp
    ? paths.main.veterans.details(application._id)
    : paths.main.guardians.details(application._id);

  const persistApplication = (updated) => {
    setApplication(updated);
    reset(applicationToFormDefaults(updated));
    onApplicationUpdated?.(updated);
  };

  const saveFormValues = async (formValues) => {
    const payload = prepareReviewApplicationPayload(application, formValues);
    const updated = await api.updateReviewApplication(application._id, payload);
    persistApplication(updated);
    return updated;
  };

  const onSave = handleSubmit(async (formValues) => {
    setSaving(true);
    setAcceptMessage(null);
    try {
      await saveFormValues(formValues);
      toast.success('Application saved');
    } finally {
      setSaving(false);
    }
  });

  const handleStatusChange = async (nextStatus) => {
    if (!isPatchableReviewStatus(nextStatus)) {
      return;
    }
    setStatusUpdating(true);
    setAcceptMessage(null);
    try {
      const updated = await api.updateReviewApplicationStatus(application._id, {
        app_status: nextStatus,
        app_status_note: getValues('app_status_note'),
      });
      persistApplication(updated);
      toast.success(`Status set to ${nextStatus}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    setAcceptMessage(null);
    try {
      if (isDirty) {
        setSaving(true);
        await saveFormValues(getValues());
        setSaving(false);
      }
      const result = await api.acceptReviewApplication(application._id, {
        app_status_note: getValues('app_status_note'),
      });
      setLastAcceptResult(result);
      if (result?.application) {
        persistApplication(result.application);
      }
      setAcceptMessage('Application saved to waitlist (logistics database).');
      toast.success('Application accepted into logistics');
    } catch (error) {
      const conflict = getAcceptConflictMessage(error);
      if (conflict) {
        setAcceptMessage(conflict);
      } else if (error.status !== 409) {
        setAcceptMessage(error.message);
      }
    } finally {
      setAccepting(false);
    }
  };

  const busy = saving || accepting || statusUpdating;

  return (
    <form onSubmit={onSave}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Typography variant="h5">{formatTypeLabel(application.type)}</Typography>
                <ReviewStatusChip status={application.app_status} />
                {application.accepted_as_rev ? (
                  <Typography variant="body2" color="text.secondary">
                    Last accept logistics rev: {application.accepted_as_rev}
                  </Typography>
                ) : null}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Submitted {application.date_time || '—'} · App date {application.app_date || '—'}
                {application.ip_address ? ` · IP ${application.ip_address}` : ''}
              </Typography>
              {acceptMessage ? (
                <Alert severity={acceptMessage.includes('modified') ? 'warning' : 'success'}>
                  {acceptMessage}
                </Alert>
              ) : null}
              {isAccepted ? (
                <Alert severity="info">
                  This application was accepted.{' '}
                  <Link href={logisticsHref}>Open logistics record</Link>
                  {lastAcceptResult?.record ? ' (updated on last accept).' : '.'}
                </Alert>
              ) : null}
              {!isAccepted ? (
                <Alert severity="info" variant="outlined">
                  Accept copies this application into logistics via the review API (same mapping as legacy
                  hf-app-review). If logistics changed since the last accept, you will see: &quot;
                  {ACCEPT_CONFLICT_MESSAGE}&quot;
                </Alert>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">Applicant</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={3}>
                  <Controller
                    control={control}
                    name="name.first"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.name?.first)} fullWidth>
                        <InputLabel required>First name</InputLabel>
                        <OutlinedInput {...field} label="First name" />
                        {errors.name?.first ? (
                          <FormHelperText>{errors.name.first.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <Controller
                    control={control}
                    name="name.middle"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Middle name</InputLabel>
                        <OutlinedInput {...field} label="Middle name" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <Controller
                    control={control}
                    name="name.last"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.name?.last)} fullWidth>
                        <InputLabel required>Last name</InputLabel>
                        <OutlinedInput {...field} label="Last name" />
                        {errors.name?.last ? (
                          <FormHelperText>{errors.name.last.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <Controller
                    control={control}
                    name="name.nickname"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Nickname</InputLabel>
                        <OutlinedInput {...field} label="Nickname" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Birth date (YYYY-MM-DD)</InputLabel>
                        <OutlinedInput {...field} label="Birth date (YYYY-MM-DD)" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select {...field} label="Gender">
                          <MenuItem value="M">Male</MenuItem>
                          <MenuItem value="F">Female</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="shirt.size"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Shirt size</InputLabel>
                        <Select {...field} label="Shirt size">
                          {SHIRT_SIZES.map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Typography variant="h6">Address & contact</Typography>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Controller
                    control={control}
                    name="address.street"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Street</InputLabel>
                        <OutlinedInput {...field} label="Street" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="address.city"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>City</InputLabel>
                        <OutlinedInput {...field} label="City" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="address.county"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>County</InputLabel>
                        <OutlinedInput {...field} label="County" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={2}>
                  <Controller
                    control={control}
                    name="address.state"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>State</InputLabel>
                        <OutlinedInput {...field} label="State" inputProps={{ maxLength: 2 }} />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={2}>
                  <Controller
                    control={control}
                    name="address.zip"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>ZIP</InputLabel>
                        <OutlinedInput {...field} label="ZIP" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="address.phone_day"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Day phone</InputLabel>
                        <OutlinedInput {...field} label="Day phone" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="address.phone_mbl"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Mobile phone</InputLabel>
                        <OutlinedInput {...field} label="Mobile phone" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="address.email"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.address?.email)} fullWidth>
                        <InputLabel>Email</InputLabel>
                        <OutlinedInput {...field} label="Email" />
                        {errors.address?.email ? (
                          <FormHelperText>{errors.address.email.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Typography variant="h6">Emergency contact</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="emerg_contact.name"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Name</InputLabel>
                        <OutlinedInput {...field} label="Name" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="emerg_contact.address.phone"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Phone</InputLabel>
                        <OutlinedInput {...field} label="Phone" />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <Controller
                    control={control}
                    name="emerg_contact.address.email"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Email</InputLabel>
                        <OutlinedInput {...field} label="Email" />
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>

              {isVeteranApp ? (
                <>
                  <Divider />
                  <Typography variant="h6">Service & preferences</Typography>
                  <Grid container spacing={2}>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="vet_type"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>War era</InputLabel>
                            <Select {...field} label="War era">
                              {VET_TYPES.map((value) => (
                                <Option key={value} value={value}>
                                  {value}
                                </Option>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="service.branch"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Branch</InputLabel>
                            <Select {...field} label="Branch">
                              {SERVICE_BRANCHES.map((branch) => (
                                <MenuItem key={branch || 'empty'} value={branch}>
                                  {branch || '(none)'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="service.dates"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Service dates</InputLabel>
                            <OutlinedInput {...field} label="Service dates" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="service.rank"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Rank</InputLabel>
                            <OutlinedInput {...field} label="Rank" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="guardian.pref_notes"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Guardian preference notes</InputLabel>
                            <OutlinedInput {...field} label="Guardian preference notes" multiline minRows={2} />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="guardian.pref_phone"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Preferred guardian phone</InputLabel>
                            <OutlinedInput {...field} label="Preferred guardian phone" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="guardian.pref_email"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Preferred guardian email</InputLabel>
                            <OutlinedInput {...field} label="Preferred guardian email" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="medical.usesWheelchair"
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(field.value)}
                                onChange={(event) => field.onChange(event.target.checked)}
                              />
                            }
                            label="Uses wheelchair"
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="medical.requiresOxygen"
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(field.value)}
                                onChange={(event) => field.onChange(event.target.checked)}
                              />
                            }
                            label="Requires oxygen"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  <Divider />
                  <Typography variant="h6">Veteran preference</Typography>
                  <Controller
                    control={control}
                    name="veteran.pref_notes"
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Veteran preference notes</InputLabel>
                        <OutlinedInput {...field} label="Veteran preference notes" multiline minRows={2} />
                      </FormControl>
                    )}
                  />
                </>
              )}

              <Divider />

              <Controller
                control={control}
                name="app_status_note"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status note</InputLabel>
                    <OutlinedInput {...field} label="Status note" multiline minRows={2} />
                  </FormControl>
                )}
              />
            </Stack>
          </CardContent>
          <CardActions sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button type="submit" variant="contained" disabled={busy}>
                {saving ? 'Saving…' : 'Save corrections'}
              </Button>
              <Button
                variant="outlined"
                color="success"
                disabled={busy}
                onClick={handleAccept}
              >
                {accepting ? 'Accepting…' : 'Accept into logistics'}
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {application.app_status !== 'New' ? (
                <Button disabled={busy} onClick={() => handleStatusChange('New')}>
                  Mark New
                </Button>
              ) : null}
              <Button disabled={busy} onClick={() => handleStatusChange('Hold')}>
                Hold
              </Button>
              <Button disabled={busy} color="error" onClick={() => handleStatusChange('Rejected')}>
                Reject
              </Button>
              <Button disabled={busy} color="inherit" onClick={() => handleStatusChange('Trash')}>
                Trash
              </Button>
            </Stack>
          </CardActions>
        </Card>
      </Stack>
    </form>
  );
}
