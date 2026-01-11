'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import { User } from '@phosphor-icons/react';
import { FormSectionHeader } from './form-section-header';
import { FormTextField } from './form-text-field';
import { FormSelectField } from './form-select-field';
import { NameFields } from './name-fields';

export function PersonalInformationCard({ 
  control, 
  errors,
  nicknameGridProps, // Optional: pass nicknameGridProps for guardian form
  disabled = false
}) {
  return (
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
        <FormSectionHeader 
          icon={User} 
          title="Personal Information" 
        />
        <Grid container spacing={3}>
          <NameFields 
            control={control} 
            errors={errors}
            disabled={disabled}
            {...(nicknameGridProps && { nicknameGridProps })}
          />
          <FormTextField
            control={control}
            name="birth_date"
            label="Birth Date"
            error={errors.birth_date}
            required
            type="date"
            disabled={disabled}
            gridProps={{ xs: 12, md: 6 }}
          />
          <FormSelectField
            control={control}
            name="gender"
            label="Gender"
            error={errors.gender}
            required
            disabled={disabled}
            options={[
              { value: 'M', label: 'Male' },
              { value: 'F', label: 'Female' }
            ]}
            gridProps={{ xs: 12, md: 6 }}
          />
        </Grid>
      </CardContent>
    </Card>
  );
}

