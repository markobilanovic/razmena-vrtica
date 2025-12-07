# Testing Plan for Automatic Match Creation Feature

## 📋 Overview

This document outlines a comprehensive testing strategy for the automatic matching feature, including unit tests, integration tests, and E2E tests.

**Current Status**: Feature implemented but no automated tests exist  
**Estimated Time**: 8-12 hours  
**Priority**: HIGH (ensures feature reliability)

---

## 🎯 Testing Objectives

1. ✅ Verify wishlist CRUD operations work correctly
2. ✅ Verify automatic match detection works for 2-way and 3-way swaps
3. ✅ Verify age group isolation is enforced
4. ✅ Verify duplicate match prevention works
5. ✅ Verify error handling doesn't break wishlist operations
6. ✅ Verify edge cases are handled properly

---

## 📁 Test File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── wishlist.service.ts
│   │   ├── wishlist.service.spec.ts          ← NEW
│   │   ├── matching.service.ts
│   │   └── matching.service.spec.ts          ← NEW
│   └── controllers/
│       ├── wishlist.controller.ts
│       └── wishlist.controller.spec.ts       ← NEW
└── test/
    ├── integration/
    │   ├── auto-matching.e2e-spec.ts         ← NEW
    │   └── wishlist.e2e-spec.ts              ← NEW
    └── jest-e2e.json
```

---

## 🧪 Phase 1: Unit Tests for WishlistService

**File**: `backend/src/services/wishlist.service.spec.ts`  
**Estimated Time**: 2-3 hours

### Test Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistService } from './wishlist.service';
import { MatchingService } from './matching.service';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';

describe('WishlistService', () => {
  let service: WishlistService;
  let wishlistRepo: MockType<Repository<Wishlist>>;
  let childRepo: MockType<Repository<Child>>;
  let kindergartenRepo: MockType<Repository<Kindergarten>>;
  let matchingService: MockType<MatchingService>;

  // Mock repository factory
  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getRepositoryToken(Wishlist),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Child),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Kindergarten),
          useFactory: mockRepository,
        },
        {
          provide: MatchingService,
          useValue: {
            checkAndCreateMatchesForChild: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    wishlistRepo = module.get(getRepositoryToken(Wishlist));
    childRepo = module.get(getRepositoryToken(Child));
    kindergartenRepo = module.get(getRepositoryToken(Kindergarten));
    matchingService = module.get(MatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Test Cases

#### 1. `create()` Tests

- ✅ **Successfully creates wishlist**
  - Given: Valid child ID and kindergarten ID
  - When: create() is called
  - Then: Wishlist is saved and MatchingService is called
  
- ✅ **Throws error when child not found**
  - Given: Invalid child ID
  - When: create() is called
  - Then: Error "Child not found" is thrown
  
- ✅ **Throws error when kindergarten not found**
  - Given: Invalid kindergarten ID
  - When: create() is called
  - Then: Error "Target kindergarten not found" is thrown
  
- ✅ **Throws error when duplicate wishlist exists**
  - Given: Wishlist already exists for child-kindergarten pair
  - When: create() is called
  - Then: Error "Wishlist already exists" is thrown
  
- ✅ **Calls MatchingService after creation**
  - Given: Valid wishlist creation
  - When: create() completes
  - Then: checkAndCreateMatchesForChild() is called with child ID
  
- ✅ **Wishlist creation succeeds even if matching fails**
  - Given: MatchingService throws error
  - When: create() is called
  - Then: Wishlist is still created (error caught and logged)

#### 2. `update()` Tests

- ✅ **Successfully updates wishlist**
- ✅ **Throws error when wishlist not found**
- ✅ **Throws error when new kindergarten not found**
- ✅ **Calls MatchingService after update**
- ✅ **Update succeeds even if matching fails**

#### 3. `delete()` Tests

- ✅ **Successfully deletes wishlist**
- ✅ **Throws error when wishlist not found**
- ✅ **Calls MatchingService after deletion**
- ✅ **Deletion succeeds even if matching fails**

#### 4. `findByChild()` Tests

- ✅ **Returns wishlists for given child**
- ✅ **Returns empty array when no wishlists found**
- ✅ **Includes target_kindergarten relation**

#### 5. `findOne()` Tests

- ✅ **Returns wishlist with relations**
- ✅ **Returns null when not found**

---

## 🧪 Phase 2: Unit Tests for MatchingService

**File**: `backend/src/services/matching.service.spec.ts`  
**Estimated Time**: 3-4 hours

### Test Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchingService } from './matching.service';
import { Child, AgeGroup } from '../entities/child.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';

describe('MatchingService', () => {
  let service: MatchingService;
  let childRepo: any;
  let wishlistRepo: any;
  let matchGroupRepo: any;
  let matchParticipantRepo: any;

  beforeEach(async () => {
    // ... setup similar to WishlistService
  });
});
```

### Test Cases

#### 1. `checkAndCreateMatchesForChild()` Tests

- ✅ **Creates match for 2-way swap**
  - Given: Child A at KG-1 wants KG-2, Child B at KG-2 wants KG-1 (same age group)
  - When: checkAndCreateMatchesForChild(childA.id) is called
  - Then: Match is created with both children
  
- ✅ **Creates match for 3-way swap**
  - Given: A→B, B→C, C→A (all same age group)
  - When: checkAndCreateMatchesForChild() is called for any child
  - Then: Match is created with all three children
  
- ✅ **Returns empty array when no matches found**
  - Given: Child with wishlist but no reciprocal wishlists
  - When: checkAndCreateMatchesForChild() is called
  - Then: Empty array is returned
  
- ✅ **Returns empty array when child not found**
  - Given: Invalid child ID
  - When: checkAndCreateMatchesForChild() is called
  - Then: Empty array is returned
  
- ✅ **Returns empty array when child has no age group**
  - Given: Child without age group assigned
  - When: checkAndCreateMatchesForChild() is called
  - Then: Empty array is returned
  
- ✅ **Does not create duplicate matches**
  - Given: Match already exists for child set
  - When: checkAndCreateMatchesForChild() is called again
  - Then: No new match is created
  
- ✅ **Only matches children in same age group**
  - Given: Child A (MLADJA) and Child B (SREDNJA) with reciprocal wishes
  - When: checkAndCreateMatchesForChild() is called
  - Then: No match is created

#### 2. `findExistingMatch()` Tests (Private - test via public methods)

- ✅ **Finds existing match with same children**
  - Given: Match exists with children [A, B]
  - When: Checking for match with [B, A] (different order)
  - Then: Existing match is found
  
- ✅ **Returns null when no matching children found**
  - Given: Match exists with children [A, B]
  - When: Checking for match with [A, C]
  - Then: null is returned
  
- ✅ **Only checks PENDING_ACCEPTANCE and ACTIVE_CONTACT statuses**
  - Given: Match with status COMPLETED exists
  - When: Checking for match with same children
  - Then: null is returned (completed matches don't count)

#### 3. `checkAndCreateMatchesForAgeGroup()` Tests

- ✅ **Creates multiple matches in age group**
  - Given: Multiple valid swap cycles in age group
  - When: checkAndCreateMatchesForAgeGroup(AgeGroup.MLADJA) is called
  - Then: All valid matches are created
  
- ✅ **Does not create matches across age groups**
  - Given: Children from multiple age groups
  - When: checkAndCreateMatchesForAgeGroup(AgeGroup.MLADJA) is called
  - Then: Only MLADJA children are matched

#### 4. `findPotentialMatches()` Tests

- ✅ **Finds 2-way swap cycles**
- ✅ **Finds 3-way swap cycles**
- ✅ **Finds 4-way and 5-way cycles**
- ✅ **Does not find cycles longer than maxDepth (5)**
- ✅ **Groups children by age group**
- ✅ **Returns empty array when no cycles exist**

#### 5. `createMatch()` Tests

- ✅ **Creates match group with participants**
- ✅ **Throws error when less than 2 children**
- ✅ **Throws error when children in different age groups**
- ✅ **Throws error when some children not found**
- ✅ **Sets initial status to PENDING_ACCEPTANCE**

---

## 🧪 Phase 3: Integration Tests

**File**: `backend/test/integration/auto-matching.e2e-spec.ts`  
**Estimated Time**: 3-4 hours

### Test Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auto-Matching Integration (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  // Clear database between tests
  beforeEach(async () => {
    // Clean up matches and wishlists
  });
});
```

### Test Scenarios

#### Scenario 1: 2-Way Swap Auto-Creation

```typescript
it('should automatically create match when 2-way swap is detected', async () => {
  // 1. Create test data: Two children in same age group at different KGs
  const childA = await createChild('Alice', AgeGroup.MLADJA, 'KG-A');
  const childB = await createChild('Bob', AgeGroup.MLADJA, 'KG-B');

  // 2. Alice creates wishlist: wants to go to KG-B
  await request(app.getHttpServer())
    .post('/wishlists')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      child_id: childA.id,
      target_kindergarten_id: 'KG-B',
    })
    .expect(201);

  // 3. No match should exist yet
  let matches = await getMatchesForChild(childA.id);
  expect(matches).toHaveLength(0);

  // 4. Bob creates wishlist: wants to go to KG-A
  await request(app.getHttpServer())
    .post('/wishlists')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      child_id: childB.id,
      target_kindergarten_id: 'KG-A',
    })
    .expect(201);

  // 5. Wait for async matching to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  // 6. Match should now exist for both children
  matches = await getMatchesForChild(childA.id);
  expect(matches).toHaveLength(1);
  expect(matches[0].status).toBe('PENDING_ACCEPTANCE');
  expect(matches[0].participants).toHaveLength(2);

  const participantIds = matches[0].participants.map(p => p.child_id).sort();
  expect(participantIds).toEqual([childA.id, childB.id].sort());
});
```

#### Scenario 2: 3-Way Cycle Auto-Creation

```typescript
it('should automatically create match when 3-way cycle is detected', async () => {
  // A at KG-1 wants KG-2
  // B at KG-2 wants KG-3
  // C at KG-3 wants KG-1
  // When C creates wishlist, match should be created
});
```

#### Scenario 3: Age Group Boundary

```typescript
it('should NOT create match across different age groups', async () => {
  // A (MLADJA) at KG-1 wants KG-2
  // B (SREDNJA) at KG-2 wants KG-1
  // No match should be created
});
```

#### Scenario 4: Wishlist Update Triggers Re-Check

```typescript
it('should check for matches when wishlist is updated', async () => {
  // Create wishlists that don't match
  // Update one wishlist to create matching cycle
  // Verify match is created
});
```

#### Scenario 5: Wishlist Deletion Triggers Re-Check

```typescript
it('should re-check matches when wishlist is deleted', async () => {
  // Create 3-way match
  // Delete one wishlist
  // Verify 2-way match still exists (if applicable)
});
```

#### Scenario 6: Duplicate Match Prevention

```typescript
it('should not create duplicate matches', async () => {
  // Create 2-way swap
  // Manually trigger matching again
  // Verify only one match exists
});
```

#### Scenario 7: Multiple Matches for One Child

```typescript
it('should handle child being in multiple potential matches', async () => {
  // A at KG-1 wants KG-2 and KG-3
  // B at KG-2 wants KG-1
  // C at KG-3 wants KG-1
  // Should create two separate 2-way matches
});
```

#### Scenario 8: Matching Failure Doesn't Break Wishlist

```typescript
it('should create wishlist even if matching service fails', async () => {
  // Mock MatchingService to throw error
  // Create wishlist
  // Verify wishlist is still created
  // Verify error is logged
});
```

---

## 🧪 Phase 4: Controller Tests (Optional)

**File**: `backend/src/controllers/wishlist.controller.spec.ts`  
**Estimated Time**: 1-2 hours

### Test Cases

- ✅ **POST /wishlists - creates wishlist**
- ✅ **PUT /wishlists/:id - updates wishlist**
- ✅ **DELETE /wishlists/:id - deletes wishlist**
- ✅ **GET /wishlists/child/:childId - gets wishlists by child**
- ✅ **GET /wishlists/:id - gets single wishlist**
- ✅ **All endpoints require authentication**
- ✅ **Validation errors return 400**
- ✅ **Not found errors return 404**

---

## 🛠️ Test Utilities and Helpers

### Create Helper File: `test/helpers/test-data.helper.ts`

```typescript
import { AgeGroup } from '../../src/entities/child.entity';

export class TestDataHelper {
  static createChildData(name: string, ageGroup: AgeGroup, kindergartenId: string) {
    return {
      first_name: name,
      last_name: 'Test',
      date_of_birth: new Date('2020-01-01'),
      group: ageGroup,
      current_kindergarten_id: kindergartenId,
    };
  }

  static createWishlistData(childId: string, targetKindergartenId: string) {
    return {
      child_id: childId,
      target_kindergarten_id: targetKindergartenId,
    };
  }

  static async waitForAsyncOperations(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Mock Data Factory: `test/helpers/mock-data.factory.ts`

```typescript
export const mockChild = (overrides = {}) => ({
  id: 'child-1',
  first_name: 'Test',
  last_name: 'Child',
  date_of_birth: new Date('2020-01-01'),
  group: AgeGroup.MLADJA,
  current_kindergarten_id: 'kg-1',
  wishlists: [],
  ...overrides,
});

export const mockWishlist = (overrides = {}) => ({
  id: 'wishlist-1',
  child_id: 'child-1',
  target_kindergarten_id: 'kg-2',
  created_at: new Date(),
  ...overrides,
});

export const mockKindergarten = (overrides = {}) => ({
  id: 'kg-1',
  name: 'Test Kindergarten',
  address: '123 Test St',
  ...overrides,
});
```

---

## 📊 Test Coverage Goals

### Minimum Coverage Requirements

- **Services**: 80%+ coverage
- **Controllers**: 70%+ coverage
- **Critical Paths**: 100% coverage
  - Match creation logic
  - Age group validation
  - Duplicate prevention

### Run Coverage Report

```bash
cd backend
npm run test:cov
```

---

## 🚀 Implementation Steps

### Step 1: Setup Test Infrastructure (30 minutes)

1. Install testing dependencies (if not already present):
```bash
cd backend
npm install --save-dev @nestjs/testing @types/jest @types/supertest supertest
```

2. Create test helper files:
   - `test/helpers/test-data.helper.ts`
   - `test/helpers/mock-data.factory.ts`

3. Update `jest.config.js` if needed

### Step 2: Unit Tests - WishlistService (2-3 hours)

1. Create `wishlist.service.spec.ts`
2. Write all test cases from Phase 1
3. Run tests: `npm run test wishlist.service`
4. Achieve 80%+ coverage

### Step 3: Unit Tests - MatchingService (3-4 hours)

1. Create `matching.service.spec.ts`
2. Write all test cases from Phase 2
3. Run tests: `npm run test matching.service`
4. Achieve 80%+ coverage

### Step 4: Integration Tests (3-4 hours)

1. Create `auto-matching.e2e-spec.ts`
2. Write all scenarios from Phase 3
3. Run tests: `npm run test:e2e auto-matching`
4. Verify all scenarios pass

### Step 5: Coverage & Cleanup (1 hour)

1. Run full test suite: `npm run test`
2. Run coverage: `npm run test:cov`
3. Fix any failing tests
4. Document any known issues

---

## 📝 Test Execution Commands

```bash
# Run all unit tests
npm run test

# Run specific service tests
npm run test wishlist.service
npm run test matching.service

# Run integration tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Run in watch mode (during development)
npm run test:watch

# Run only failed tests
npm run test --onlyFailures
```

---

## 🐛 Common Testing Issues & Solutions

### Issue 1: Async Operations Not Completing

**Problem**: Tests fail because auto-matching happens asynchronously  
**Solution**: Add wait helper or use Jest fake timers

```typescript
// Option 1: Wait for async operations
await TestDataHelper.waitForAsyncOperations(100);

// Option 2: Use Jest fake timers
jest.useFakeTimers();
// ... trigger async operation
jest.runAllTimers();
```

### Issue 2: Database State Pollution

**Problem**: Tests affect each other due to shared database state  
**Solution**: Clear relevant tables between tests

```typescript
beforeEach(async () => {
  await matchParticipantRepo.clear();
  await matchGroupRepo.clear();
  await wishlistRepo.clear();
});
```

### Issue 3: Repository Method Not Mocked

**Problem**: Test fails because repository method is called but not mocked  
**Solution**: Add mock implementation

```typescript
mockRepository.findOne.mockResolvedValue(mockData);
```

---

## ✅ Success Criteria

- [ ] All unit tests pass (WishlistService)
- [ ] All unit tests pass (MatchingService)
- [ ] All integration tests pass
- [ ] Test coverage > 80% for services
- [ ] All critical paths have 100% coverage
- [ ] Tests run in CI/CD pipeline
- [ ] No flaky tests (tests pass consistently)

---

## 📚 Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeORM Testing Best Practices](https://orkhan.gitbook.io/typeorm/docs/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

## 🎯 Next Steps After Testing

Once all tests are complete and passing:

1. ✅ Run full test suite in CI/CD
2. ✅ Document any edge cases discovered
3. ✅ Update README with testing instructions
4. ✅ Consider adding E2E tests for frontend
5. ✅ Set up test coverage reporting
6. ✅ Add pre-commit hooks to run tests

---

**Last Updated**: December 7, 2025  
**Status**: Ready to implement  
**Priority**: HIGH

