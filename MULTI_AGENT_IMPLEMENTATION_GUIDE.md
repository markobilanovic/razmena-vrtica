# Multi-Agent Implementation Guide
## Automatic Match Creation Feature

This document coordinates the parallel implementation of the automatic matching feature across multiple agents.

---

## 🎯 Overview

**Goal**: Implement automatic match detection and creation when wishlists are created, edited, or removed.

**Total Estimated Time**: 20-30 hours
**Recommended Agents**: 3-4 agents working in parallel

---

## 📋 Agent Assignments

### **Agent 1: Wishlist Module Infrastructure** 
**Priority**: HIGH (Other agents depend on this)  
**Estimated Time**: 4-6 hours  
**Dependencies**: None (can start immediately)

#### Tasks:
1. ✅ Create `backend/src/services/wishlist.service.ts`
   - Implement CRUD operations (create, update, delete, findByChild, findOne)
   - Add validation for child and kindergarten existence
   - Add duplicate prevention
   - **DO NOT add MatchingService integration yet** (Agent 4 will do this)

2. ✅ Create `backend/src/controllers/wishlist.controller.ts`
   - Add endpoints: POST, PUT, DELETE, GET by child, GET by id
   - Use JWT auth guard
   - Use shared types from `@repo/shared`

3. ✅ Create `backend/src/modules/wishlist.module.ts`
   - Import TypeORM entities: Wishlist, Child, Kindergarten
   - Export WishlistService for use by other modules

4. ✅ Register WishlistModule in `backend/src/app.module.ts`
   - Add to imports array

#### Acceptance Criteria:
- [x] All CRUD endpoints work independently
- [x] Validation errors are properly handled
- [x] Module is properly registered and exports service

#### Code Reference:
See **Step 1** in `AUTOMATIC_MATCHING_IMPLEMENTATION_PLAN.md` (lines 28-229)

---

### **Agent 2: MatchingService Auto-Detection** 
**Priority**: HIGH (Can work in parallel with Agent 1)  
**Estimated Time**: 4-6 hours  
**Dependencies**: None (extends existing MatchingService)

#### Tasks:
1. ✅ Add `checkAndCreateMatchesForChild(childId: string)` to `MatchingService`
   - Find all potential matches for child's age group
   - Filter matches that include this specific child
   - Check for existing matches before creating new ones
   - Create matches and return array of created MatchGroups

2. ✅ Add `findExistingMatch(childIds: string[])` private method
   - Query for matches with PENDING_ACCEPTANCE or ACTIVE_CONTACT status
   - Compare child ID arrays to find exact match duplicates
   - Return existing match or null

3. ✅ Add `checkAndCreateMatchesForAgeGroup(ageGroup: AgeGroup)` method
   - Find all potential matches in age group
   - Create all non-duplicate matches
   - Useful for batch processing

4. ✅ Export MatchingService from MatchingModule
   - Ensure service is in `exports` array of `@Module()` decorator

#### Acceptance Criteria:
- [x] Methods correctly identify valid swap cycles
- [x] Duplicate matches are prevented
- [x] Only matches within same age group are created
- [x] Error handling for edge cases

#### Code Reference:
See **Step 2** in `AUTOMATIC_MATCHING_IMPLEMENTATION_PLAN.md` (lines 232-342)

---

### **Agent 3: Shared Types & Schemas**
**Priority**: MEDIUM (Needed for full integration)  
**Estimated Time**: 1-2 hours  
**Dependencies**: None (can work in parallel)

#### Tasks:
1. ✅ Add missing schemas to `shared/src/schemas/wishlist.schema.ts`
   ```typescript
   - UpdateWishlistRequestSchema
   - UpdateWishlistRequest type
   - DeleteWishlistResponseSchema  
   - DeleteWishlistResponse type
   ```

2. ✅ Export new types from `shared/src/index.ts`
   - Add `export * from './schemas/wishlist.schema'` if not present

3. ✅ Verify all wishlist types are properly exported
   - CreateWishlistRequest
   - WishlistResponse
   - UpdateWishlistRequest
   - DeleteWishlistResponse

4. ✅ Rebuild shared package
   - Run `npm run build` in `shared/` directory
   - Verify types are available in backend/frontend

#### Acceptance Criteria:
- [ ] All schemas validate correctly
- [ ] Types are imported successfully in backend
- [ ] No TypeScript errors

#### Code Reference:
See **Step 6** in `AUTOMATIC_MATCHING_IMPLEMENTATION_PLAN.md` (lines 518-542)

---

### **Agent 4: Integration & Glue Code**
**Priority**: HIGH (Must wait for Agents 1 & 2)  
**Estimated Time**: 2-3 hours  
**Dependencies**: Requires Agent 1 and Agent 2 to complete

⚠️ **WAIT** for Agents 1 and 2 to finish before starting

#### Tasks:
1. ✅ Update `WishlistService` to inject `MatchingService`
   - Add constructor parameter: `private matchingService: MatchingService`

2. ✅ Add auto-matching calls in `WishlistService.create()`
   - After saving wishlist, call `checkAndCreateMatchesForChild()`
   - Use `.catch()` to prevent errors from breaking wishlist creation
   - Add console logging

3. ✅ Add auto-matching calls in `WishlistService.update()`
   - After saving wishlist, call `checkAndCreateMatchesForChild()`
   - Same error handling as create

4. ✅ Add auto-matching calls in `WishlistService.delete()`
   - After deleting wishlist, call `checkAndCreateMatchesForChild()`
   - Check if existing matches need invalidation

5. ✅ Update `WishlistModule` to import `MatchingModule`
   - Add to imports array

#### Acceptance Criteria:
- [ ] Matches are automatically created on wishlist create
- [ ] Matches are automatically updated on wishlist update
- [ ] Wishlist operations don't fail if matching fails
- [ ] Proper error logging in place

#### Code Reference:
See **Step 3** in `AUTOMATIC_MATCHING_IMPLEMENTATION_PLAN.md` (lines 345-443)

---

### **Agent 5: Testing & Validation** (Optional but Recommended)
**Priority**: MEDIUM (After core implementation)  
**Estimated Time**: 4-6 hours  
**Dependencies**: Requires all other agents to complete

⚠️ **WAIT** for Agents 1, 2, 3, and 4 to finish

#### Tasks:
1. ✅ Write unit tests for `WishlistService`
   - Test create, update, delete operations
   - Test validation errors
   - Test duplicate prevention

2. ✅ Write unit tests for `MatchingService` auto-detection
   - Test `checkAndCreateMatchesForChild()`
   - Test `findExistingMatch()` duplicate prevention
   - Test age group isolation

3. ✅ Write integration tests
   - Test 2-way swap auto-creation
   - Test 3-way cycle auto-creation
   - Test age group boundaries
   - Test wishlist deletion handling

4. ✅ Manual testing with seed data
   - Run `npm run seed`
   - Use Postman/Thunder Client to test endpoints
   - Verify matches in database

5. ✅ Add logging and monitoring
   - Console logs for match creation
   - Error logging for failed matches

#### Acceptance Criteria:
- [ ] All test scenarios pass
- [ ] Edge cases are handled
- [ ] Logging is in place

#### Code Reference:
See **Testing Strategy** in `AUTOMATIC_MATCHING_IMPLEMENTATION_PLAN.md` (lines 545-577)

---

## 🔄 Recommended Workflow

### For 3 Agents (Optimal):

**Phase 1 - Parallel Work (6-8 hours)**
```
Agent 1: Wishlist Infrastructure → Tasks 1-4
Agent 2: MatchingService Enhancement → Tasks 1-4  
Agent 3: Shared Types → Tasks 1-4
```

**Phase 2 - Integration (3-4 hours)**
```
Agent 1 or 3: Integration (Agent 4 tasks)
```

**Phase 3 - Testing (4-6 hours)**
```
Any Agent: Testing & Validation (Agent 5 tasks)
```

### For 4 Agents:

**Phase 1 - Parallel Work (6-8 hours)**
```
Agent 1: Wishlist Infrastructure
Agent 2: MatchingService Enhancement
Agent 3: Shared Types
Agent 4: Stand by (or work on documentation)
```

**Phase 2 - Integration & Testing (6-8 hours)**
```
Agent 4: Integration (wait for 1 & 2)
Agent 3: Start testing preparation
```

**Phase 3 - Final Testing (4-6 hours)**
```
Agent 3 or 5: Complete all testing
```

### For 2 Agents:

**Phase 1 (6-8 hours)**
```
Agent 1: Wishlist Infrastructure + Shared Types
Agent 2: MatchingService Enhancement
```

**Phase 2 (5-7 hours)**
```
Agent 1: Integration
Agent 2: Testing
```

---

## 🚨 Critical Dependencies

**Must Complete BEFORE Integration:**
1. ✅ Agent 1: WishlistService must exist and export from module
2. ✅ Agent 2: MatchingService must export from MatchingModule
3. ✅ Agent 2: All three auto-detection methods must be implemented

**Must Complete BEFORE Testing:**
1. ✅ Agent 4: Integration must be complete
2. ✅ All agents: No TypeScript compilation errors

---

## 📝 Communication Protocol

### When Starting:
- [ ] Announce which agent number you are
- [ ] Confirm which tasks you're taking
- [ ] Note any deviations from the plan

### When Blocked:
- [ ] Report dependency issues immediately
- [ ] Suggest workarounds or mock implementations
- [ ] Update status so other agents know

### When Complete:
- [ ] Mark all tasks as complete
- [ ] Report any issues encountered
- [ ] Note any changes from original spec
- [ ] Run `npm run build` and confirm no errors

---

## ✅ Testing Checklist (For Agent 5 or final validation)

### Functional Tests:
- [ ] Can create wishlist via API
- [ ] Can update wishlist via API
- [ ] Can delete wishlist via API
- [ ] Can get wishlists by child

### Auto-Matching Tests:
- [ ] 2-way swap creates match automatically
- [ ] 3-way cycle creates match automatically
- [ ] Different age groups don't match
- [ ] Duplicate matches are prevented
- [ ] Wishlist deletion triggers re-check

### Error Handling:
- [ ] Invalid child ID returns error
- [ ] Invalid kindergarten ID returns error
- [ ] Duplicate wishlist returns error
- [ ] Matching errors don't break wishlist operations

---

## 🔍 Debugging Tips

### Common Issues:
1. **"MatchingService not found"**: Check that MatchingModule exports the service
2. **"Circular dependency"**: Make sure WishlistModule imports MatchingModule, not vice versa
3. **"No matches created"**: Check age groups are identical and wishlists form complete cycle
4. **"Duplicate matches"**: Verify `findExistingMatch()` is being called

### Verification Commands:
```bash
# Check if services are building
cd backend
npm run build

# Check if shared types are available
cd shared
npm run build

# Run the application
npm run dev

# Check database for matches
# (Use database client to query match_groups table)
```

---

## 📊 Progress Tracking

Update this section as work progresses:

| Agent | Status | Tasks Complete | Notes |
|-------|--------|----------------|-------|
| 1 - Wishlist Infrastructure | ⏳ Not Started | 0/4 | |
| 2 - Matching Auto-Detection | ⏳ Not Started | 0/4 | |
| 3 - Shared Types | ⏳ Not Started | 0/4 | |
| 4 - Integration | 🔒 Blocked | 0/5 | Waiting on 1, 2 |
| 5 - Testing | 🔒 Blocked | 0/5 | Waiting on 1-4 |

**Legend:**
- ⏳ Not Started
- 🟡 In Progress
- ✅ Complete
- 🔒 Blocked (waiting on dependencies)
- ⚠️ Issues/Blockers

---

## 📚 Key Files Reference

### Files to Create:
- `backend/src/services/wishlist.service.ts` (Agent 1)
- `backend/src/controllers/wishlist.controller.ts` (Agent 1)
- `backend/src/modules/wishlist.module.ts` (Agent 1)

### Files to Modify:
- `backend/src/app.module.ts` (Agent 1 - add import)
- `backend/src/services/matching.service.ts` (Agent 2 - add methods)
- `backend/src/modules/matching.module.ts` (Agent 2 - ensure export)
- `shared/src/schemas/wishlist.schema.ts` (Agent 3 - add schemas)
- `shared/src/index.ts` (Agent 3 - add exports)

### Files to Reference (Don't Modify):
- `backend/src/entities/wishlist.entity.ts`
- `backend/src/entities/child.entity.ts`
- `backend/src/entities/match.entity.ts`
- `AUTOMATIC_MATCHING_IMPLEMENTATION_PLAN.md` (detailed specs)

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP):
- ✅ Wishlist CRUD endpoints work
- ✅ Matches are automatically created for 2-way swaps
- ✅ Matches are automatically created for 3-way swaps
- ✅ Age group validation works
- ✅ Duplicate matches are prevented

### Nice to Have:
- ✅ Comprehensive test coverage
- ✅ Detailed logging
- ✅ Error handling for all edge cases
- ✅ Performance optimization

---

## 📞 Questions & Support

If you encounter issues:
1. Check the detailed plan: `AUTOMATIC_MATCHING_IMPLEMENTATION_PLAN.md`
2. Review existing similar code (e.g., `matching.service.ts`, `kindergarten.service.ts`)
3. Check TypeORM documentation for query issues
4. Report blockers in the Progress Tracking section

---

## 🚀 Ready to Start?

1. Choose your agent role (1-5)
2. Read your specific section above
3. Check dependencies are met
4. Start implementing!
5. Update progress tracker as you go

Good luck! 🎉

