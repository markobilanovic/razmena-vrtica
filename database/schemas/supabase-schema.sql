-- Supabase Schema for Razmena Vrtica
-- Run this in the Supabase SQL Editor

-- Create custom enum types
CREATE TYPE public.child_gender_enum AS ENUM (
    'MALE',
    'FEMALE'
);

CREATE TYPE public.child_group_enum AS ENUM (
    'MLADJA_JASLENA',
    'STARIJA_JASLENA',
    'MLADJA',
    'SREDNJA',
    'STARIJA',
    'NAJSTARIJA'
);

CREATE TYPE public.match_group_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);

-- Create tables
CREATE TABLE public."user" (
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
);

CREATE TABLE public.kindergarten (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    city character varying NOT NULL,
    address character varying NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    CONSTRAINT "PK_f164358e4100850116659a0cf0a" PRIMARY KEY (id)
);

CREATE TABLE public.child (
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
);

CREATE TABLE public.wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    child_id uuid NOT NULL,
    target_kindergarten_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY (id),
    CONSTRAINT "FK_3cf3c335eb534021f1a262f8fc7" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE CASCADE,
    CONSTRAINT "FK_24db5a54d6a2684ef3df2fc0c6f" FOREIGN KEY (target_kindergarten_id) REFERENCES public.kindergarten(id)
);

CREATE TABLE public.match_group (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status public.match_group_status_enum DEFAULT 'ACTIVE'::public.match_group_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_c4771d1b75b824a92fd9bd2b545" PRIMARY KEY (id)
);

CREATE TABLE public.match_participant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_group_id uuid NOT NULL,
    child_id uuid,
    next_child_id uuid,
    has_accepted boolean DEFAULT false NOT NULL,
    CONSTRAINT "PK_deab53592edf83accdc8110a0f0" PRIMARY KEY (id),
    CONSTRAINT "FK_961f3328be5596fd3ddf23a87dd" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id),
    CONSTRAINT "FK_4ae2c8b198162533ea3e6f200e5" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE SET NULL,
    CONSTRAINT "FK_71d26a1ff395dc3f03196a1ed75" FOREIGN KEY (next_child_id) REFERENCES public.child(id) ON DELETE SET NULL
);

CREATE TABLE public.hidden_match (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    match_group_id uuid NOT NULL,
    hidden_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_2a3ff66aa668d74a10ab97b03a5" PRIMARY KEY (id),
    CONSTRAINT "FK_11e8b32d185acdc4575d5f96820" FOREIGN KEY (user_id) REFERENCES public."user"(id),
    CONSTRAINT "FK_6ce9e4174369e34d26717968ecb" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id)
);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kindergarten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_match ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your needs)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public."user"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public."user"
    FOR UPDATE USING (auth.uid() = id);

-- Children policies
CREATE POLICY "Users can view own children" ON public.child
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Users can manage own children" ON public.child
    FOR ALL USING (auth.uid() = parent_id);

-- Wishlist policies
CREATE POLICY "Users can view own wishlists" ON public.wishlist
    FOR SELECT USING (auth.uid() = (SELECT parent_id FROM public.child WHERE id = child_id));

CREATE POLICY "Users can manage own wishlists" ON public.wishlist
    FOR ALL USING (auth.uid() = (SELECT parent_id FROM public.child WHERE id = child_id));

-- Kindergarten is public (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view kindergartens" ON public.kindergarten
    FOR SELECT TO authenticated USING (true);

-- Match-related policies (users can see matches involving their children)
CREATE POLICY "Users can view relevant matches" ON public.match_group
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.match_participant mp
            JOIN public.child c ON mp.child_id = c.id
            WHERE mp.match_group_id = match_group.id AND c.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can view relevant match participants" ON public.match_participant
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.child c
            WHERE (c.id = child_id OR c.id = next_child_id) AND c.parent_id = auth.uid()
        )
    );

-- Hidden matches policies
CREATE POLICY "Users can manage own hidden matches" ON public.hidden_match
    FOR ALL USING (auth.uid() = user_id);