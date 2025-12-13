#!/usr/bin/env node

/**
 * Migration SQL Generator
 * 
 * Converts TypeORM migrations to Supabase-compatible SQL
 * Handles RLS policy updates and Supabase-specific considerations
 * 
 * Usage:
 * npm run generate-migration-sql MigrationName
 * npm run generate-migration-sql -- --all  # Generate all pending migrations
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { AppDataSource } from '../data-source';

// Load environment variables
config();

interface MigrationInfo {
  name: string;
  timestamp: number;
  className: string;
  filePath: string;
}

async function generateMigrationSQL(migrationName?: string) {
  console.log('🔄 Migration SQL Generator for Supabase');
  console.log('=====================================');
  console.log('');

  try {
    // Initialize data source to get migration info
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const migrationsDir = join(process.cwd(), 'src', 'migrations');
    const outputDir = join(process.cwd(), 'supabase-migrations');
    
    // Create output directory if it doesn't exist
    try {
      const { execSync } = require('child_process');
      execSync(`mkdir -p ${outputDir}`);
    } catch (error) {
      // Directory might already exist
    }

    // Get migration files
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => {
        const match = file.match(/^(\d+)-(.+)\.ts$/);
        if (!match) return null;
        
        return {
          name: match[2],
          timestamp: parseInt(match[1]),
          className: match[2],
          filePath: join(migrationsDir, file)
        };
      })
      .filter(Boolean) as MigrationInfo[];

    // Filter by migration name if provided
    let targetMigrations = migrationFiles;
    if (migrationName && migrationName !== '--all') {
      targetMigrations = migrationFiles.filter(m => 
        m.name.toLowerCase().includes(migrationName.toLowerCase())
      );
      
      if (targetMigrations.length === 0) {
        console.error(`❌ No migration found matching: ${migrationName}`);
        process.exit(1);
      }
    }

    console.log(`📋 Found ${targetMigrations.length} migration(s) to process:`);
    targetMigrations.forEach(m => console.log(`   - ${m.name}`));
    console.log('');

    // Process each migration
    for (const migration of targetMigrations) {
      await processMigration(migration, outputDir);
    }

    console.log('✅ Migration SQL generation completed!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Review generated SQL files');
    console.log('2. Test on staging Supabase project');
    console.log('3. Apply to production Supabase');
    console.log('4. Update migration tracking');

  } catch (error) {
    console.error('❌ Error generating migration SQL:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

async function processMigration(migration: MigrationInfo, outputDir: string) {
  console.log(`🔄 Processing: ${migration.name}`);
  
  try {
    // Read migration file
    const migrationContent = readFileSync(migration.filePath, 'utf8');
    
    // Extract SQL queries from up() method
    const upQueries = extractQueriesFromMethod(migrationContent, 'up');
    const downQueries = extractQueriesFromMethod(migrationContent, 'down');
    
    // Generate Supabase-compatible SQL
    const supabaseSQL = generateSupabaseSQL(migration, upQueries, downQueries);
    
    // Write to output file
    const outputFile = join(outputDir, `${migration.timestamp}-${migration.name}.sql`);
    writeFileSync(outputFile, supabaseSQL);
    
    console.log(`   ✅ Generated: ${outputFile}`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${migration.name}:`, error);
  }
}

function extractQueriesFromMethod(content: string, method: 'up' | 'down'): string[] {
  const queries: string[] = [];
  
  // Simple regex to extract queries from queryRunner.query() calls
  const methodRegex = new RegExp(`public async ${method}\\([^}]+\\}`, 's');
  const methodMatch = content.match(methodRegex);
  
  if (methodMatch) {
    const methodContent = methodMatch[0];
    const queryRegex = /queryRunner\.query\(\s*`([^`]+)`/g;
    let match;
    
    while ((match = queryRegex.exec(methodContent)) !== null) {
      queries.push(match[1].trim());
    }
  }
  
  return queries;
}

function generateSupabaseSQL(migration: MigrationInfo, upQueries: string[], downQueries: string[]): string {
  const timestamp = new Date().toISOString();
  
  let sql = `-- Supabase Migration: ${migration.name}
-- Generated from TypeORM migration
-- Timestamp: ${migration.timestamp}
-- Generated at: ${timestamp}
-- 
-- IMPORTANT: Review this SQL before applying to production
-- Test on staging environment first

-- =====================================================
-- UP MIGRATION
-- =====================================================

BEGIN;

`;

  // Add up queries
  upQueries.forEach((query, index) => {
    sql += `-- Query ${index + 1}\n`;
    sql += `${query};\n\n`;
  });

  // Add RLS policy updates if needed
  sql += `-- Update RLS policies if needed
-- (Add any necessary policy updates here)

`;

  sql += `COMMIT;

-- =====================================================
-- ROLLBACK (DOWN MIGRATION)
-- =====================================================
-- Uncomment and run if rollback is needed

/*
BEGIN;

`;

  // Add down queries (commented out)
  downQueries.forEach((query, index) => {
    sql += `-- Rollback Query ${index + 1}\n`;
    sql += `${query};\n\n`;
  });

  sql += `COMMIT;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration was successful

-- Check table structure
-- \\d+ table_name

-- Verify data integrity
-- SELECT COUNT(*) FROM affected_table;

-- Test RLS policies
-- SET ROLE authenticated;
-- SELECT * FROM table_name LIMIT 1;

-- =====================================================
-- NOTES
-- =====================================================
-- Migration: ${migration.name}
-- Applied: [DATE TO BE FILLED MANUALLY]
-- Applied by: [NAME TO BE FILLED MANUALLY]
-- Rollback tested: [YES/NO TO BE FILLED MANUALLY]
`;

  return sql;
}

// Run the script
if (require.main === module) {
  const migrationName = process.argv[2];
  
  generateMigrationSQL(migrationName)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateMigrationSQL };