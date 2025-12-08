import { z } from 'zod';
import { GenderSchema, AgeGroupSchema } from '../enums';

// Child data schema
export const ChildSchema = z.object({
  id: z.string().uuid(),
  parent_id: z.string().uuid(),
  current_kindergarten_id: z.string().uuid(),
  name: z.string(),
  birth_date: z.coerce.date().nullable().optional(),
  age_group: z.number().int().min(0).max(6).nullable().optional(),
  gender: GenderSchema.nullable().optional(),
  group: AgeGroupSchema,
});

export type Child = z.infer<typeof ChildSchema>;

// Create Child Request
export const CreateChildRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birth_date: z.string().optional(), // Date as ISO string (optional)
  gender: GenderSchema.optional(),
  group: AgeGroupSchema,
  current_kindergarten_id: z.string().uuid(),
});

export type CreateChildRequest = z.infer<typeof CreateChildRequestSchema>;

// Child Response (with relations populated if needed)
export const ChildResponseSchema = ChildSchema;
export type ChildResponse = Child;
