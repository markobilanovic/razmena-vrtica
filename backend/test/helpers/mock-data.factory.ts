import { AgeGroup } from '../../src/entities/child.entity';
import { MatchStatus } from '../../src/entities/match.entity';

export const mockChild = (overrides: any = {}) => ({
  id: 'child-1',
  first_name: 'Test',
  last_name: 'Child',
  date_of_birth: new Date('2020-01-01'),
  group: AgeGroup.MLADJA,
  current_kindergarten_id: 'kg-1',
  parent_id: 'parent-1',
  wishlists: [],
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockWishlist = (overrides: any = {}) => ({
  id: 'wishlist-1',
  child_id: 'child-1',
  target_kindergarten_id: 'kg-2',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockKindergarten = (overrides: any = {}) => ({
  id: 'kg-1',
  name: 'Test Kindergarten',
  address: '123 Test St',
  phone: '123-456-7890',
  email: 'test@example.com',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockMatchGroup = (overrides: any = {}) => ({
  id: 'match-1',
  status: MatchStatus.PENDING_ACCEPTANCE,
  participants: [],
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockMatchParticipant = (overrides: any = {}) => ({
  id: 'participant-1',
  match_group_id: 'match-1',
  child_id: 'child-1',
  next_child_id: 'child-2',
  has_accepted: false,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

// Type helper for mock repositories
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

