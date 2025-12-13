#!/usr/bin/env node

/**
 * Schema Comparison Tool
 * 
 * Compares local TypeORM schema with production Supabase schema
 * Detects drift and suggests corrective actions
 * 
 * Usage:
 * npm run compare-schemas
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AppDataSource } from '../data-source';

// Load environment variables
config();

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
}

interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
}

interface ConstraintInfo {
  name: string;
  type: string;
  definition: string;
}

async function compareSchemas() {
  console.log('🔍 Schema Comparison Tool');
  console.log('========================');
  console.log('');

  try {
    // Get local schema from TypeORM
    console.log('📋 Analyzing local TypeORM schema...');
    const localSchema = await getLocalSchema();
    
    // Get production schema (would need Supabase connection)
    console.log('🌐 Analyzing production Supabase schema...');
    console.log('   (Note: This requires Supabase connection configuration)');
    
    // For now, generate comparison template
    generateComparisonReport(localSchema);
    
  } catch (error) {
    console.error('❌ Error comparing schemas:', error);
    process.exit(1);
  }
}

async function getLocalSchema(): Promise<TableInfo[]> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const tables: TableInfo[] = [];
  
  // Get all entity metadata
  const entities = AppDataSource.entityMetadatas;
  
  for (const entity of entities) {
    const tableInfo: TableInfo = {
      name: entity.tableName,
      columns: [],
      indexes: [],
      constraints: []
    };

    // Get columns
    for (const column of entity.columns) {
      tableInfo.columns.push({
        name: column.databaseName,
        type: column.type as string,
        nullable: column.isNullable,
        default: column.default?.toString()
      });
    }

    // Get indexes
    for (const index of entity.indices) {
      tableInfo.indexes.push({
        name: index.name || `idx_${entity.tableName}_${index.columns.join('_')}`,
        columns: index.columns.map(col => col.databaseName),
        unique: index.isUnique || false
      });
    }

    // Get foreign key constraints
    for (const fk of entity.foreignKeys) {
      tableInfo.constraints.push({
        name: fk.name || `fk_${entity.tableName}_${fk.columnNames.join('_')}`,
        type: 'FOREIGN KEY',
        definition: `FOREIGN KEY (${fk.columnNames.join(', ')}) REFERENCES ${fk.referencedTablePath}(${fk.referencedColumnNames.join(', ')})`
      });
    }

    tables.push(tableInfo);
  }

  return tables;
}

function generateComparisonReport(localSchema: TableInfo[]) {
  console.log('📊 Local Schema Analysis');
  console.log('========================');
  console.log('');

  console.log(`Found ${localSchema.length} tables in local schema:`);
  console.log('');

  localSchema.forEach(table => {
    console.log(`📋 Table: ${table.name}`);
    console.log(`   Columns: ${table.columns.length}`);
    console.log(`   Indexes: ${table.indexes.length}`);
    console.log(`   Constraints: ${table.constraints.length}`);
    console.log('');
  });

  // Generate SQL for schema validation
  console.log('🔍 Schema Validation Queries');
  console.log('============================');
  console.log('');
  console.log('-- Run these queries in Supabase to compare with local schema:');
  console.log('');

  // Table existence check
  console.log('-- 1. Check table existence');
  console.log(`SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (${localSchema.map(t => `'${t.name}'`).join(', ')})
ORDER BY table_name;`);
  console.log('');

  // Column comparison
  console.log('-- 2. Check column definitions');
  localSchema.forEach(table => {
    console.log(`-- Table: ${table.name}`);
    console.log(`SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = '${table.name}'
ORDER BY ordinal_position;`);
    console.log('');
  });

  // Index comparison
  console.log('-- 3. Check indexes');
  console.log(`SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN (${localSchema.map(t => `'${t.name}'`).join(', ')})
ORDER BY tablename, indexname;`);
  console.log('');

  // Constraint comparison
  console.log('-- 4. Check constraints');
  console.log(`SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (${localSchema.map(t => `'${t.name}'`).join(', ')})
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;`);
  console.log('');

  // RLS policies check
  console.log('-- 5. Check RLS policies');
  console.log(`SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (${localSchema.map(t => `'${t.name}'`).join(', ')})
ORDER BY tablename, policyname;`);
  console.log('');

  console.log('📋 Manual Comparison Steps:');
  console.log('===========================');
  console.log('');
  console.log('1. Run the above queries in Supabase SQL Editor');
  console.log('2. Compare results with local schema expectations');
  console.log('3. Note any differences in:');
  console.log('   - Missing/extra tables');
  console.log('   - Column type mismatches');
  console.log('   - Missing/extra indexes');
  console.log('   - Constraint differences');
  console.log('   - RLS policy gaps');
  console.log('');
  console.log('4. Generate corrective migrations if needed');
  console.log('5. Test migrations on staging environment');
  console.log('6. Apply to production with proper backup');
  console.log('');

  // Generate expected schema summary
  console.log('📋 Expected Schema Summary:');
  console.log('==========================');
  console.log('');
  
  localSchema.forEach(table => {
    console.log(`Table: ${table.name}`);
    table.columns.forEach(col => {
      console.log(`  - ${col.name}: ${col.type}${col.nullable ? ' NULL' : ' NOT NULL'}${col.default ? ` DEFAULT ${col.default}` : ''}`);
    });
    if (table.indexes.length > 0) {
      console.log('  Indexes:');
      table.indexes.forEach(idx => {
        console.log(`    - ${idx.name}: (${idx.columns.join(', ')})${idx.unique ? ' UNIQUE' : ''}`);
      });
    }
    console.log('');
  });
}

// Run the script
if (require.main === module) {
  compareSchemas()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { compareSchemas };