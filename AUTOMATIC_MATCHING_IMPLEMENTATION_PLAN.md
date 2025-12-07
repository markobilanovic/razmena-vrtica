# Automatic Match Creation Implementation Plan

## Overview
Implement automatic match detection and creation when wishlists are created, edited, or removed. The system should automatically find and create matches when children's preferences form a valid swap cycle.

---

## Current State

### What Exists
- ✅ Match finding algorithm (`MatchingService.findPotentialMatches()`)
- ✅ Match creation logic (`MatchingService.createMatch()`)
- ✅ Match entity with `PENDING_ACCEPTANCE` status
- ✅ Wishlist entity
- ✅ Child, Kindergarten entities with age group tracking
- ❌ **Missing**: Wishlist service/controller (no CRUD operations yet!)
- ❌ **Missing**: Automatic match triggering

### Current Workflow
1. User creates/edits wishlist (currently no API endpoint exists)
2. Admin manually calls `POST /matching/potential` to see potential matches
3. Admin manually calls `POST /matching/create` with child IDs

---

## Implementation Steps

### Step 1: Create Wishlist Module Infrastructure

#### 1.1 Create `wishlist.service.ts`
**Location**: `backend/src/services/wishlist.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';

export interface CreateWishlistDto {
  child_id: string;
  target_kindergarten_id: string;
}

export interface UpdateWishlistDto {
  target_kindergarten_id?: string;
}

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(Kindergarten)
    private kindergartenRepository: Repository<Kindergarten>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    // Validate child exists
    const child = await this.childRepository.findOne({
      where: { id: createWishlistDto.child_id },
    });
    if (!child) {
      throw new Error('Child not found');
    }

    // Validate kindergarten exists
    const kindergarten = await this.kindergartenRepository.findOne({
      where: { id: createWishlistDto.target_kindergarten_id },
    });
    if (!kindergarten) {
      throw new Error('Target kindergarten not found');
    }

    // Prevent duplicate wishlists
    const existing = await this.wishlistRepository.findOne({
      where: {
        child_id: createWishlistDto.child_id,
        target_kindergarten_id: createWishlistDto.target_kindergarten_id,
      },
    });
    if (existing) {
      throw new Error('Wishlist already exists');
    }

    // Create wishlist
    const wishlist = this.wishlistRepository.create(createWishlistDto);
    return this.wishlistRepository.save(wishlist);
  }

  async update(id: string, updateWishlistDto: UpdateWishlistDto): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    if (updateWishlistDto.target_kindergarten_id) {
      const kindergarten = await this.kindergartenRepository.findOne({
        where: { id: updateWishlistDto.target_kindergarten_id },
      });
      if (!kindergarten) {
        throw new Error('Target kindergarten not found');
      }
    }

    Object.assign(wishlist, updateWishlistDto);
    return this.wishlistRepository.save(wishlist);
  }

  async delete(id: string): Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }
    await this.wishlistRepository.remove(wishlist);
  }

  async findByChild(childId: string): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { child_id: childId },
      relations: ['target_kindergarten'],
    });
  }

  async findOne(id: string): Promise<Wishlist | null> {
    return this.wishlistRepository.findOne({
      where: { id },
      relations: ['child', 'target_kindergarten'],
    });
  }
}
```

#### 1.2 Create `wishlist.controller.ts`
**Location**: `backend/src/controllers/wishlist.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from '../services/wishlist.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { CreateWishlistRequest, WishlistResponse } from '@repo/shared';

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async create(@Body() body: CreateWishlistRequest): Promise<WishlistResponse> {
    return this.wishlistService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateWishlistRequest>,
  ): Promise<WishlistResponse> {
    return this.wishlistService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.wishlistService.delete(id);
    return { success: true };
  }

  @Get('child/:childId')
  async getByChild(@Param('childId') childId: string): Promise<WishlistResponse[]> {
    return this.wishlistService.findByChild(childId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<WishlistResponse> {
    const wishlist = await this.wishlistService.findOne(id);
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }
    return wishlist;
  }
}
```

#### 1.3 Create `wishlist.module.ts`
**Location**: `backend/src/modules/wishlist.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistService } from '../services/wishlist.service';
import { WishlistController } from '../controllers/wishlist.controller';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Child, Kindergarten])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
```

#### 1.4 Register WishlistModule in `app.module.ts`

```typescript
// Add to imports array
import { WishlistModule } from './modules/wishlist.module';

@Module({
  imports: [
    // ... existing imports
    WishlistModule,
  ],
})
```

---

### Step 2: Implement Automatic Match Detection

#### 2.1 Enhance `MatchingService` with Auto-Detection

**Location**: `backend/src/services/matching.service.ts`

Add these methods:

```typescript
/**
 * Check for and automatically create matches for a specific child
 * Called after wishlist changes for that child
 * 
 * @param childId - The child whose wishlists changed
 * @returns Array of created matches (could be multiple if child is in multiple cycles)
 */
async checkAndCreateMatchesForChild(childId: string): Promise<MatchGroup[]> {
  const child = await this.childRepository.findOne({
    where: { id: childId },
    relations: ['current_kindergarten', 'wishlists'],
  });

  if (!child || !child.group) {
    return [];
  }

  // Find all potential matches in this child's age group
  const potentialMatches = await this.findPotentialMatches(child.group);

  const createdMatches: MatchGroup[] = [];

  // Check each potential match to see if this child is involved
  for (const potentialMatch of potentialMatches) {
    const childIds = potentialMatch.children.map((c) => c.id);
    
    // Only create match if our child is part of it
    if (childIds.includes(childId)) {
      // Check if a match with these exact children already exists
      const existingMatch = await this.findExistingMatch(childIds);
      
      if (!existingMatch) {
        try {
          const newMatch = await this.createMatch(childIds);
          createdMatches.push(newMatch);
        } catch (error) {
          console.error(`Failed to create match for children ${childIds.join(', ')}:`, error);
        }
      }
    }
  }

  return createdMatches;
}

/**
 * Check if a match with the exact same set of children already exists
 * Used to prevent duplicate matches
 */
private async findExistingMatch(childIds: string[]): Promise<MatchGroup | null> {
  // Get all pending or active matches
  const matches = await this.matchGroupRepository
    .createQueryBuilder('matchGroup')
    .leftJoinAndSelect('matchGroup.participants', 'participants')
    .where('matchGroup.status IN (:...statuses)', {
      statuses: [MatchStatus.PENDING_ACCEPTANCE, MatchStatus.ACTIVE_CONTACT],
    })
    .getMany();

  // Check each match to see if it has the exact same children
  for (const match of matches) {
    const matchChildIds = match.participants.map((p) => p.child_id).sort();
    const sortedInputIds = [...childIds].sort();

    if (
      matchChildIds.length === sortedInputIds.length &&
      matchChildIds.every((id, index) => id === sortedInputIds[index])
    ) {
      return match;
    }
  }

  return null;
}

/**
 * Check for matches across an entire age group
 * Useful for batch processing or when multiple wishlists change
 */
async checkAndCreateMatchesForAgeGroup(ageGroup: AgeGroup): Promise<MatchGroup[]> {
  const potentialMatches = await this.findPotentialMatches(ageGroup);
  const createdMatches: MatchGroup[] = [];

  for (const potentialMatch of potentialMatches) {
    const childIds = potentialMatch.children.map((c) => c.id);
    
    // Check if match already exists
    const existingMatch = await this.findExistingMatch(childIds);
    
    if (!existingMatch) {
      try {
        const newMatch = await this.createMatch(childIds);
        createdMatches.push(newMatch);
      } catch (error) {
        console.error(`Failed to create match for children ${childIds.join(', ')}:`, error);
      }
    }
  }

  return createdMatches;
}
```

---

### Step 3: Integrate Auto-Matching with Wishlist Operations

#### 3.1 Update `WishlistService` to trigger matching

Inject `MatchingService` and call auto-matching after operations:

```typescript
import { MatchingService } from './matching.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(Kindergarten)
    private kindergartenRepository: Repository<Kindergarten>,
    private matchingService: MatchingService, // INJECT THIS
  ) {}

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    // ... existing validation and creation code ...
    
    const wishlist = this.wishlistRepository.create(createWishlistDto);
    const savedWishlist = await this.wishlistRepository.save(wishlist);

    // AUTO-MATCH: Check for new matches after creating wishlist
    this.matchingService
      .checkAndCreateMatchesForChild(createWishlistDto.child_id)
      .catch((error) => {
        console.error('Error auto-creating matches:', error);
      });

    return savedWishlist;
  }

  async update(id: string, updateWishlistDto: UpdateWishlistDto): Promise<Wishlist> {
    // ... existing update code ...
    
    Object.assign(wishlist, updateWishlistDto);
    const savedWishlist = await this.wishlistRepository.save(wishlist);

    // AUTO-MATCH: Check for new matches after updating wishlist
    this.matchingService
      .checkAndCreateMatchesForChild(wishlist.child_id)
      .catch((error) => {
        console.error('Error auto-creating matches:', error);
      });

    return savedWishlist;
  }

  async delete(id: string): Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    const childId = wishlist.child_id;
    await this.wishlistRepository.remove(wishlist);

    // AUTO-MATCH: Check if any existing matches need to be invalidated
    // or if new matches are now possible after removing this wishlist
    this.matchingService
      .checkAndCreateMatchesForChild(childId)
      .catch((error) => {
        console.error('Error auto-creating matches:', error);
      });
  }

  // ... rest of service methods
}
```

#### 3.2 Update `WishlistModule` to import `MatchingModule`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistService } from '../services/wishlist.service';
import { WishlistController } from '../controllers/wishlist.controller';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import { MatchingModule } from './matching.module'; // ADD THIS

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, Child, Kindergarten]),
    MatchingModule, // ADD THIS
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
```

---

### Step 4: Add Configuration Options

#### 4.1 Create a configuration for auto-matching behavior

**Location**: `backend/src/services/matching.config.ts`

```typescript
export interface MatchingConfig {
  autoCreateMatches: boolean;
  minCycleSize: number;
  maxCycleSize: number;
  requireAllParticipantsToAccept: boolean;
}

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  autoCreateMatches: true,
  minCycleSize: 2,
  maxCycleSize: 5,
  requireAllParticipantsToAccept: true,
};
```

This allows you to toggle auto-matching on/off via environment variables or configuration.

---

### Step 5: Add Notifications (Optional but Recommended)

#### 5.1 Create notification service

When matches are automatically created, notify parents:

```typescript
// backend/src/services/notification.service.ts

@Injectable()
export class NotificationService {
  async notifyMatchCreated(match: MatchGroup): Promise<void> {
    // Load match with all participants
    const fullMatch = await this.matchGroupRepository.findOne({
      where: { id: match.id },
      relations: ['participants', 'participants.child', 'participants.child.parent'],
    });

    if (!fullMatch) return;

    // Send email/push notification to all parents
    for (const participant of fullMatch.participants) {
      const parent = participant.child.parent;
      // TODO: Send notification to parent
      console.log(`Notify ${parent.email}: New match found for ${participant.child.name}`);
    }
  }
}
```

#### 5.2 Call notification service after match creation

```typescript
// In WishlistService.create():
const matches = await this.matchingService.checkAndCreateMatchesForChild(
  createWishlistDto.child_id
);

for (const match of matches) {
  await this.notificationService.notifyMatchCreated(match);
}
```

---

### Step 6: Add Shared Types (if needed)

Update shared schemas for wishlist operations:

**Location**: `shared/src/schemas/wishlist.schema.ts`

Already exists, but ensure you have:
```typescript
export const UpdateWishlistRequestSchema = z.object({
  target_kindergarten_id: z.string().uuid().optional(),
});

export type UpdateWishlistRequest = z.infer<typeof UpdateWishlistRequestSchema>;

export const DeleteWishlistResponseSchema = z.object({
  success: z.boolean(),
});

export type DeleteWishlistResponse = z.infer<typeof DeleteWishlistResponseSchema>;
```

Add to `shared/src/index.ts`:
```typescript
export * from './schemas/wishlist.schema';
```

---

## Testing Strategy

### Unit Tests
1. Test `WishlistService.create()` triggers match detection
2. Test `MatchingService.checkAndCreateMatchesForChild()` finds valid cycles
3. Test `findExistingMatch()` prevents duplicates

### Integration Tests
1. Create wishlists that form a 2-way swap → verify match auto-created
2. Create wishlists that form a 3-way swap → verify match auto-created
3. Update wishlist → verify new matches are detected
4. Delete wishlist → verify match is invalidated if needed
5. Verify matches are NOT created across different age groups

### End-to-End Test Scenarios

#### Scenario 1: Simple 2-way swap
1. Alice (age group MLADJA) at KG-A wants to go to KG-B
2. Bob (age group MLADJA) at KG-B wants to go to KG-A
3. When Bob creates his wishlist → Match automatically created with status PENDING_ACCEPTANCE

#### Scenario 2: 3-way cycle
1. Alice at KG-A wants KG-B
2. Bob at KG-B wants KG-C
3. Charlie at KG-C wants KG-A
4. When Charlie creates wishlist → Match automatically created for all three

#### Scenario 3: Age group boundary
1. Alice (MLADJA) at KG-A wants KG-B
2. Bob (SREDNJA) at KG-B wants KG-A
3. No match created (different age groups)

---

## Rollout Plan

### Phase 1: Foundation (Current)
- ✅ Implement wishlist CRUD operations
- ✅ Add auto-match detection logic
- ✅ Test with seed data

### Phase 2: Safety & Monitoring
- Add logging for all auto-created matches
- Add metrics/analytics dashboard
- Add admin endpoint to disable auto-matching if needed

### Phase 3: User Experience
- Add notification system
- Add UI to show "Match found!" immediately after wishlist creation
- Add match acceptance workflow

### Phase 4: Optimization
- Add debouncing (don't run matching on every single change)
- Add batch processing for multiple wishlist changes
- Add caching for frequently accessed data

---

## Edge Cases to Handle

1. **Duplicate Prevention**: Don't create the same match twice
   - ✅ Solved by `findExistingMatch()`

2. **Stale Matches**: What if a wishlist is deleted after match is created?
   - Option A: Invalidate/cancel the match
   - Option B: Keep match but show warning
   - Recommendation: Add `validateMatchStillValid()` method

3. **Partial Cycles**: Child A→B, B→C, C→? (incomplete)
   - No match created until cycle completes

4. **Multiple Matches**: Child could be in multiple potential cycles
   - Create all valid matches, let users choose

5. **Age Group Changes**: Child ages into new group
   - Invalidate old matches, trigger re-matching

6. **Performance**: Many users updating wishlists simultaneously
   - Use job queue (BullMQ) instead of immediate execution
   - Debounce matching by 5-10 seconds

---

## Implementation Checklist

### Backend Changes
- [ ] Create `wishlist.service.ts`
- [ ] Create `wishlist.controller.ts`
- [ ] Create `wishlist.module.ts`
- [ ] Register `WishlistModule` in `app.module.ts`
- [ ] Add `checkAndCreateMatchesForChild()` to `MatchingService`
- [ ] Add `findExistingMatch()` to `MatchingService`
- [ ] Add `checkAndCreateMatchesForAgeGroup()` to `MatchingService`
- [ ] Inject `MatchingService` into `WishlistService`
- [ ] Call auto-matching in `create()`, `update()`, `delete()`
- [ ] Add shared types for wishlist operations
- [ ] Add logging for auto-created matches
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend Changes (Separate Task)
- [ ] Create wishlist management UI
- [ ] Add "Add to Wishlist" button on kindergarten cards
- [ ] Show "Match Found!" notification when match is created
- [ ] Update match list to show auto-created matches
- [ ] Add match acceptance/rejection UI

### Testing
- [ ] Test 2-way swap auto-creation
- [ ] Test 3-way+ cycle auto-creation
- [ ] Test age group validation
- [ ] Test duplicate prevention
- [ ] Test wishlist deletion handling
- [ ] Load test with many simultaneous updates

### Documentation
- [ ] Update API documentation
- [ ] Add inline code comments
- [ ] Update README with auto-matching feature
- [ ] Create admin guide for monitoring

---

## Performance Considerations

### Current Algorithm Complexity
- Finding cycles: O(n * d^maxDepth) where n = number of children, d = average wishlist size
- For 100 children with 3 wishes each: reasonable performance
- For 1000+ children: may need optimization

### Optimization Strategies if Needed
1. **Caching**: Cache potential matches for each age group
2. **Incremental Updates**: Only re-check affected cycles, not entire age group
3. **Async Processing**: Use job queue (BullMQ) for matching
4. **Debouncing**: Wait 5-10 seconds before running match detection
5. **Indexing**: Add database indexes on frequently queried fields

---

## Alternative Approaches

### Approach 1: Immediate Execution (Recommended for MVP)
✅ Pros: Simple, immediate feedback to users
❌ Cons: Could be slow if many users update simultaneously

### Approach 2: Job Queue with BullMQ
✅ Pros: Better performance, can handle load spikes
✅ Pros: Can retry failed match attempts
❌ Cons: More complex, requires Redis

### Approach 3: Scheduled Batch Processing
✅ Pros: Most efficient, easy to optimize
❌ Cons: Delayed feedback, users don't see matches immediately

**Recommendation**: Start with Approach 1, migrate to Approach 2 if performance issues arise.

---

## Security Considerations

1. **Authorization**: Only allow parents to create/edit wishlists for their own children
   - Add `@Req()` decorator to get authenticated user
   - Verify `child.parent_id === user.id` before operations

2. **Rate Limiting**: Prevent wishlist spam
   - Add rate limiting middleware (e.g., 10 wishlist changes per minute)

3. **Input Validation**: Validate all inputs with Zod schemas
   - Already defined in `shared/src/schemas/wishlist.schema.ts`

4. **Data Integrity**: Ensure matches are always valid
   - Always validate age groups before creating matches
   - Add database constraints where possible

---

## Success Metrics

Track these metrics to measure success:

1. **Automatic Match Rate**: % of matches created automatically vs manually
2. **Match Creation Time**: Time from wishlist change to match creation
3. **Match Acceptance Rate**: % of auto-created matches that get accepted
4. **False Positives**: Matches created but then cancelled
5. **User Satisfaction**: Survey users about auto-matching feature

---

## Future Enhancements

1. **Smart Matching**: Prioritize matches based on distance, ratings, etc.
2. **Partial Matches**: Suggest "almost matches" that need one more person
3. **Match Prediction**: "If you add KG-X to your wishlist, you might get a match"
4. **Group Preferences**: Allow parents to prefer smaller or larger swap groups
5. **Notification Preferences**: Let users choose how/when to be notified

---

## Questions for Product Owner

1. Should matches be created immediately or after a short delay?
2. If a child is in multiple potential matches, create all or just the best one?
3. Should we limit the number of pending matches a child can be in?
4. What happens if a parent rejects a match? Try to find another?
5. Should we notify all participants when a match is found, or only when all accept?

---

## Timeline Estimate

- **Wishlist CRUD**: 4-6 hours
- **Auto-matching logic**: 4-6 hours
- **Integration & testing**: 4-6 hours
- **Frontend changes**: 8-12 hours
- **Total**: ~20-30 hours

---

## Notes for Implementation Agent

### Start with these files in order:
1. `backend/src/services/wishlist.service.ts`
2. `backend/src/controllers/wishlist.controller.ts`
3. `backend/src/modules/wishlist.module.ts`
4. Update `backend/src/app.module.ts`
5. Update `backend/src/services/matching.service.ts` (add auto-match methods)
6. Update `shared/src/schemas/wishlist.schema.ts` (add update/delete schemas)
7. Update `shared/src/index.ts` (export wishlist schemas)

### Testing approach:
1. Use existing seed data to test
2. Run `npm run seed` to populate database
3. Use Postman/Thunder Client to test wishlist endpoints
4. Verify matches are auto-created in database

### Common pitfalls to avoid:
- Don't forget to inject `MatchingService` into `WishlistService`
- Don't forget to export `MatchingService` from `MatchingModule`
- Remember to use `.catch()` on async match creation to prevent errors from breaking wishlist operations
- Always validate age groups before creating matches
- Don't create duplicate matches - use `findExistingMatch()`

### Debugging tips:
- Add console.log statements in auto-match methods
- Check database for created matches after wishlist operations
- Use Postgres query logs to see SQL queries
- Test with different age groups to ensure isolation

---

Good luck with implementation! 🚀

