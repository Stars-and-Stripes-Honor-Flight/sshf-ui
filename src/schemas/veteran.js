import { z } from 'zod';

export const veteranSchema = z.object({
  _id: z.string().optional(), // CouchDB ID
  _rev: z.string().optional(), // CouchDB revision
  type: z.literal('Veteran'),
  
  // Basic Info
  app_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.object({
    first: z.string().min(2),
    middle: z.string().optional(),
    last: z.string().min(2),
    nickname: z.string().optional(),
  }),
  
  // Contact Info
  address: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    county: z.string().min(2),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
    phone_day: z.string().regex(/^\d{3}-\d{3}-\d{4}$/),
    phone_eve: z.string().regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
    phone_mbl: z.string().regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
    email: z.string().email().optional(),
  }),

  // Personal Info
  weight: z.number().min(60).max(450),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['M', 'F']),
  shirt: z.object({
    size: z.enum(['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']),
  }),

  // Service Info
  service: z.object({
    branch: z.enum(['Army', 'Air Force', 'Navy', 'Marines', 'Coast Guard']),
    rank: z.string(),
    dates: z.string(),
    activity: z.string(),
  }),
  vet_type: z.enum(['WWII', 'Korea', 'Vietnam', 'Afghanistan', 'Iraq', 'Other']),

  // Emergency Contact
  emerg_contact: z.object({
    name: z.string().min(2),
    relation: z.string().min(2),
    address: z.object({
      street: z.string().min(2),
      city: z.string().min(2),
      state: z.string().length(2),
      zip: z.string().regex(/^\d{5}(-\d{4})?$/),
      phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/),
      phone_eve: z.string().regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
      phone_mbl: z.string().regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
      email: z.string().email().optional(),
    }),
  }),

  // Medical Info
  medical: z.object({
    level: z.string().regex(/^[1-5](\.[0-9])?$/),
    alt_level: z.string().regex(/^[1-5](\.[0-9])?$/),
    food_restriction: z.enum(['None', 'Gluten Free', 'Vegetarian', 'Vegan']),
    usesCane: z.boolean(),
    usesWalker: z.boolean(),
    usesWheelchair: z.boolean(),
    isWheelchairBound: z.boolean(),
    usesScooter: z.boolean(),
    requiresOxygen: z.boolean(),
    examRequired: z.boolean(),
    form: z.boolean(),
    release: z.boolean(),
    limitations: z.string(),
    review: z.string(),
  }),

  // Flight Info
  flight: z.object({
    status: z.enum(['Active', 'Flown', 'Deceased', 'Removed', 'Future-Spring', 'Future-Fall', 'Future-PostRestriction']),
    id: z.string().optional(),
    group: z.string().optional(),
    bus: z.enum(['None', 'Alpha1', 'Alpha2', 'Alpha3', 'Alpha4', 'Alpha5', 'Bravo1', 'Bravo2', 'Bravo3', 'Bravo4', 'Bravo5']).optional(),
    seat: z.string().optional(),
    confirmed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    confirmed_by: z.string().optional(),
    waiver: z.boolean(),
    vaccinated: z.boolean(),
    status_note: z.string().optional(),
  }),

  metadata: z.object({
    created_at: z.string(),
    created_by: z.string(),
    updated_at: z.string(),
    updated_by: z.string(),
  }),
}); 