import { z } from 'zod';
import { ChildSchema } from './child.schema';
import { KindergartenSchema } from './kindergarten.schema';
import { WishlistSchema } from './wishlist.schema';

// Extended child schema with relations for user profile
const ChildWithRelationsSchema = ChildSchema.extend({
    current_kindergarten: KindergartenSchema.nullable().optional(),
    wishlists: z.array(WishlistSchema).optional(),
});

// Full User Profile (for authenticated requests)
export const UserProfileSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    full_name: z.string(),
    created_at: z.coerce.date(),
    children: z.array(ChildWithRelationsSchema).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// User without sensitive data (for responses)
export const UserDataSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    full_name: z.string(),
});

export type UserData = z.infer<typeof UserDataSchema>;

