import { z } from 'zod';

// Login Request
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Register Request
export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// User in response (without sensitive data)
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// Login Response
export const LoginResponseSchema = z.object({
  access_token: z.string(),
  user: UserResponseSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Register Response (same as login)
export const RegisterResponseSchema = LoginResponseSchema;
export type RegisterResponse = LoginResponse;

// Email Confirmation
export const ConfirmEmailRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type ConfirmEmailRequest = z.infer<typeof ConfirmEmailRequestSchema>;

export const ConfirmEmailResponseSchema = z.object({
  message: z.string(),
});

export type ConfirmEmailResponse = z.infer<typeof ConfirmEmailResponseSchema>;

// Resend Confirmation
export const ResendConfirmationRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type ResendConfirmationRequest = z.infer<
  typeof ResendConfirmationRequestSchema
>;

export const ResendConfirmationResponseSchema = z.object({
  message: z.string(),
});

export type ResendConfirmationResponse = z.infer<
  typeof ResendConfirmationResponseSchema
>;
