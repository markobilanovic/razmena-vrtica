#!/usr/bin/env node

/**
 * Production Database Creation Script
 * 
 * This script creates the production database schema directly from TypeORM entities
 * without using migrations. It's designed for initial production setup.
 * 
 * Usage:
 * npm run create-prod-db
 * 
 * Environment Variables Required:
 * - DATABASE_URL or individual DB connection params
 * - NODE_ENV=production (recommended)
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import { Child } from '../entities/child.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';
import { HiddenMatch } from '../entities/hidden-match.entity';

// Load environment variables
config();

async function createProductionDatabase() {
  console.log('🚀 Starting production database creation...');
  
  // Validate required environment variables
  if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_NAME)) {
    console.error('❌ Missing required database configuration');
    console.error('Either provide DATABASE_URL or DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD');
    process.exit(1);
  }

  // Create data source with synchronize enabled for schema creation
  const dataSource = new DataSource({
    type: 'postgres',
    // Support both individual params and connection string
    ...(process.env.DATABASE_URL
      ? { url: process.env.DATABASE_URL }
      : {
          host: process.env.DB_HOST!,
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME!,
          password: process.env.DB_PASSWORD!,
          database: process.env.DB_NAME!,
        }),
    // Enable SSL for production
    ssl:
      process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false'
        ? { rejectUnauthorized: false }
        : false,
    entities: [
      User,
      Kindergarten,
      Child,
      Wishlist,
      MatchGroup,
      MatchParticipant,
      HiddenMatch,
    ],
    // Enable synchronize to create schema from entities
    synchronize: true,
    // Enable logging to see what's being created
    logging: true,
    // Drop schema before creating (BE CAREFUL - this will delete existing data)
    dropSchema: process.env.DROP_SCHEMA === 'true',
  });

  try {
    console.log('📡 Connecting to database...');
    await dataSource.initialize();
    
    console.log('✅ Database connection established');
    console.log('🏗️  Creating database schema from entities...');
    
    // The synchronize: true option will automatically create the schema
    // Let's also run a simple query to verify everything works
    const result = await dataSource.query('SELECT NOW() as current_time');
    console.log('⏰ Database time:', result[0].current_time);
    
    // List all created tables
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    console.log('✅ Production database schema created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating production database:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  createProductionDatabase()
    .then(() => {
      console.log('🎉 Production database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { createProductionDatabase };