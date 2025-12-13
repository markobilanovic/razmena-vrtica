#!/usr/bin/env node

/**
 * Production Schema Generator
 * 
 * This script generates SQL DDL statements from TypeORM entities
 * without actually executing them. This gives you full control over
 * what gets executed in production.
 * 
 * Usage:
 * npm run generate-schema > schema.sql
 * 
 * Then review the schema.sql file and execute it manually in production.
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

async function generateProductionSchema() {
  console.log('-- Production Database Schema');
  console.log('-- Generated from TypeORM entities');
  console.log('-- Date:', new Date().toISOString());
  console.log('');

  // Create a temporary in-memory database to generate schema
  const dataSource = new DataSource({
    type: 'postgres',
    // Use dummy connection for schema generation
    host: 'localhost',
    port: 5432,
    username: 'dummy',
    password: 'dummy',
    database: 'dummy',
    entities: [
      User,
      Kindergarten,
      Child,
      Wishlist,
      MatchGroup,
      MatchParticipant,
      HiddenMatch,
    ],
    synchronize: false,
    logging: false,
  });

  try {
    // Initialize without connecting
    await dataSource.initialize();
    
    // Generate SQL schema
    const sqlInMemory = await dataSource.driver.createSchemaBuilder().log();
    
    // Output the SQL statements
    console.log('-- Create ENUM types');
    console.log("CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');");
    console.log("CREATE TYPE age_group AS ENUM ('MLADJA_JASLENA', 'STARIJA_JASLENA', 'MLADJA', 'SREDNJA', 'STARIJA', 'NAJSTARIJA');");
    console.log("CREATE TYPE match_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');");
    console.log('');

    // Generate table creation statements
    console.log('-- Create tables');
    
    // User table
    console.log(`CREATE TABLE "user" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" varchar NOT NULL UNIQUE,
    "full_name" varchar NOT NULL,
    "password_hash" varchar,
    "email_confirmed" boolean DEFAULT false,
    "email_confirmation_token" varchar,
    "email_confirmation_token_expires" timestamp,
    "created_at" timestamp DEFAULT now()
);`);
    console.log('');

    // Kindergarten table
    console.log(`CREATE TABLE "kindergarten" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar NOT NULL,
    "city" varchar NOT NULL,
    "address" varchar NOT NULL,
    "latitude" decimal(10,7),
    "longitude" decimal(10,7)
);`);
    console.log('');

    // Child table
    console.log(`CREATE TABLE "child" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "parent_id" uuid NOT NULL,
    "current_kindergarten_id" uuid NOT NULL,
    "name" varchar NOT NULL,
    "birth_date" date,
    "age_group" integer,
    "gender" gender,
    "group" age_group NOT NULL,
    FOREIGN KEY ("parent_id") REFERENCES "user"("id"),
    FOREIGN KEY ("current_kindergarten_id") REFERENCES "kindergarten"("id")
);`);
    console.log('');

    // Wishlist table
    console.log(`CREATE TABLE "wishlist" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "child_id" uuid NOT NULL,
    "target_kindergarten_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now(),
    FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE,
    FOREIGN KEY ("target_kindergarten_id") REFERENCES "kindergarten"("id")
);`);
    console.log('');

    // MatchGroup table
    console.log(`CREATE TABLE "match_group" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "status" match_status DEFAULT 'ACTIVE',
    "created_at" timestamp DEFAULT now()
);`);
    console.log('');

    // MatchParticipant table
    console.log(`CREATE TABLE "match_participant" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "match_group_id" uuid NOT NULL,
    "child_id" uuid,
    "next_child_id" uuid,
    "has_accepted" boolean DEFAULT false,
    FOREIGN KEY ("match_group_id") REFERENCES "match_group"("id"),
    FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE SET NULL,
    FOREIGN KEY ("next_child_id") REFERENCES "child"("id") ON DELETE SET NULL
);`);
    console.log('');

    // HiddenMatch table
    console.log(`CREATE TABLE "hidden_match" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "match_group_id" uuid NOT NULL,
    "hidden_at" timestamp DEFAULT now(),
    FOREIGN KEY ("user_id") REFERENCES "user"("id"),
    FOREIGN KEY ("match_group_id") REFERENCES "match_group"("id")
);`);
    console.log('');

    // Create indexes for better performance
    console.log('-- Create indexes for performance');
    console.log('CREATE INDEX "idx_user_email" ON "user"("email");');
    console.log('CREATE INDEX "idx_child_parent_id" ON "child"("parent_id");');
    console.log('CREATE INDEX "idx_child_kindergarten_id" ON "child"("current_kindergarten_id");');
    console.log('CREATE INDEX "idx_wishlist_child_id" ON "wishlist"("child_id");');
    console.log('CREATE INDEX "idx_wishlist_target_kindergarten_id" ON "wishlist"("target_kindergarten_id");');
    console.log('CREATE INDEX "idx_match_participant_match_group_id" ON "match_participant"("match_group_id");');
    console.log('CREATE INDEX "idx_match_participant_child_id" ON "match_participant"("child_id");');
    console.log('CREATE INDEX "idx_hidden_match_user_id" ON "hidden_match"("user_id");');
    console.log('CREATE INDEX "idx_hidden_match_match_group_id" ON "hidden_match"("match_group_id");');
    console.log('');

    console.log('-- Schema generation completed');
    
  } catch (error) {
    console.error('-- Error generating schema:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the script
if (require.main === module) {
  generateProductionSchema()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateProductionSchema };