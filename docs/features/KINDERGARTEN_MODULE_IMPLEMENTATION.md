# Kindergarten Module Implementation

## Overview

This document describes the implementation of a dedicated Kindergarten module to decouple kindergarten data fetching from the User service.

## Problem

Previously, the wishlist display in the dashboard showed only kindergarten IDs instead of names. The initial approach of adding `'children.wishlists.target_kindergarten'` to the User service's `findOneById` relations was coupling too much logic into the user service.

## Solution

Created a separate Kindergarten module following the single responsibility principle:

### Backend Changes

#### 1. Kindergarten Service (`backend/src/services/kindergarten.service.ts`)

```typescript
@Injectable()
export class KindergartenService {
  constructor(
    @InjectRepository(Kindergarten)
    private kindergartenRepository: Repository<Kindergarten>,
  ) {}

  async findOneById(id: string): Promise<Kindergarten | null>
  async findByIds(ids: string[]): Promise<Kindergarten[]>
  async findAll(): Promise<Kindergarten[]>
}
```

**Key Features:**

- Single responsibility: manages only kindergarten data
- Batch operations support with `findByIds` for efficient querying
- Clean separation from user logic

#### 2. Kindergarten Controller (`backend/src/controllers/kindergarten.controller.ts`)

```typescript
@Controller('kindergartens')
export class KindergartenController {
  @Get() // GET /kindergartens - Get all kindergartens
  @Get('batch') // GET /kindergartens/batch?ids=id1&ids=id2 - Get multiple by IDs
  @Get(':id') // GET /kindergartens/:id - Get single kindergarten
}
```

**Endpoints:**

- `GET /kindergartens` - Returns all kindergartens
- `GET /kindergartens/batch?ids=id1,id2` - Returns multiple kindergartens by IDs
- `GET /kindergartens/:id` - Returns a single kindergarten

#### 3. Kindergarten Module (`backend/src/modules/kindergarten.module.ts`)

Standard NestJS module setup with TypeORM integration.

#### 4. App Module Integration

Added `KindergartenModule` to the main app module imports.

### Frontend Changes

#### 1. API Layer (`frontend/src/lib/api.ts`)

Added new API functions:

```typescript
export async function getKindergartenByIdApi(id: string): Promise<Kindergarten>
export async function getKindergartensByIdsApi(
  ids: string[],
): Promise<Kindergarten[]>
export async function getAllKindergartensApi(): Promise<Kindergarten[]>
```

Also added:

- `KindergartenSchema` for Zod validation
- `Kindergarten` type export

#### 2. Query Hooks (`frontend/src/lib/queries.ts`)

Added React Query hooks:

```typescript
export function useKindergartens() // All kindergartens
export function useKindergarten(id: string) // Single kindergarten
export function useKindergartensBatch(ids: string[]) // Multiple kindergartens
```

**Key Features:**

- 30-minute stale time (kindergartens don't change often)
- Proper query key management
- Batch fetching support

#### 3. Dashboard Updates (`frontend/src/app/dashboard/page.tsx`)

Updated `ChildTabContent` component to:

1. Extract kindergarten IDs from wishlists
2. Fetch kindergarten data in a single batch request
3. Create a Map for O(1) lookup
4. Display kindergarten names and addresses

```typescript
const wishlistKindergartenIds = (child.wishlists || [])
  .map((wish) => wish.target_kindergarten_id)
  .filter(Boolean)

const { data: kindergartens = [] } = useKindergartensBatch(
  wishlistKindergartenIds,
)

const kindergartenMap = new Map(kindergartens.map((k) => [k.id, k]))
```

## Benefits

1. **Separation of Concerns**: Kindergarten logic is now isolated from user logic
2. **Better Performance**: Batch fetching reduces API calls
3. **Reusability**: Kindergarten service can be used anywhere in the app
4. **Maintainability**: Changes to kindergarten logic don't affect user service
5. **Caching**: React Query caches kindergarten data for 30 minutes
6. **Type Safety**: Full TypeScript and Zod validation

## Testing

The backend was successfully built with `npm run build` with no errors.

## Future Enhancements

Potential improvements:

- Add pagination for `GET /kindergartens`
- Add search/filter capabilities
- Add caching layer (Redis) for frequently accessed kindergartens
- Create a dedicated kindergarten management UI
- Add kindergarten availability tracking

## Files Modified

**Backend:**

- ✅ Created: `src/services/kindergarten.service.ts`
- ✅ Created: `src/controllers/kindergarten.controller.ts`
- ✅ Created: `src/modules/kindergarten.module.ts`
- ✅ Modified: `src/app.module.ts`

**Frontend:**

- ✅ Modified: `src/lib/api.ts`
- ✅ Modified: `src/lib/queries.ts`
- ✅ Modified: `src/app/dashboard/page.tsx`

## API Reference

### Get All Kindergartens

```
GET /kindergartens
```

### Get Kindergarten by ID

```
GET /kindergartens/:id
```

### Get Multiple Kindergartens

```
GET /kindergartens/batch?ids=id1&ids=id2&ids=id3
```

or

```
GET /kindergartens/batch?ids=id1,id2,id3
```

## Notes

- The User service was kept clean and focused on user data only
- Wishlists still only return `target_kindergarten_id`, not the full relation
- Frontend handles the kindergarten data fetching separately
- This pattern can be applied to other entities (e.g., Child service)
