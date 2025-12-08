# Age Group Implementation for Child Matching

## Overview

This implementation adds age group functionality to the Child entity, ensuring that children can only be matched with others in the same age group.

## Age Groups

The following age groups are defined:

| Enum Value        | Name            | Age Range   |
| ----------------- | --------------- | ----------- |
| `MLADJA_JASLENA`  | Mladja jaslena  | 0.5y - 1.5y |
| `STARIJA_JASLENA` | Starija jaslena | 1.5y - 2.5y |
| `MLADJA`          | Mladja          | 2.5y - 3.5y |
| `SREDNJA`         | Srednja         | 3.5y - 4.5y |
| `STARIJA`         | Starija         | 4.5y - 5.5y |
| `NAJSTARIJA`      | Najstarija      | 5.5y - 6.5y |

## Files Created/Modified

### Entities

- **Modified**: `src/entities/child.entity.ts`
  - Added `AgeGroup` enum
  - Added `group` column to Child entity

### Utilities

- **Created**: `src/utils/age-group.util.ts`
  - `calculateAgeGroup(birthDate, referenceDate)` - Calculates age group from birth date
  - `getAgeInYears(birthDate, referenceDate)` - Helper to get age in years

### Services

- **Created**: `src/services/matching.service.ts`
  - `findPotentialMatches(ageGroup?)` - Find potential matches, optionally filtered by age group
  - `createMatch(childIds)` - Create a match with age group validation
  - `getMatchesByAgeGroup(ageGroup)` - Get all matches for a specific age group
  - `validateMatchAgeGroup(matchId)` - Validate a match contains only same age group children

### Modules & Controllers

- **Created**: `src/modules/matching.module.ts`
- **Created**: `src/controllers/matching.controller.ts`
- **Modified**: `src/app.module.ts` - Added MatchingModule

### Scripts

- **Created**: `src/scripts/update-child-age-groups.ts` - Script to populate age groups for existing children
- **Modified**: `package.json` - Added `migrate:age-groups` script

### Migrations

- **Created**: `src/migrations/1733514134000-AddGroupToChild.ts` - Database migration for the group column

## Setup Instructions

### 1. Database Schema Update

Since your app uses `synchronize: true`, the schema will be automatically updated when you restart the backend. The `group` column will be added to the `child` table.

**Option A: Automatic (Recommended for Development)**

```bash
# Restart the backend server
# The running server needs to be stopped and restarted
# TypeORM will automatically add the 'group' column and create the enum type
```

**Option B: Manual Migration (Recommended for Production)**
To use the migration file instead of auto-sync, you would need to:

1. Set `synchronize: false` in `app.module.ts`
2. Configure TypeORM migrations
3. Run the migration

### 2. Populate Age Groups for Existing Children

After the database schema is updated, run this command to calculate and set the age group for all existing children based on their birth dates:

```bash
npm run migrate:age-groups
```

This script will:

- Connect to the database
- Fetch all children
- Calculate their age group based on birth date
- Update each child's `group` field
- Display a summary of updates

## API Endpoints

### Get Potential Matches

```http
GET /matching/potential?ageGroup=MLADJA
```

Returns potential matches, optionally filtered by age group.

### Create a Match

```http
POST /matching/create
Content-Type: application/json

{
  "childIds": ["uuid1", "uuid2"]
}
```

Creates a match. Will throw an error if children are not in the same age group.

### Get Matches by Age Group

```http
GET /matching/by-age-group/SREDNJA
```

Returns all matches for a specific age group.

### Validate a Match

```http
GET /matching/validate/:matchId
```

Validates that a match only contains children from the same age group.

## Matching Logic

The matching service implements several key constraints:

1. **Age Group Validation**: Children can ONLY be matched with others in the same age group
2. **Separation by Age Group**: The algorithm processes each age group separately
3. **Direct Swaps**: Currently supports 2-way swaps (child A wants child B's spot, child B wants child A's spot)
4. **Future Enhancement**: The code has a placeholder for circular matches (3+ way swaps) which would also respect age group constraints

## Usage Example

```typescript
// Calculate age group from birth date
import { calculateAgeGroup } from './utils/age-group.util';

const birthDate = new Date('2020-03-15');
const ageGroup = calculateAgeGroup(birthDate);
// Returns: AgeGroup.STARIJA (4.5y - 5.5y) if checked in 2024

// Create a child with age group
const child = new Child();
child.name = 'Marko';
child.birth_date = new Date('2020-03-15');
child.group = calculateAgeGroup(child.birth_date);

// The matching service will automatically validate age groups
await matchingService.createMatch([child1.id, child2.id]);
// Throws error if children are not in the same age group
```

## Important Notes

1. **Age Group is Required for Matching**: Children without a `group` value cannot be matched
2. **Automatic Calculation**: You should calculate and set the age group when creating a new child
3. **Regular Updates**: Consider running a cron job to update age groups as children age into new groups
4. **Validation**: All matching operations validate age group constraints and will throw errors if violated

## Testing

To test the age group functionality:

1. Create test children in different age groups
2. Try to create matches with children in the same age group (should succeed)
3. Try to create matches with children in different age groups (should fail)
4. Check that potential matches are correctly separated by age group

## Troubleshooting

### Column does not exist error

- **Solution**: Restart the backend server to trigger TypeORM synchronization
- The `group` column will be automatically created

### Children not getting matched

- Verify that all children have their `group` field populated
- Run `npm run migrate:age-groups` to populate existing children
- Check that children are in the same age group

### Age calculation seems wrong

- The age is calculated in months for precision
- Check the `calculateAgeGroup` function in `src/utils/age-group.util.ts`
- Age ranges are inclusive at the lower bound and exclusive at the upper bound
