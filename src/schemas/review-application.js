import { z } from 'zod';

/** API contract from OpenAPI (see `npm run sync-schemas`). */
export { ReviewApplication as reviewApplicationApiSchema } from '@/schemas/generated';

const optionalEmail = z.union([z.string().email(), z.literal('')]).optional();

/** Lenient form validation for incomplete intake applications. */
export const reviewApplicationFormSchema = z.object({
  _id: z.string().optional(),
  _rev: z.string().optional(),
  type: z.enum(['VeteranApp', 'GuardianApp']),
  app_status: z.enum(['New', 'Hold', 'Accepted', 'Rejected', 'Trash']).optional(),
  app_status_note: z.string().optional(),
  date_time: z.string().optional(),
  app_date: z.string().optional(),
  ip_address: z.string().optional(),
  accepted_as_rev: z.string().optional(),
  name: z.object({
    first: z.string().min(1, 'First name is required'),
    middle: z.string().optional(),
    last: z.string().min(1, 'Last name is required'),
    nickname: z.string().optional(),
  }),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone_day: z.string().optional(),
    phone_mbl: z.string().optional(),
    email: optionalEmail,
  }),
  birth_date: z.string().optional(),
  gender: z.enum(['M', 'F']).optional(),
  shirt: z
    .object({
      size: z.string().optional(),
    })
    .optional(),
  emerg_contact: z
    .object({
      name: z.string().optional(),
      address: z
        .object({
          phone: z.string().optional(),
          email: optionalEmail,
        })
        .optional(),
    })
    .optional(),
  vet_type: z.enum(['WWII', 'Korea', 'Vietnam', 'Afghanistan', 'Iraq', 'Other']).optional(),
  service: z
    .object({
      branch: z.string().optional(),
      dates: z.string().optional(),
      rank: z.string().optional(),
    })
    .optional(),
  guardian: z
    .object({
      pref_notes: z.string().optional(),
      pref_phone: z.string().optional(),
      pref_email: optionalEmail,
    })
    .optional(),
  medical: z
    .object({
      usesWheelchair: z.boolean().optional(),
      requiresOxygen: z.boolean().optional(),
    })
    .optional(),
  veteran: z
    .object({
      pref_notes: z.string().optional(),
    })
    .optional(),
});

export function applicationToFormDefaults(application) {
  return {
    _id: application._id,
    _rev: application._rev,
    type: application.type,
    app_status: application.app_status || 'New',
    app_status_note: application.app_status_note || '',
    date_time: application.date_time,
    app_date: application.app_date,
    ip_address: application.ip_address,
    accepted_as_rev: application.accepted_as_rev,
    name: {
      first: application.name?.first || '',
      middle: application.name?.middle || '',
      last: application.name?.last || '',
      nickname: application.name?.nickname || '',
    },
    address: {
      street: application.address?.street || '',
      city: application.address?.city || '',
      county: application.address?.county || '',
      state: application.address?.state || '',
      zip: application.address?.zip || '',
      phone_day: application.address?.phone_day || '',
      phone_mbl: application.address?.phone_mbl || '',
      email: application.address?.email || '',
    },
    birth_date: application.birth_date || '',
    gender: application.gender || 'M',
    shirt: {
      size: application.shirt?.size || 'None',
    },
    emerg_contact: {
      name: application.emerg_contact?.name || '',
      address: {
        phone: application.emerg_contact?.address?.phone || '',
        email: application.emerg_contact?.address?.email || '',
      },
    },
    vet_type: application.vet_type || 'WWII',
    service: {
      branch: application.service?.branch ?? '',
      dates: application.service?.dates || '',
      rank: application.service?.rank || '',
    },
    guardian: {
      pref_notes: application.guardian?.pref_notes || '',
      pref_phone: application.guardian?.pref_phone || '',
      pref_email: application.guardian?.pref_email || '',
    },
    medical: {
      usesWheelchair: Boolean(application.medical?.usesWheelchair),
      requiresOxygen: Boolean(application.medical?.requiresOxygen),
    },
    veteran: {
      pref_notes: application.veteran?.pref_notes || '',
    },
  };
}
