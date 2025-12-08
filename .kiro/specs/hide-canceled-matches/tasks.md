# Implementation Plan

- [x] 1. Create database entity and migration for hidden matches
  - Create HiddenMatch entity with proper TypeORM decorators
  - Generate and run database migration for new table
  - Add entity to app module configuration
  - _Requirements: 3.1, 3.2_

- [ ]* 1.1 Write property test for hide persistence
  - **Property 3: Hide persistence**
  - **Validates: Requirements 1.3, 1.5**

- [x] 2. Extend backend matching service with hide functionality
  - Add hideMatchForUser method to MatchingService
  - Add unhideMatchForUser method to MatchingService
  - Add getVisibleMatchesForUser method with filtering logic
  - Add isMatchHiddenForUser helper method
  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 2.1 Write property test for hide functionality
  - **Property 2: Hide functionality**
  - **Validates: Requirements 1.2, 1.4**

- [ ]* 2.2 Write property test for data preservation
  - **Property 8: Data preservation**
  - **Validates: Requirements 3.3**

- [ ]* 2.3 Write property test for audit trail creation
  - **Property 7: Audit trail creation**
  - **Validates: Requirements 3.1, 3.2**

- [ ] 3. Add API endpoints for hide operations
  - Create POST /matches/:matchId/hide endpoint in MatchingController
  - Create DELETE /matches/:matchId/hide endpoint in MatchingController
  - Add proper authentication and authorization guards
  - Implement request/response validation with Zod schemas
  - _Requirements: 1.2, 2.2_

- [ ]* 3.1 Write unit tests for hide API endpoints
  - Test successful hide operations
  - Test authorization failures
  - Test invalid match ID handling
  - _Requirements: 1.2, 2.2_

- [ ] 4. Update shared schemas for hide operations
  - Add HiddenMatchSchema to shared/schemas
  - Add HideMatchRequestSchema and HideMatchResponseSchema
  - Export new types from shared package
  - _Requirements: 3.1, 3.2_

- [ ] 5. Modify dashboard queries to filter hidden matches
  - Update existing match query methods to exclude hidden matches
  - Ensure all dashboard API endpoints respect hide preferences
  - Update MatchingController endpoints to use filtered queries
  - _Requirements: 1.4, 3.4_

- [ ]* 5.1 Write property test for dashboard filtering
  - **Property 2: Hide functionality (dashboard filtering aspect)**
  - **Validates: Requirements 1.4**

- [ ] 6. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create hide confirmation dialog component
  - Build HideMatchConfirmation component with clear messaging
  - Implement confirmation and cancellation handlers
  - Add proper styling consistent with existing UI
  - _Requirements: 2.2, 2.3, 2.4_

- [ ]* 7.1 Write property test for confirmation requirement
  - **Property 4: Confirmation requirement**
  - **Validates: Requirements 2.2**

- [ ]* 7.2 Write property test for cancellation preservation
  - **Property 5: Cancellation preservation**
  - **Validates: Requirements 2.4**

- [ ] 8. Add hide button to canceled matches in dashboard
  - Modify ActiveExchangesSection to show hide button for canceled matches
  - Integrate hide confirmation dialog
  - Implement hide action API calls with error handling
  - _Requirements: 1.1, 2.1, 2.5_

- [ ]* 8.1 Write property test for hide action availability
  - **Property 1: Hide action availability**
  - **Validates: Requirements 1.1, 2.1**

- [ ]* 8.2 Write property test for immediate update
  - **Property 6: Immediate update**
  - **Validates: Requirements 2.5**

- [ ] 9. Update frontend API client for hide operations
  - Add hideMatch and unhideMatch functions to api.ts
  - Add proper error handling and type safety
  - Update queries.ts with hide-aware match queries
  - _Requirements: 1.2, 2.5_

- [ ]* 9.1 Write unit tests for frontend API client
  - Test hide/unhide API calls
  - Test error handling scenarios
  - Test query integration
  - _Requirements: 1.2, 2.5_

- [ ] 10. Add reporting distinction for hidden vs canceled matches
  - Update any existing reporting or statistics methods
  - Ensure hidden matches are properly categorized in reports
  - Add documentation for the distinction
  - _Requirements: 3.5_

- [ ]* 10.1 Write property test for reporting distinction
  - **Property 9: Reporting distinction**
  - **Validates: Requirements 3.5**

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.