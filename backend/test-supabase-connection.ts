#!/usr/bin/env ts-node

/**
 * Test Supabase connection script
 * Run with: npm run test:supabase
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Load production environment
config({ path: '.env.production' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  // Check environment variables
  const requiredVars = ['DATABASE_URL', 'NODE_ENV'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('💡 Make sure you have .env.production configured');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log(`📍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(
    `🔗 Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}\n`,
  );

  // Create test data source
  const testDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    logging: false,
  });

  try {
    console.log('🔌 Connecting to Supabase...');
    await testDataSource.initialize();
    console.log('✅ Successfully connected to Supabase!\n');

    // Test basic query
    console.log('🔍 Testing basic query...');
    const result = await testDataSource.query('SELECT version()');
    console.log(
      '✅ PostgreSQL version:',
      result[0].version.split(' ')[0],
      result[0].version.split(' ')[1],
    );

    // Check if our tables exist
    console.log('\n📋 Checking application tables...');
    const tables = await testDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'kindergartens', 'children', 'match_groups')
      ORDER BY table_name
    `);

    if (tables.length > 0) {
      console.log('✅ Found application tables:');
      tables.forEach((table: any) => console.log(`   - ${table.table_name}`));

      // Count records
      console.log('\n📊 Record counts:');
      for (const table of tables) {
        try {
          const count = await testDataSource.query(
            `SELECT COUNT(*) FROM ${table.table_name}`,
          );
          console.log(`   - ${table.table_name}: ${count[0].count} records`);
        } catch (error) {
          console.log(`   - ${table.table_name}: Error counting records`);
        }
      }
    } else {
      console.log('⚠️  No application tables found. Run migrations first:');
      console.log('   npm run migrate:prod');
    }

    console.log('\n🎉 Supabase connection test completed successfully!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);

    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Check your database password in the connection string');
      console.log('   - Verify the connection string format');
      console.log('   - Make sure your Supabase project is active');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Check your internet connection');
      console.log('   - Verify the Supabase project URL');
      console.log(
        '   - Try using the direct connection (port 5432) instead of pooler (6543)',
      );
    }

    process.exit(1);
  } finally {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  }
}

// Run the test
testSupabaseConnection().catch(console.error);
