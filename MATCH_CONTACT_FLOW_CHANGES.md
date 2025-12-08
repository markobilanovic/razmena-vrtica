# Match Contact Flow Changes

## Overview
Updated the match flow to show contact emails for all participants and allow users to confirm completion or cancel exchanges directly, instead of using accept/reject buttons.

## Changes Made

### Backend Changes

#### 1. New Controller Endpoints (`backend/src/controllers/matching.controller.ts`)
- **POST `/matching/:matchId/complete`** - Mark a match as completed
  - Only allows completing matches in `ACTIVE_CONTACT` status
  - Requires user authentication and permission check
  
- **POST `/matching/:matchId/cancel`** - Cancel a match
  - Only allows canceling matches in `PENDING_ACCEPTANCE` or `ACTIVE_CONTACT` status
  - Requires user authentication and permission check

- **Updated POST `/matching/:matchId/hide`** - Now allows hiding both `CANCELLED` and `COMPLETED` matches

#### 2. New Service Methods (`backend/src/services/matching.service.ts`)
- `completeMatch(matchGroupId: string)` - Updates match status to `COMPLETED`
- `cancelMatch(matchGroupId: string)` - Updates match status to `CANCELLED`

### Frontend Changes

#### 1. API Client (`frontend/src/lib/api.ts`)
- Added `completeMatchApi(matchGroupId: string)` - Calls complete endpoint
- Added `cancelMatchApi(matchGroupId: string)` - Calls cancel endpoint

#### 2. Query Hooks (`frontend/src/lib/queries.ts`)
- Added `useCompleteMatch()` - Mutation hook for completing matches
- Added `useCancelMatch()` - Mutation hook for canceling matches
- Both hooks invalidate relevant queries on success

#### 3. ActiveExchangesSection Component
**Contact Information Display:**
- Shows parent contact emails for all participants in `PENDING_ACCEPTANCE` and `ACTIVE_CONTACT` matches
- Email addresses are clickable `mailto:` links
- Contact info displayed for both pending and active matches (not just active)

**Status Display:**
- **AKTIVNO** (green) - Match is active, contact participants
- **ZAVRŠENO** (blue) - Successfully completed exchange
- **OTKAZANO** (red) - Cancelled exchange

**Action Buttons:**
- Removed old "Prihvati razmenu" and "Odbij" buttons
- Added new buttons for pending and active matches:
  - **"✓ Razmena završena"** (green) - Confirms successful exchange
  - **"✗ Otkaži razmenu"** (red) - Cancels the exchange
- Both buttons show confirmation dialogs before action
- "Sakrij" button now available for both cancelled and completed matches

**User Flow:**
1. System automatically creates match when cycle is detected (status: `ACTIVE`)
2. User sees match with all participant contact emails displayed
3. User contacts all participants via email to arrange exchange
4. After successful agreement, user clicks "✓ Razmena završena" to mark as `COMPLETED`
5. If exchange falls through, user clicks "✗ Otkaži razmenu" to mark as `CANCELLED`
6. Completed or cancelled matches can be hidden from view with "Sakrij" button

## Database Schema Changes

### Simplified Match Status Enum
Removed redundant statuses and simplified to:
- `ACTIVE` - Match is active and users can contact each other
- `COMPLETED` - Exchange successfully completed
- `CANCELLED` - Exchange was cancelled

**Migration:** `1733760000000-SimplifyMatchStatus.ts`
- Converts existing `PENDING_ACCEPTANCE` and `ACTIVE_CONTACT` to `ACTIVE`
- Updates enum type in database
- Sets default status to `ACTIVE`

## Testing Recommendations
1. Run migration to update existing match statuses
2. Test completing a match in `ACTIVE` status
3. Test canceling a match in `ACTIVE` status
4. Verify email links work correctly (mailto: links)
5. Test hiding completed and cancelled matches
6. Verify permission checks (users can only act on their own matches)
7. Test error handling for invalid status transitions
8. Verify new matches are created with `ACTIVE` status
