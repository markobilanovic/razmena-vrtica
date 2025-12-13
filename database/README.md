# Database Files

This directory contains all database-related files organized by purpose.

## 📁 Directory Structure

### 📋 Schemas (`schemas/`)
- `schema.sql` - Current development schema dump
- `supabase-schema.sql` - Production-ready Supabase schema
- `init-schema.sql` - Initial schema setup
- `init-schema-builtin-uuid.sql` - Schema with built-in UUID generation

### 🌱 Seeds (`seeds/`)
- `kindergarten-seed.sql` - Kindergarten data for Serbia

### 🔄 Migrations (`migrations/`)
- Reserved for future TypeORM migration exports

### 📦 Backups
- `backup.sql` - Database backup file

## 🚀 Usage

### Development (Docker)
```bash
# Use TypeORM synchronization for rapid development
npm run start:dev
```

### Production (Supabase)
```bash
# Apply schema to Supabase
# Copy contents of supabase-schema.sql to Supabase SQL Editor

# Seed kindergarten data
# Copy contents of kindergarten-seed.sql to Supabase SQL Editor
```

## 📖 Related Documentation

- [Migration Strategy](../docs/database/MIGRATION_STRATEGY.md)
- [Schema Management Strategy](../docs/database/SCHEMA_MANAGEMENT_STRATEGY.md)
- [Data Backup Strategy](../docs/database/DATA_BACKUP_STRATEGY.md)
- [Database Querying Guide](../docs/database/QUERY_DB.md)