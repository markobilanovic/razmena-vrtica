import { z } from 'zod';

// Kindergarten data schema
export const KindergartenSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

export type Kindergarten = z.infer<typeof KindergartenSchema>;

// Create Kindergarten Request
export const CreateKindergartenRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CreateKindergartenRequest = z.infer<
  typeof CreateKindergartenRequestSchema
>;

// Kindergarten Response
export const KindergartenResponseSchema = KindergartenSchema;
export type KindergartenResponse = Kindergarten;
