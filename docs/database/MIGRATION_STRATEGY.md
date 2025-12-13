# Migration Strategy for Multi-Environment Setup

## Overview

This document outlines how to handle database migrations across Docker (local) and Supabase (production) environments while maintaining consistency and safety.

## Migration Workflow

### 1. Local Development (Docker)
```bash
# Create new migration
npm run typeorm migration:generate -- src/migrations/AddNewFeature -d src/data-source.ts

# Run migrations locally
npm run typeorm migration:run -- -d src/data-source.ts

# Revert if needed
npm run typeorm migration:revert -- -d src/data-source.ts
```

### 2. Production Deployment (Supabase)
```bash
# Generate production-ready migration SQL
npm run generate-migration-sql AddNewFeature

# Review and apply to Supabase manually
```

## Migration Types

### A. Schema Migrations (Tables, Columns, Indexes)
- Use TypeORM migrations for local development
- Generate equivalent SQL for Supabase
- Include RLS policy updates when needed

### B. Data Migrations (Seeds, Updates)
- Create separate data migration scripts
- Test thoroughly in staging environment
- Apply with careful rollback planning

### C. Supabase-Specific Migrations (RLS, Functions)
- Create separate Supabase migration files
- Version control these alongside TypeORM migrations
- Apply after schema migrations

## File Structure

```
backend/
├── src/
│   ├── migrations/
│   │   ├── 1733760000000-SimplifyMatchStatus.ts     # TypeORM migration
│   │   └── 1733760000001-AddNewFeature.ts           # TypeORM migration
│   └── supabase-migrations/
│       ├── 001-initial-rls-policies.sql             # RLS setup
│       ├── 002-add-new-feature-policies.sql         # Feature-specific RLS
│       └── 003-performance-functions.sql            # Custom functions
└── scripts/
    ├── generate-migration-sql.ts                    # Convert TypeORM to SQL
    └── apply-supabase-migration.ts                  # Deployment helper
```

## Safety Measures

### 1. Migration Validation
- Always test migrations on local Docker first
- Create staging Supabase project for testing
- Validate data integrity after migrations

### 2. Rollback Strategy
- Every migration must have a down() method
- Create rollback SQL for Supabase migrations
- Backup data before major schema changes

### 3. Zero-Downtime Migrations
- Use additive changes when possible
- Implement backward-compatible migrations
- Plan multi-step migrations for breaking changes

## Best Practices

### 1. Migration Naming
```
YYYYMMDDHHMMSS-DescriptiveActionName.ts
Example: 20241213120000-AddUserEmailConfirmation.ts
```

### 2. Migration Content
- Keep migrations atomic and focused
- Include proper error handling
- Add descriptive comments
- Test both up() and down() methods

### 3. Supabase Considerations
- RLS policies must be updated with schema changes
- Custom functions may need updates
- Indexes should be created with IF NOT EXISTS
- Use transactions for multi-statement changes

## Environment-Specific Handling

### Local Docker
```typescript
// Use TypeORM migrations directly
export class AddNewFeature implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "phone_number" varchar
    `);
  }
}
```

### Supabase Production
```sql
-- Generated equivalent with RLS considerations
BEGIN;

ALTER TABLE public."user" 
ADD COLUMN phone_number varchar;

-- Update RLS policies if needed
CREATE POLICY "Users can update own phone" ON public."user"
  FOR UPDATE USING (auth.uid() = id);

COMMIT;
```

## Automation Scripts

### 1. Migration Generator
Converts TypeORM migrations to Supabase-compatible SQL

### 2. Schema Validator
Compares local and production schemas to detect drift

### 3. Migration Deployer
Provides guided deployment process with safety checks

## Emergency Procedures

### 1. Failed Migration
- Immediately rollback using down() method
- Restore from backup if necessary
- Investigate and fix issues locally
- Re-deploy with corrected migration

### 2. Schema Drift
- Run schema comparison tool
- Generate corrective migrations
- Apply in controlled manner
- Update documentation

### 3. Data Corruption
- Stop application immediately
- Restore from latest backup
- Investigate root cause
- Implement additional safeguards