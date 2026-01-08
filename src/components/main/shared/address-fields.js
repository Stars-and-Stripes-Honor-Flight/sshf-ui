'use client';

import * as React from 'react';
import { FormTextField } from './form-text-field';

export function AddressFields({ 
  control, 
  errors, 
  prefix = 'address',
  showCounty = false,
  showPhoneEve = false,
  showPhoneMbl = true,
  showEmail = true
}) {
  return (
    <>
      <FormTextField
        control={control}
        name={`${prefix}.street`}
        label="Street Address"
        error={errors[prefix]?.street}
        required
        gridProps={{ xs: 12 }}
      />
      <FormTextField
        control={control}
        name={`${prefix}.city`}
        label="City"
        error={errors[prefix]?.city}
        required
        gridProps={{ xs: 12, md: 6 }}
      />
      {showCounty && (
        <FormTextField
          control={control}
          name={`${prefix}.county`}
          label="County"
          error={errors[prefix]?.county}
          gridProps={{ xs: 12, md: 6 }}
        />
      )}
      <FormTextField
        control={control}
        name={`${prefix}.state`}
        label="State"
        error={errors[prefix]?.state}
        required
        gridProps={{ xs: 12, md: showCounty ? 6 : 3 }}
      />
      <FormTextField
        control={control}
        name={`${prefix}.zip`}
        label="ZIP Code"
        error={errors[prefix]?.zip}
        required
        gridProps={{ xs: 12, md: showCounty ? 6 : 3 }}
      />
      <FormTextField
        control={control}
        name={`${prefix}.phone_day`}
        label="Day Phone"
        error={errors[prefix]?.phone_day}
        required
        gridProps={{ xs: 12, md: showPhoneEve || showPhoneMbl ? 4 : 6 }}
      />
      {showPhoneEve && (
        <FormTextField
          control={control}
          name={`${prefix}.phone_eve`}
          label="Evening Phone"
          error={errors[prefix]?.phone_eve}
          gridProps={{ xs: 12, md: 4 }}
        />
      )}
      {showPhoneMbl && (
        <FormTextField
          control={control}
          name={`${prefix}.phone_mbl`}
          label="Mobile Phone"
          error={errors[prefix]?.phone_mbl}
          gridProps={{ xs: 12, md: showPhoneEve ? 4 : 6 }}
        />
      )}
      {showEmail && (
        <FormTextField
          control={control}
          name={`${prefix}.email`}
          label="Email"
          error={errors[prefix]?.email}
          type="email"
          gridProps={{ xs: 12, md: 6 }}
        />
      )}
    </>
  );
}

