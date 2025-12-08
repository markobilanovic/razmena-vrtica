# React Suspense Quick Reference

## 🎯 Quick Start

### 1. Use Suspense Query Hook

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'

function MyComponent() {
  const { data } = useSuspenseQuery({
    queryKey: ['myData'],
    queryFn: fetchMyData,
  })

  return <div>{data.name}</div> // data is always defined!
}
```

### 2. Wrap with Suspense Boundary

```typescript
import { Suspense } from 'react'

<Suspense fallback={<LoadingSkeleton />}>
  <MyComponent />
</Suspense>
```

### 3. Add Error Boundary

```typescript
import { QueryErrorBoundary } from '@/components/ErrorBoundary'

<QueryErrorBoundary>
  <Suspense fallback={<LoadingSkeleton />}>
    <MyComponent />
  </Suspense>
</QueryErrorBoundary>
```

## 📚 Available Hooks

All hooks return `{ data }` - no need for `isLoading` or `isError`!

### User Hooks

- `useUserProfile()` - Current user profile

### Matching Hooks

- `useChildMatches(childId)` - Direct matches for a child
- `useChildMatchGroups(childId)` - Active match groups for a child
- `usePotentialMatches(ageGroup?)` - Potential circular matches
- `useMatchesByAgeGroup(ageGroup)` - All matches by age group
- `useValidateMatch(matchId)` - Validate a specific match

### Composite Hooks

- `useChildData(childId, ageGroup?)` - Combines matches, groups, and potentials

### Mutation Hooks (not Suspense)

- `useLogin()` - Login mutation
- `useRegister()` - Registration mutation
- `useCreateMatch()` - Create match mutation

## 🎨 Loading Components

```typescript
import {
  DashboardSkeleton,
  ChildDataSkeleton,
  FullPageSpinner,
} from '@/components/LoadingFallback'

// Full page loading
<Suspense fallback={<DashboardSkeleton />}>

// Tab content loading
<Suspense fallback={<ChildDataSkeleton />}>

// Quick operations
<Suspense fallback={<FullPageSpinner />}>
```

## 🚨 Error Handling

```typescript
import { QueryErrorBoundary } from '@/components/ErrorBoundary'

<QueryErrorBoundary
  onReset={() => console.log('User clicked retry')}
>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</QueryErrorBoundary>
```

**Handles**:

- 401 Unauthorized → Auto-redirect to login
- 404 Not Found → Friendly error message
- 500 Server Error → Server issue message
- Generic errors → Fallback message with retry

## 🏗️ Patterns

### Basic Component

```typescript
function UserName() {
  const { data } = useUserProfile()
  return <span>{data.full_name}</span>
}

// In parent:
<Suspense fallback={<Skeleton />}>
  <UserName />
</Suspense>
```

### Nested Suspense (Independent Loading)

```typescript
function Dashboard() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header /> {/* Loads first */}

      <Tabs>
        {children.map(child => (
          <TabContent value={child.id}>
            <Suspense fallback={<TabSkeleton />}>
              <ChildData id={child.id} /> {/* Loads independently */}
            </Suspense>
          </TabContent>
        ))}
      </Tabs>
    </Suspense>
  )
}
```

### Composite Hook

```typescript
function ChildDetails({ childId, ageGroup }) {
  // All queries run in parallel, Suspense waits for all
  const { matches, matchGroups, potentials } = useChildData(childId, ageGroup)

  return (
    <>
      <Matches data={matches} />
      <Groups data={matchGroups} />
      <Potentials data={potentials} />
    </>
  )
}
```

### Client-Only Component (for auth pages)

```typescript
function AuthenticatedPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Skeleton />
  }

  return (
    <Suspense fallback={<Skeleton />}>
      <AuthenticatedContent />
    </Suspense>
  )
}
```

## ⚙️ Configuration

Query client configured in `src/components/QueryProvider.tsx`:

```typescript
{
  queries: {
    staleTime: 60 * 1000,           // 1 minute
    gcTime: 5 * 60 * 1000,          // 5 minutes
    retry: 1,                        // Retry failed queries once
    refetchOnWindowFocus: false,     // Don't refetch on window focus
    throwOnError: true,              // Throw errors to boundaries
  }
}
```

## 🎯 Benefits

✅ No manual loading states  
✅ No manual error handling  
✅ Type-safe data (always defined)  
✅ Parallel data loading  
✅ Automatic caching  
✅ Beautiful skeleton screens  
✅ One-click error recovery  
✅ Granular loading boundaries

## ⚠️ Common Mistakes

### ❌ Don't access data outside Suspense

```typescript
function BadComponent() {
  const { data } = useSuspenseQuery(...)
  return <div>{data.name}</div> // No Suspense wrapper!
}
```

### ✅ Always wrap with Suspense

```typescript
<Suspense fallback={<Loading />}>
  <GoodComponent />
</Suspense>
```

### ❌ Don't check for loading

```typescript
const { data, isLoading } = useSuspenseQuery(...)
if (isLoading) return <Loading /> // Unnecessary!
```

### ✅ Just use the data

```typescript
const { data } = useSuspenseQuery(...)
return <div>{data.name}</div>
```

### ❌ Error boundary inside Suspense

```typescript
<Suspense>
  <ErrorBoundary>
    <Component />
  </ErrorBoundary>
</Suspense>
```

### ✅ Error boundary wraps Suspense

```typescript
<ErrorBoundary>
  <Suspense>
    <Component />
  </Suspense>
</ErrorBoundary>
```

## 📖 More Info

- Full documentation: `SUSPENSE_IMPLEMENTATION.md`
- TanStack Query docs: `TANSTACK_QUERY_IMPLEMENTATION.md`
- React Suspense: https://react.dev/reference/react/Suspense
- TanStack Query: https://tanstack.com/query/latest
