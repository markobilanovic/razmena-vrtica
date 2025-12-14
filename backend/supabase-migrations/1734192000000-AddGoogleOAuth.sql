-- Supabase Migration: AddGoogleOAuth
-- Generated from TypeORM migration
-- Timestamp: 1734192000000
-- Generated at: 2025-12-14T20:39:43.501Z
-- 
-- IMPORTANT: Review this SQL before applying to production
-- Test on staging environment first

-- =====================================================
-- UP MIGRATION
-- =====================================================

BEGIN;

-- Query 1
ALTER TABLE "user" ADD "google_id" character varying;

-- Query 2
ALTER TABLE "user" ADD CONSTRAINT "UQ_user_google_id" UNIQUE ("google_id");

-- Update RLS policies if needed
-- (Add any necessary policy updates here)

COMMIT;

-- =====================================================
-- ROLLBACK (DOWN MIGRATION)
-- =====================================================
-- Uncomment and run if rollback is needed

/*
BEGIN;

-- Rollback Query 1
ALTER TABLE "user" DROP CONSTRAINT "UQ_user_google_id";

-- Rollback Query 2
ALTER TABLE "user" DROP COLUMN "google_id";

COMMIT;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration was successful

-- Check table structure
-- \d+ table_name

-- Verify data integrity
-- SELECT COUNT(*) FROM affected_table;

-- Test RLS policies
-- SET ROLE authenticated;
-- SELECT * FROM table_name LIMIT 1;

-- =====================================================
-- NOTES
-- =====================================================
-- Migration: AddGoogleOAuth
-- Applied: [DATE TO BE FILLED MANUALLY]
-- Applied by: [NAME TO BE FILLED MANUALLY]
-- Rollback tested: [YES/NO TO BE FILLED MANUALLY]
