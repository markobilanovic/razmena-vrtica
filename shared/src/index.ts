// Re-export all enums
export * from './enums';

// Re-export all schemas
export * from './schemas/auth.schema';
export * from './schemas/user.schema';
export * from './schemas/child.schema';
export * from './schemas/kindergarten.schema';
export * from './schemas/wishlist.schema';
export * from './schemas/matching.schema';

// Legacy exports (if needed)
export interface SharedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const GREETING = 'Hello from shared!';
