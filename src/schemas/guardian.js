import { z } from 'zod';

export const guardianSchema = z.object({
  _id: z.string().optional(), // CouchDB ID
  _rev: z.string().optional(), // CouchDB revision
  type: z.literal('Guardian'),
  
  // Basic Info
  app_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.object({
    first: z.string().min(2).regex(/^[a-zA-Z'. ]{2,}$/),
    middle: z.string().regex(/^[a-zA-Z' ]*$/).optional(),
    last: z.string().min(2).regex(/^[a-zA-Z'. -]{2,}$/),
    nickname: z.string().regex(/^[a-zA-Z'. ]*$/).optional(),
  }),
  
  // Contact Info
  address: z.object({
    street: z.string().min(2).regex(/^[a-zA-Z0-9.,# /-]{2,}$/),
    city: z.string().min(2).regex(/^[a-zA-Z. -]{2,}$/),
    county: z.string().min(2).regex(/^[a-zA-Z. ]{2,}$/),
    state: z.string().length(2).regex(/^[a-zA-Z]{2}$/),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
    phone_day: z.string().regex(/^\d{3}-\d{3}-\d{4}$/),
    phone_eve: z.string().regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
    phone_mbl: z.string().regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
    email: z.string().email().optional(),
  }),

  // Personal Info
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['M', 'F']),
  weight: z.string().regex(/^\d{1,3}$/).optional(),
  occupation: z.string().optional(),
  shirt: z.object({
    size: z.enum(['None', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']),
  }),

  // Service Info (for guardians who are veterans)
  notes: z.object({
    service: z.enum(['Y', 'N']).default('N'),
    other: z.string().optional(),
  }),

  // Emergency Contact
  emerg_contact: z.object({
    name: z.string().min(2).regex(/^[a-zA-Z'. -]{2,}$/),
    relation: z.string().optional(),
    address: z.object({
      phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/),
      email: z.string().email().optional(),
    }),
  }),

  // Veteran Preference/Pairing
  veteran: z.object({
    pref_notes: z.string().optional(),
    pairings: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ).optional(),
    history: z.array(
      z.object({
        id: z.string(),
        change: z.string(),
      })
    ).optional(),
  }),

  // Medical Info
  medical: z.object({
    level: z.string().regex(/^[A-D]$/),
    form: z.boolean().default(false),
    release: z.boolean().default(false),
    limitations: z.string().optional(),
    food_restriction: z.enum(['None', 'Gluten Free', 'Vegetarian', 'Vegan']).default('None'),
    experience: z.string().optional(),
    can_push: z.boolean().default(false),
    can_lift: z.boolean().default(false),
  }),

  // Mail Call
  mail_call: z.object({
    received: z.string().optional(),
    name: z.string().regex(/^[a-zA-Z'. -]{2,}$/).optional(),
    relation: z.string().optional(),
    notes: z.string().optional(),
    address: z.object({
      phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
      email: z.string().email().optional(),
    }).optional(),
  }).optional(),

  // Call Center Info
  call: z.object({
    fm_number: z.string().optional(),
    notes: z.string().optional(),
    email_sent: z.boolean().default(false),
    assigned_to: z.string().optional(),
    mail_sent: z.boolean().default(false),
    history: z.array(
      z.object({
        id: z.string(),
        change: z.string(),
      })
    ).optional(),
  }).optional(),

  // Flight Info
  flight: z.object({
    status: z.enum(['Active', 'Flown', 'Deceased', 'Removed', 'Future-Spring', 'Future-Fall', 'Future-PostRestriction', 'Copied']).default('Active'),
    id: z.string().optional(),
    group: z.string().optional(),
    bus: z.enum(['None', 'Alpha1', 'Alpha2', 'Alpha3', 'Alpha4', 'Alpha5', 'Bravo1', 'Bravo2', 'Bravo3', 'Bravo4', 'Bravo5']).optional(),
    seat: z.string().optional(),
    confirmed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    confirmed_by: z.string().optional(),
    status_note: z.string().optional(),
    waiver: z.boolean().default(false),
    media_waiver: z.boolean().default(false),
    vaccinated: z.boolean().default(false),
    infection_test: z.boolean().default(false),
    nofly: z.boolean().default(false),
    training: z.enum(['None', 'Main', 'Previous', 'Phone', 'Web', 'Make-up']).optional(),
    training_notes: z.string().optional(),
    training_see_doc: z.boolean().default(false),
    training_complete: z.boolean().default(false),
    paid: z.boolean().default(false),
    exempt: z.boolean().default(false),
    books_ordered: z.number().int().min(0).optional(),
    history: z.array(
      z.object({
        id: z.string(),
        change: z.string(),
      })
    ).optional(),
  }),

  // Apparel Info
  apparel: z.object({
    item: z.enum(['None', 'Jacket', 'Polo', 'Both']).default('None'),
    jacket_size: z.enum(['None', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']).default('None'),
    shirt_size: z.enum(['None', 'WXS', 'WS', 'WM', 'WL', 'WXL', 'W2XL', 'W3XL', 'W4XL', 'W5XL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']).default('None'),
    delivery: z.enum(['None', 'Mailed', 'Training', 'Home']).default('None'),
    notes: z.string().optional(),
    date: z.string().optional(),
    by: z.string().optional(),
  }).optional(),

  // Accommodations
  accommodations: z.object({
    hotel_name: z.string().optional(),
    room_type: z.enum(['None', 'Double', 'Single']).default('None'),
    arrival_date: z.string().optional(),
    arrival_time: z.string().optional(),
    arrival_flight: z.string().optional(),
    departure_date: z.string().optional(),
    departure_time: z.string().optional(),
    departure_flight: z.string().optional(),
    attend_banquette: z.string().optional(),
    banquette_guest: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),

  metadata: z.object({
    created_at: z.string(),
    created_by: z.string(),
    updated_at: z.string(),
    updated_by: z.string(),
  }),
}); 