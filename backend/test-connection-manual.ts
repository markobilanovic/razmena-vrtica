#!/usr/bin/env ts-node

/**
 * Manual connection test script
 * Use this to test different connection strings
 */

import { DataSource } from 'typeorm';

async function testConnection(connectionUrl: string) {
  console.log('🔍 Testing connection...');
  console.log(`🔗 URL: ${connectionUrl.replace(/:[^:@]*@/, ':***@')}`);

  const testDataSource = new DataSource({
    type: 'postgres',
    url: connectionUrl,
    ssl: { rejectUnauthorized: false },
    logging: false,
  });

  try {
    console.log('🔌 Connecting...');
    await testDataSource.initialize();
    console.log('✅ Successfully connected!');

    // Test basic query
    const result = await testDataSource.query('SELECT version()');
    console.log('✅ PostgreSQL version:', result[0].version.split(' ')[1]);

    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  } finally {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  }
}

// Example usage:
// Replace with your actual connection string from Supabase dashboard
const connectionUrl = process.argv[2];

if (!connectionUrl) {
  console.log('Usage: ts-node test-connection-manual.ts "postgresql://postgres.PROJECT_REF:PASSWORD@HOST:PORT/postgres"');
  console.log('');
  console.log('Example:');
  console.log('ts-node test-connection-manual.ts "postgresql://postgres.abcdefg:mypassword@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"');
  process.exit(1);
}

testConnection(connectionUrl).catch(console.error);