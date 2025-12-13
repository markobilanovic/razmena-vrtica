# Schema Management Strategy

## Overview

This document outlines a scalable approach to manage database schemas across different environments (local Docker, Supabase production) while using TypeORM as the single source of truth.

## Architecture

```
TypeORM Entities (Source of Truth)
    ↓
Local Development (Docker PostgreSQL)
    ↓
Schema Generation Scripts
    ↓
Production (Supabase PostgreSQL)
```

## 1. Development Workflow

### Local Development (Docker)
- Use TypeORM synchronization for rapid development
- Run migrations for schema changes
- Test all changes locally first

### Production Deployment
- Generate SQL from TypeORM entities
- Add Supabase-specific features (RLS, functions)
- Apply changes manually to Supabase

## 2. Schema Generation Pipeline

### Step 1: Generate Base Schema
```bash
# Generate core schema from TypeORM entities
npm run generate-schema > generated-schema.sql
```

### Step 2: Add Supabase Features
```bash
# Combine with Supabase-specific additions
npm run generate-supabase-schema
```

### Step 3: Apply to Production
```bash
# Review and apply to Supabase
# (Manual step for safety)
```

## 3. File Structure

```
backend/
├── src/
│   ├── entities/           # TypeORM entities (source of truth)
│   ├── migrations/         # TypeORM migrations for local dev
│   └── scripts/
│       ├── generate-production-schema.ts    # Base schema generator
│       ├── generate-supabase-schema.ts      # Supabase-specific generator
│       └── apply-supabase-schema.ts         # Deployment helper
├── schemas/
│   ├── generated-schema.sql      # Generated from entities
│   ├── supabase-additions.sql    # RLS policies, functions, etc.
│   └── supabase-complete.sql     # Final combined schema
```

## 4. Implementation Steps

### A. Enhanced Schema Generator
Create a more robust schema generator that:
- Generates accurate PostgreSQL DDL from TypeORM entities
- Handles enums, indexes, and constraints properly
- Outputs clean, production-ready SQL

### B. Supabase Additions Template
Create separate files for Supabase-specific features:
- RLS policies
- Custom functions
- Triggers
- Auth integration

### C. Schema Validation
Add validation to ensure:
- Local and production schemas match
- All migrations are applied
- No breaking changes

### D. Deployment Automation
Create scripts to:
- Generate complete Supabase schema
- Validate changes before deployment
- Backup existing data
- Apply changes safely

## 5. Benefits

- **Single Source of Truth**: TypeORM entities define the schema
- **Environment Parity**: Same schema across local and production
- **Safe Deployments**: Manual review of all production changes
- **Supabase Integration**: Leverage Supabase features without conflicts
- **Version Control**: All schema changes tracked in git

## 6. Migration Strategy

### For Existing Data
1. Generate current schema from entities
2. Compare with existing Supabase schema
3. Create migration scripts for differences
4. Test migrations on backup data
5. Apply to production during maintenance window

### For Future Changes
1. Update TypeORM entities
2. Create TypeORM migration for local dev
3. Generate new production schema
4. Review changes and apply to Supabase
5. Update documentation

## 7. Best Practices

- Always test schema changes locally first
- Use transactions for multi-statement changes
- Backup data before major schema changes
- Document all manual Supabase customizations
- Keep RLS policies in version control
- Regular schema validation between environments

## Complete Migration Workflow

### Step 1: Local Development
```bash
# Make entity changes
# Generate migration
npm run typeorm migration:generate -- src/migrations/AddNewFeature -d src/data-source.ts

# Test locally
npm run typeorm migration:run -- -d src/data-source.ts

# Verify changes work
npm run start:dev
```

### Step 2: Generate Production SQL
```bash
# Convert TypeORM migration to Supabase SQL
npm run generate-migration-sql AddNewFeature

# Review generated file in supabase-migrations/
```

### Step 3: Schema Validation
```bash
# Compare schemas to detect any drift
npm run compare-schemas

# Review differences and plan corrections
```

### Step 4: Production Deployment
```bash
# Use deployment helper
npm run deploy-supabase

# Follow the guided deployment process
```

## Available Scripts

- `npm run generate-migration-sql MigrationName` - Convert TypeORM migration to Supabase SQL
- `npm run compare-schemas` - Compare local vs production schemas
- `npm run deploy-supabase` - Guided deployment helper
- `npm run generate-supabase-schema` - Generate complete schema from entities