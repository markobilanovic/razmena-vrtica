#!/usr/bin/env node

/**
 * Supabase Schema Generator
 * 
 * Generates a complete Supabase-compatible schema by combining:
 * 1. Base schema from TypeORM entities
 * 2. Supabase-specific features (RLS, auth integration, etc.)
 * 
 * Usage:
 * npm run generate-supabase-schema > supabase-complete.sql
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

async function generateSupabaseSchema() {
  console.log('-- Supabase Complete Schema');
  console.log('-- Generated from TypeORM entities with Supabase additions');
  console.log('-- Date:', new Date().toISOString());
  console.log('-- WARNING: Review this schema before applying to production');
  console.log('');

  // Generate base schema
  await generateBaseSchema();
  
  // Add Supabase-specific features
  generateSupabaseAdditions();
}

async function generateBaseSchema() {
  console.log('-- =====================================================');
  console.log('-- PART 1: BASE SCHEMA FROM TYPEORM ENTITIES');
  console.log('-- =====================================================');
  console.log('');

  // Create enum types
  console.log('-- Create custom enum types');
  console.log(`CREATE TYPE public.child_gender_enum AS ENUM (
    'MALE',
    'FEMALE'
);`);
  console.log('');

  console.log(`CREATE TYPE public.child_group_enum AS ENUM (
    'MLADJA_JASLENA',
    'STARIJA_JASLENA',
    'MLADJA',
    'SREDNJA',
    'STARIJA',
    'NAJSTARIJA'
);`);
  console.log('');

  console.log(`CREATE TYPE public.match_group_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);`);
  console.log('');

  // Create tables
  console.log('-- Create tables');
  
  // User table
  console.log(`CREATE TABLE public."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    full_name character varying NOT NULL,
    password_hash character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email_confirmed boolean DEFAULT false NOT NULL,
    email_confirmation_token character varying,
    email_confirmation_token_expires timestamp without time zone,
    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id),
    CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email)
);`);
  console.log('');

  // Kindergarten table
  console.log(`CREATE TABLE public.kindergarten (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    city character varying NOT NULL,
    address character varying NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    CONSTRAINT "PK_f164358e4100850116659a0cf0a" PRIMARY KEY (id)
);`);
  console.log('');

  // Child table
  console.log(`CREATE TABLE public.child (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    current_kindergarten_id uuid NOT NULL,
    name character varying NOT NULL,
    birth_date date,
    age_group integer,
    gender public.child_gender_enum,
    "group" public.child_group_enum NOT NULL,
    CONSTRAINT "PK_4609b9b323ca37c6bc435ec4b6b" PRIMARY KEY (id),
    CONSTRAINT "FK_4157a24f3378c1e06ae3a942868" FOREIGN KEY (parent_id) REFERENCES public."user"(id),
    CONSTRAINT "FK_2be796466dfc768b4c5167ede5a" FOREIGN KEY (current_kindergarten_id) REFERENCES public.kindergarten(id)
);`);
  console.log('');

  // Wishlist table
  console.log(`CREATE TABLE public.wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    child_id uuid NOT NULL,
    target_kindergarten_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY (id),
    CONSTRAINT "FK_3cf3c335eb534021f1a262f8fc7" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE CASCADE,
    CONSTRAINT "FK_24db5a54d6a2684ef3df2fc0c6f" FOREIGN KEY (target_kindergarten_id) REFERENCES public.kindergarten(id)
);`);
  console.log('');

  // MatchGroup table
  console.log(`CREATE TABLE public.match_group (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status public.match_group_status_enum DEFAULT 'ACTIVE'::public.match_group_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_c4771d1b75b824a92fd9bd2b545" PRIMARY KEY (id)
);`);
  console.log('');

  // MatchParticipant table
  console.log(`CREATE TABLE public.match_participant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_group_id uuid NOT NULL,
    child_id uuid,
    next_child_id uuid,
    has_accepted boolean DEFAULT false NOT NULL,
    CONSTRAINT "PK_deab53592edf83accdc8110a0f0" PRIMARY KEY (id),
    CONSTRAINT "FK_961f3328be5596fd3ddf23a87dd" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id),
    CONSTRAINT "FK_4ae2c8b198162533ea3e6f200e5" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE SET NULL,
    CONSTRAINT "FK_71d26a1ff395dc3f03196a1ed75" FOREIGN KEY (next_child_id) REFERENCES public.child(id) ON DELETE SET NULL
);`);
  console.log('');

  // HiddenMatch table
  console.log(`CREATE TABLE public.hidden_match (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    match_group_id uuid NOT NULL,
    hidden_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_2a3ff66aa668d74a10ab97b03a5" PRIMARY KEY (id),
    CONSTRAINT "FK_11e8b32d185acdc4575d5f96820" FOREIGN KEY (user_id) REFERENCES public."user"(id),
    CONSTRAINT "FK_6ce9e4174369e34d26717968ecb" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id)
);`);
  console.log('');

  // Create indexes
  console.log('-- Create indexes for performance');
  console.log('CREATE INDEX IF NOT EXISTS "idx_user_email" ON public."user"(email);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_user_email_confirmation_token" ON public."user"(email_confirmation_token);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_child_parent_id" ON public.child(parent_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_child_kindergarten_id" ON public.child(current_kindergarten_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_child_group" ON public.child("group");');
  console.log('CREATE INDEX IF NOT EXISTS "idx_wishlist_child_id" ON public.wishlist(child_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_wishlist_target_kindergarten_id" ON public.wishlist(target_kindergarten_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_match_group_status" ON public.match_group(status);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_match_group_created_at" ON public.match_group(created_at);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_match_participant_match_group_id" ON public.match_participant(match_group_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_match_participant_child_id" ON public.match_participant(child_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_match_participant_next_child_id" ON public.match_participant(next_child_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_hidden_match_user_id" ON public.hidden_match(user_id);');
  console.log('CREATE INDEX IF NOT EXISTS "idx_hidden_match_match_group_id" ON public.hidden_match(match_group_id);');
  console.log('');
}

function generateSupabaseAdditions() {
  console.log('-- =====================================================');
  console.log('-- PART 2: SUPABASE-SPECIFIC FEATURES');
  console.log('-- =====================================================');
  console.log('');

  // Enable RLS
  console.log('-- Enable Row Level Security (RLS)');
  console.log('ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE public.kindergarten ENABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE public.child ENABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE public.match_group ENABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE public.match_participant ENABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE public.hidden_match ENABLE ROW LEVEL SECURITY;');
  console.log('');

  // RLS Policies
  console.log('-- Row Level Security Policies');
  console.log('');

  // User policies
  console.log('-- User policies');
  console.log(`CREATE POLICY "Users can view own profile" ON public."user"
    FOR SELECT USING (auth.uid() = id);`);
  console.log('');

  console.log(`CREATE POLICY "Users can update own profile" ON public."user"
    FOR UPDATE USING (auth.uid() = id);`);
  console.log('');

  // Kindergarten policies (public read-only)
  console.log('-- Kindergarten policies (public read-only)');
  console.log(`CREATE POLICY "Authenticated users can view kindergartens" ON public.kindergarten
    FOR SELECT TO authenticated USING (true);`);
  console.log('');

  // Child policies
  console.log('-- Child policies');
  console.log(`CREATE POLICY "Users can view own children" ON public.child
    FOR SELECT USING (auth.uid() = parent_id);`);
  console.log('');

  console.log(`CREATE POLICY "Users can manage own children" ON public.child
    FOR ALL USING (auth.uid() = parent_id);`);
  console.log('');

  // Wishlist policies
  console.log('-- Wishlist policies');
  console.log(`CREATE POLICY "Users can view own wishlists" ON public.wishlist
    FOR SELECT USING (auth.uid() = (SELECT parent_id FROM public.child WHERE id = child_id));`);
  console.log('');

  console.log(`CREATE POLICY "Users can manage own wishlists" ON public.wishlist
    FOR ALL USING (auth.uid() = (SELECT parent_id FROM public.child WHERE id = child_id));`);
  console.log('');

  // Match policies
  console.log('-- Match policies');
  console.log(`CREATE POLICY "Users can view relevant matches" ON public.match_group
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.match_participant mp
            JOIN public.child c ON mp.child_id = c.id
            WHERE mp.match_group_id = match_group.id AND c.parent_id = auth.uid()
        )
    );`);
  console.log('');

  console.log(`CREATE POLICY "Users can view relevant match participants" ON public.match_participant
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.child c
            WHERE (c.id = child_id OR c.id = next_child_id) AND c.parent_id = auth.uid()
        )
    );`);
  console.log('');

  console.log(`CREATE POLICY "Users can update match acceptance" ON public.match_participant
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.child c
            WHERE c.id = child_id AND c.parent_id = auth.uid()
        )
    );`);
  console.log('');

  // Hidden match policies
  console.log('-- Hidden match policies');
  console.log(`CREATE POLICY "Users can manage own hidden matches" ON public.hidden_match
    FOR ALL USING (auth.uid() = user_id);`);
  console.log('');

  // Utility functions
  console.log('-- Utility functions');
  console.log(`-- Function to get user's children count
CREATE OR REPLACE FUNCTION public.get_user_children_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::integer
    FROM public.child
    WHERE parent_id = user_uuid;
$$;`);
  console.log('');

  console.log(`-- Function to check if user owns child
CREATE OR REPLACE FUNCTION public.user_owns_child(user_uuid uuid, child_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.child
        WHERE id = child_uuid AND parent_id = user_uuid
    );
$$;`);
  console.log('');

  // Triggers for updated_at (if needed in future)
  console.log('-- Triggers (for future use)');
  console.log(`-- CREATE OR REPLACE FUNCTION public.update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = now();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';`);
  console.log('');

  console.log('-- Schema generation completed');
  console.log('-- Review this file before applying to Supabase');
}

// Run the script
if (require.main === module) {
  generateSupabaseSchema()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateSupabaseSchema };