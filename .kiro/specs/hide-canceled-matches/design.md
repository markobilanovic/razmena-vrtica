# Design Document: Hide Canceled Matches

## Overview

This feature extends the existing match management system to allow users to hide canceled matches from their dashboard view. The solution introduces a new entity to track user-specific match visibility preferences while preserving all original match data for system integrity.

## Architecture

The feature follows the existing layered architecture:

- **Database Layer**: New `HiddenMatch` entity to track user preferences
- **Service Layer**: Extended `MatchingService` with hide/unhide operations
- **Controller Layer**: New endpoints in `MatchingController` for hide operations
- **Frontend Layer**: Enhanced dashboard components with hide functionality

## Components and Interfaces

### Backend Components

#### 1. HiddenMatch Entity

```typescript
@Entity()
export class HiddenMatch {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User

  @Column()
  user_id: string

  @ManyToOne(() => MatchGroup)
  @JoinColumn({ name: "match_group_id" })
  match_group: MatchGroup

  @Column()
  match_group_id: string

  @CreateDateColumn()
  hidden_at: Date
}
```

#### 2. Extended MatchingService

New methods:

- `hideMatchForUser(userId: string, matchGroupId: string): Promise<void>`
- `unhideMatchForUser(userId: string, matchGroupId: string): Promise<void>`
- `getVisibleMatchesForUser(userId: string, childId: string): Promise<MatchGroupWithDetails[]>`
- `isMatchHiddenForUser(userId: string, matchGroupId: string): Promise<boolean>`

#### 3. MatchingController Extensions

New endpoints:

- `POST /matches/:matchId/hide` - Hide a match for the authenticated user
- `DELETE /matches/:matchId/hide` - Unhide a match for the authenticated user

### Frontend Components

#### 1. Enhanced ActiveExchangesSection

- Add hide button for canceled matches
- Integrate confirmation dialog
- Handle hide action API calls

#### 2. HideMatchConfirmation Component

- Reusable confirmation dialog
- Clear messaging about permanent hiding
- Cancel/confirm actions

## Data Models

### HiddenMatch Schema

```typescript
export const HiddenMatchSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  match_group_id: z.string().uuid(),
  hidden_at: z.coerce.date(),
})

export type HiddenMatch = z.infer<typeof HiddenMatchSchema>
```

### API Request/Response Schemas

```typescript
export const HideMatchRequestSchema = z.object({
  matchGroupId: z.string().uuid(),
})

export const HideMatchResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

After reviewing the prework analysis, several properties can be consolidated to eliminate redundancy:

**Property 1: Hide action availability**
_For any_ canceled match and any user, the match display should include a hide action option
**Validates: Requirements 1.1, 2.1**

**Property 2: Hide functionality**
_For any_ user and canceled match, when the user hides the match, it should no longer appear in any dashboard queries for that user
**Validates: Requirements 1.2, 1.4**

**Property 3: Hide persistence**
_For any_ hidden match preference, the preference should persist indefinitely across all user sessions and system restarts
**Validates: Requirements 1.3, 1.5**

**Property 4: Confirmation requirement**
_For any_ hide action initiation, the system should require user confirmation before proceeding
**Validates: Requirements 2.2**

**Property 5: Cancellation preservation**
_For any_ hide confirmation that is canceled, the match visibility should remain unchanged
**Validates: Requirements 2.4**

**Property 6: Immediate update**
_For any_ confirmed hide action, the dashboard view should update immediately to reflect the change
**Validates: Requirements 2.5**

**Property 7: Audit trail creation**
_For any_ hide action, the system should create a database record with user ID, match ID, and timestamp
**Validates: Requirements 3.1, 3.2**

**Property 8: Data preservation**
_For any_ hidden match, all original match data should remain intact and unchanged
**Validates: Requirements 3.3**

**Property 9: Reporting distinction**
_For any_ system report or statistics, canceled matches and hidden matches should be properly distinguished
**Validates: Requirements 3.5**

## Error Handling

### Database Errors

- Handle duplicate hide attempts gracefully (idempotent operations)
- Manage foreign key constraint violations
- Provide meaningful error messages for invalid match or user IDs

### Authorization Errors

- Verify user can only hide matches involving their own children
- Prevent hiding matches that are not in canceled state
- Handle authentication failures appropriately

### UI Error States

- Display error messages for failed hide operations
- Provide retry mechanisms for network failures
- Maintain UI consistency during error states

## Testing Strategy

### Unit Testing Approach

- Test individual service methods for hide/unhide operations
- Verify database entity relationships and constraints
- Test API endpoint validation and error handling
- Test UI component behavior with different match states

### Property-Based Testing Approach

The system will use **fast-check** as the property-based testing library for TypeScript/JavaScript. Each property-based test will run a minimum of 100 iterations to ensure thorough validation.

Property-based tests will focus on:

- Hide functionality across various user and match combinations
- Data persistence and integrity across system operations
- UI behavior consistency with different match states
- Authorization and access control validation

Each property-based test will be tagged with comments referencing the specific correctness property from this design document using the format: **Feature: hide-canceled-matches, Property {number}: {property_text}**

### Integration Testing

- End-to-end hide workflow testing
- Database transaction integrity
- API endpoint integration with authentication
- Frontend-backend integration for hide operations
