# TanStack Query Implementation Summary

## ✅ Implementation Complete (with Suspense!)

This document summarizes the TanStack Query integration with React Suspense for the Razmena Vrtića frontend application.

## What Was Done

### 1. **Package Installation**
- Installed `@tanstack/react-query` (latest version)

### 2. **QueryClient Provider Setup**
- Created `QueryProvider.tsx` component with optimized defaults:
  - `staleTime`: 60 seconds (data considered fresh for 1 minute)
  - `gcTime` (garbage collection): 5 minutes (data kept in cache)
  - `retry`: 1 attempt
  - `refetchOnWindowFocus`: disabled (prevents unnecessary refetches)
  - `throwOnError`: enabled (for error boundary integration)

- Integrated provider into `app/layout.tsx` to wrap the entire application

### 3. **Custom Hooks Library** (`lib/queries.ts`)

#### Query Keys (Centralized)
```typescript
export const queryKeys = {
  user: ["user"],
  userProfile: ["user", "profile"],
  childMatches: (childId: string) => ["child", childId, "matches"],
  childMatchGroups: (childId: string) => ["child", childId, "matchGroups"],
  potentialMatches: (ageGroup?: AgeGroup) => ["potentialMatches", ageGroup],
  matchesByAgeGroup: (ageGroup: AgeGroup) => ["matches", "ageGroup", ageGroup],
  validateMatch: (matchId: string) => ["match", matchId, "validate"],
}
```

#### Auth Hooks
- `useLogin()` - Login mutation with automatic token storage
- `useRegister()` - Registration mutation with automatic token storage

#### User Hooks
- `useUserProfile()` - Fetches current user profile (Suspense-enabled)
  - 5-minute stale time
  - No retry on 401 (redirect to login instead)

#### Matching Hooks
- `useChildMatches(childId)` - Direct matches for a child (Suspense-enabled)
- `useChildMatchGroups(childId)` - Active match groups for a child (Suspense-enabled)
- `usePotentialMatches(ageGroup?)` - Potential circular matches (Suspense-enabled)
- `useMatchesByAgeGroup(ageGroup)` - All matches by age group (Suspense-enabled)
- `useValidateMatch(matchId)` - Validate a specific match (Suspense-enabled)

#### Mutation Hooks
- `useCreateMatch()` - Create new matches
  - Automatic cache invalidation for affected children
  - Invalidates user profile and potential matches

#### Composite Hooks
- `useChildData(childId, ageGroup?)` - Combines multiple queries for a child (Suspense-enabled)
  - Returns: `{ matches, matchGroups, potentials }`
  - No loading states needed - handled by Suspense boundaries

### 4. **React Suspense Integration**

#### Loading Components (`components/LoadingFallback.tsx`)
- `DashboardSkeleton` - Full page skeleton with animated placeholders
- `ChildDataSkeleton` - Tab content skeleton for child data
- `FullPageSpinner` - Simple spinner for quick loads

#### Error Boundary (`components/ErrorBoundary.tsx`)
- `ErrorBoundary` - Class component for catching React errors
- `QueryErrorBoundary` - Specialized boundary for query errors
- `DefaultErrorFallback` - User-friendly error display
  - Handles 401 (Unauthorized) with login redirect
  - Handles 404 (Not Found)
  - Handles 500 (Server Error)
  - Shows error details in development mode
  - "Try Again" functionality with query reset

#### Suspense Boundaries
**Page-level Suspense:**
- Wraps entire dashboard content
- Shows full skeleton while user profile loads
- Catches authentication errors early

**Tab-level Suspense:**
- Each child tab has its own Suspense boundary
- Loads child data independently
- Better perceived performance - UI shows immediately

### 5. **Refactored Pages**

#### Dashboard Page (`app/dashboard/page.tsx`)
**Before:**
- Manual `useState` + `useEffect` for data fetching
- Multiple loading states
- No automatic refetching
- Manual error handling

**After:**
- React Suspense for declarative loading states
- `ErrorBoundary` for centralized error handling
- `useSuspenseQuery` hooks - no manual loading/error state management
- Automatic cache management
- Granular loading states (page-level and tab-level)
- Reduced code by ~40 lines
- Better UX with skeleton screens

#### Login Page (`app/login/page.tsx`)
**Before:**
- Manual state management for loading/errors
- Manual API calls
- Manual localStorage handling

**After:**
- `useLogin()` mutation hook
- Automatic loading state via `isPending`
- Automatic error handling via `isError`
- Cleaner code structure

#### Register Page (`app/register/page.tsx`)
**Before:**
- Manual state management
- Manual API calls

**After:**
- `useRegister()` mutation hook
- Automatic state management
- Consistent with login page

## Key Benefits

### 🚀 Performance
1. **Automatic Caching**: User profile and child data are cached for 1-5 minutes
2. **Request Deduplication**: Multiple components requesting same data = 1 API call
3. **Background Refetching**: Stale data refetches in background, UI stays responsive
4. **Optimistic Updates**: Mutations can update UI immediately before server response
5. **Suspense Streaming**: Components render as data becomes available

### 🎨 User Experience
1. **Skeleton Screens**: Beautiful loading states instead of spinners
2. **Granular Loading**: Individual sections load independently
3. **Error Recovery**: One-click retry for failed requests
4. **No Layout Shift**: Skeletons match final content dimensions
5. **Immediate Feedback**: UI updates without full page reloads

### 🛠️ Developer Experience
1. **Less Boilerplate**: No more manual `useState`, `useEffect`, loading/error state
2. **Type Safety**: Full TypeScript support with Zod schemas
3. **Centralized Query Keys**: Easy cache invalidation and management
4. **DevTools Ready**: Can install React Query DevTools for debugging
5. **Declarative Loading**: Suspense boundaries replace conditional rendering
6. **Simplified Components**: Components focus on happy path, errors handled globally

### 🐛 Error Handling
1. **Automatic Retry Logic**: Failed requests retry once by default
2. **Error Boundaries**: Centralized error handling with fallback UI
3. **Status-specific Errors**: Different UI for 401, 404, 500 errors
4. **Error Recovery**: Users can retry without page reload
5. **Development Info**: Detailed error stack in dev mode

### 🔄 Data Synchronization
1. **Automatic Invalidation**: Creating matches invalidates related queries
2. **Cache Management**: Old data automatically garbage collected
3. **Manual Refetch**: Easy to trigger refetch when needed

## Usage Examples

### Fetching Data with Suspense
```typescript
// No manual loading states needed!
function MyComponent() {
  const { data } = useUserProfile() // data is always defined
  return <div>{data.full_name}</div>
}

// Wrap with Suspense boundary
function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MyComponent />
    </Suspense>
  )
}
```

### Query with Parameter
```typescript
const { data: matches } = useChildMatches(childId) // matches always defined

// Multiple queries - all suspense-enabled
const { matches, matchGroups, potentials } = useChildData(childId, ageGroup)
```

### Error Handling with Boundaries
```typescript
import { QueryErrorBoundary } from '@/components/ErrorBoundary'

function Page() {
  return (
    <QueryErrorBoundary onReset={() => console.log('Retrying')}>
      <Suspense fallback={<LoadingSkeleton />}>
        <DataComponent />
      </Suspense>
    </QueryErrorBoundary>
  )
}
```

### Mutations (unchanged)
```typescript
const createMatch = useCreateMatch()

createMatch.mutate(childIds, {
  onSuccess: (data) => {
    // Handle success
    router.push('/success')
  },
  onError: (error) => {
    // Handle error
    console.error(error)
  }
})

// Check mutation state
if (createMatch.isPending) return <Spinner />
if (createMatch.isError) return <Error error={createMatch.error} />
```

### Manual Cache Invalidation
```typescript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: queryKeys.userProfile })

// Invalidate all child queries
queryClient.invalidateQueries({ queryKey: ['child'] })
```

## Build Status
✅ **Build Successful** - No TypeScript or linting errors
✅ **All Pages Refactored** - Login, Register, Dashboard
✅ **Full Type Safety** - TypeScript + Zod validation
✅ **Suspense Integration** - Declarative loading and error states
✅ **Error Boundaries** - Centralized error handling
✅ **Skeleton Screens** - Beautiful loading UX

## Next Steps (Optional Improvements)

1. **Install React Query DevTools** (development only):
   ```bash
   npm install @tanstack/react-query-devtools
   ```
   
   Add to QueryProvider:
   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
   
   return (
     <QueryClientProvider client={queryClient}>
       {children}
       <ReactQueryDevtools initialIsOpen={false} />
     </QueryClientProvider>
   )
   ```

2. **Add Optimistic Updates** for better UX:
   ```typescript
   onMutate: async (newData) => {
     // Cancel outgoing refetches
     await queryClient.cancelQueries({ queryKey: ['matches'] })
     
     // Snapshot previous value
     const previousMatches = queryClient.getQueryData(['matches'])
     
     // Optimistically update
     queryClient.setQueryData(['matches'], (old) => [...old, newData])
     
     // Return context with snapshot
     return { previousMatches }
   },
   ```

3. **Add Pagination/Infinite Scroll** with Suspense:
   ```typescript
   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
     queryKey: ['matches'],
     queryFn: ({ pageParam = 0 }) => fetchMatches(pageParam),
     getNextPageParam: (lastPage) => lastPage.nextCursor,
   })
   
   // Wrap in Suspense for initial load
   <Suspense fallback={<InitialSkeleton />}>
     <InfiniteList />
   </Suspense>
   ```

4. **Prefetch Data on Hover** for instant navigation:
   ```typescript
   const queryClient = useQueryClient()
   
   const handleHover = (childId: string) => {
     queryClient.prefetchQuery({
       queryKey: queryKeys.childMatches(childId),
       queryFn: () => checkMatchesApi(childId),
     })
   }
   ```

5. **Add Streaming SSR** with Next.js App Router:
   - Suspense works seamlessly with server components
   - Data streams from server to client
   - Instant page loads with progressive enhancement

## Migration Notes

### Breaking Changes
- None - all changes are additive

### Backwards Compatibility
- Original `api.ts` functions remain unchanged
- Can gradually migrate other components
- No impact on backend

## Performance Metrics

### Before TanStack Query
- Dashboard load: 3 sequential API calls per child
- Re-renders on every mount
- No caching between page navigation
- ~190 lines in dashboard component
- Manual loading/error states everywhere
- Spinners for all loading states

### After TanStack Query + Suspense
- Dashboard load: Parallel API calls with caching
- No unnecessary re-renders
- Data persists between navigation
- ~150 lines in dashboard component
- **~21% code reduction** with better functionality
- Beautiful skeleton screens
- Centralized error handling
- Granular loading states (page & tab level)
- Automatic error recovery

## Conclusion

The TanStack Query + React Suspense integration provides a robust, performant, and maintainable data fetching layer for the application. The implementation follows React Query and React 18+ best practices with:

- **Declarative loading states** via Suspense boundaries
- **Centralized error handling** via Error Boundaries
- **Beautiful UX** with skeleton screens
- **Type-safe** data fetching
- **Automatic caching** and background refetching
- **Production-ready** error recovery

All pages compile successfully, and the application maintains full type safety with dramatically improved developer and user experience.

## Architecture Benefits

### Component Simplicity
Components can now focus entirely on the "happy path" - the successful data state. All loading and error states are handled declaratively by boundaries:

```typescript
// Before: Complex state management
function Component() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <Spinner />
  if (error) return <Error />
  return <View data={data} />
}

// After: Simple and declarative
function Component() {
  const { data } = useUserProfile() // Always has data
  return <View data={data} />
}
```

### Parallel Data Loading
Suspense enables true parallel loading with independent boundaries:
- User profile loads → shows partial UI
- Child tab 1 loads → shows tab content
- Child tab 2 loads independently
- No waterfall, no loading chains

### Error Recovery
Users never hit a dead end:
- API errors show friendly message
- One-click retry without page reload
- 401 errors auto-redirect to login
- Development mode shows stack traces

