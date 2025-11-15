import { z } from 'zod';

export const flightSchema = z.object({
  _id: z.string().optional(), // CouchDB ID
  _rev: z.string().optional(), // CouchDB revision
  type: z.literal('Flight'),
  
  // Required fields
  name: z.string().min(1, 'Flight name is required'),
  flight_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  capacity: z.number().int().min(1, 'Capacity must be a positive integer'),
  
  // Optional fields
  completed: z.boolean().default(false),
  
  // Metadata
  metadata: z.object({
    created_at: z.string().optional(),
    created_by: z.string().optional(),
    updated_at: z.string().optional(),
    updated_by: z.string().optional(),
  }).optional(),
});
