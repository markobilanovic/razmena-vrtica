import { z } from 'zod';

// Wishlist data schema
export const WishlistSchema = z.object({
  id: z.string().uuid(),
  child_id: z.string().uuid(),
  target_kindergarten_id: z.string().uuid(),
  created_at: z.coerce.date(),
});

export type Wishlist = z.infer<typeof WishlistSchema>;

// Create Wishlist Request
export const CreateWishlistRequestSchema = z.object({
  child_id: z.string().uuid(),
  target_kindergarten_id: z.string().uuid(),
});

export type CreateWishlistRequest = z.infer<typeof CreateWishlistRequestSchema>;

// Wishlist Response
export const WishlistResponseSchema = WishlistSchema;
export type WishlistResponse = Wishlist;

// Update Wishlist Request
export const UpdateWishlistRequestSchema = z.object({
  target_kindergarten_id: z.string().uuid().optional(),
});

export type UpdateWishlistRequest = z.infer<typeof UpdateWishlistRequestSchema>;

// Delete Wishlist Response
export const DeleteWishlistResponseSchema = z.object({
  success: z.boolean(),
});

export type DeleteWishlistResponse = z.infer<
  typeof DeleteWishlistResponseSchema
>;
