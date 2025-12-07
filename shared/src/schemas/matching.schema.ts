import { z } from 'zod';
import { MatchStatusSchema, AgeGroupSchema } from '../enums';
import { KindergartenSchema } from './kindergarten.schema';
import { ChildSchema } from './child.schema';
import { UserDataSchema } from './user.schema';

// Child with relations for match participant
const ChildWithMatchRelationsSchema = ChildSchema.extend({
    current_kindergarten: KindergartenSchema.nullable().optional(),
    parent: UserDataSchema.optional(),
});

// Match Participant schema (base)
export const MatchParticipantSchema = z.object({
    id: z.string().uuid(),
    match_group_id: z.string().uuid(),
    child_id: z.string().uuid().nullable(),
    next_child_id: z.string().uuid().nullable(),
    has_accepted: z.boolean(),
});

export type MatchParticipant = z.infer<typeof MatchParticipantSchema>;

// Match Participant with child relations (for detailed responses)
export const MatchParticipantWithChildSchema = MatchParticipantSchema.extend({
    child: ChildWithMatchRelationsSchema.nullable().optional(),
});

export type MatchParticipantWithChild = z.infer<typeof MatchParticipantWithChildSchema>;

// Match Group schema (base)
const MatchGroupBaseSchema = z.object({
    id: z.string().uuid(),
    status: MatchStatusSchema,
    created_at: z.coerce.date(),
});

// Match Group with participants (no child details)
export const MatchGroupSchema = MatchGroupBaseSchema.extend({
    participants: z.array(MatchParticipantSchema).optional(),
});

export type MatchGroup = z.infer<typeof MatchGroupSchema>;

// Match Group with full participant details (includes child and relations)
export const MatchGroupWithDetailsSchema = MatchGroupBaseSchema.extend({
    participants: z.array(MatchParticipantWithChildSchema).optional(),
});

export type MatchGroupWithDetails = z.infer<typeof MatchGroupWithDetailsSchema>;

// Check Matches Request
export const CheckMatchesRequestSchema = z.object({
    childId: z.string().uuid(),
});

export type CheckMatchesRequest = z.infer<typeof CheckMatchesRequestSchema>;

// Check Matches Response (returns array of kindergartens)
export const CheckMatchesResponseSchema = z.array(KindergartenSchema);
export type CheckMatchesResponse = z.infer<typeof CheckMatchesResponseSchema>;

// Create Match Request
export const CreateMatchRequestSchema = z.object({
    childIds: z.array(z.string().uuid()).min(2, 'At least 2 children required for a match'),
});

export type CreateMatchRequest = z.infer<typeof CreateMatchRequestSchema>;

// Create Match Response
export const CreateMatchResponseSchema = MatchGroupSchema;
export type CreateMatchResponse = MatchGroup;

// Get Potential Matches Query
export const GetPotentialMatchesQuerySchema = z.object({
    ageGroup: AgeGroupSchema.optional(),
});

export type GetPotentialMatchesQuery = z.infer<typeof GetPotentialMatchesQuerySchema>;

// Validate Match Response
export const ValidateMatchResponseSchema = z.object({
    valid: z.boolean(),
});

export type ValidateMatchResponse = z.infer<typeof ValidateMatchResponseSchema>;

