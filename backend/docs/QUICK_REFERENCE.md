# Age Groups Quick Reference

## Age Group Enum Values

```typescript
enum AgeGroup {
    MLADJA_JASLENA = 'MLADJA_JASLENA',      // 0.5y - 1.5y (6-18 months)
    STARIJA_JASLENA = 'STARIJA_JASLENA',    // 1.5y - 2.5y (18-30 months)
    MLADJA = 'MLADJA',                      // 2.5y - 3.5y (30-42 months)
    SREDNJA = 'SREDNJA',                    // 3.5y - 4.5y (42-54 months)
    STARIJA = 'STARIJA',                    // 4.5y - 5.5y (54-66 months)
    NAJSTARIJA = 'NAJSTARIJA',              // 5.5y - 6.5y (66-78 months)
}
```

## Quick Commands

```bash
# Restart backend to create the 'group' column
cd backend && npm run start

# Populate age groups for existing children (run AFTER backend restart)
npm run migrate:age-groups
```

## Common Code Patterns

### Creating a child
```typescript
import { calculateAgeGroup } from './utils/age-group.util';

const child = new Child();
child.name = 'Ana';
child.birth_date = new Date('2019-06-15');
child.group = calculateAgeGroup(child.birth_date); // Auto-assigns age group
```

### Finding matches (only same age group)
```typescript
// All age groups
const matches = await matchingService.findPotentialMatches();

// Specific age group only
const starijaMatches = await matchingService.findPotentialMatches(AgeGroup.STARIJA);
```

### Creating a match (with validation)
```typescript
try {
    const match = await matchingService.createMatch([child1.id, child2.id]);
    // Success - children are in the same age group
} catch (error) {
    // Error - children are in different age groups
    console.error(error.message);
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matching/potential?ageGroup=SREDNJA` | Get potential matches (optional filter) |
| POST | `/matching/create` | Create match (body: `{ childIds: ['id1', 'id2'] }`) |
| GET | `/matching/by-age-group/:ageGroup` | Get all matches for age group |
| GET | `/matching/validate/:matchId` | Validate match age group |

## Key Rules

✅ **DO:**
- Children can only match within the same age group
- Always calculate age group when creating a child
- Recalculate age groups periodically as children age

❌ **DON'T:**
- Try to match children from different age groups
- Leave the `group` field empty/null
- Manually set age group without using `calculateAgeGroup()`

## Age Calculation Logic

- Age is calculated in **months** for precision
- Ranges are **inclusive** at lower bound, **exclusive** at upper bound
- Example: STARIJA is [54, 66) months → 54 ≤ age < 66

## Files

| File | Purpose |
|------|---------|
| `entities/child.entity.ts` | AgeGroup enum + group field |
| `utils/age-group.util.ts` | Age calculation functions |
| `services/matching.service.ts` | Matching logic with validation |
| `services/child.service.ts` | Child CRUD with auto age group |
| `controllers/matching.controller.ts` | REST API endpoints |
| `scripts/update-child-age-groups.ts` | Batch update script |

## Documentation

- Full guide: `docs/AGE_GROUPS.md`
- Implementation summary: `IMPLEMENTATION_SUMMARY.md`
- Examples: `src/examples/age-group-matching.examples.ts`
