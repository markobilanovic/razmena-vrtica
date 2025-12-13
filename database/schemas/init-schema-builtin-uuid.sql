--
-- PostgreSQL database dump (Modified for built-in UUID generation)
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: child_gender_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.child_gender_enum AS ENUM (
    'MALE',
    'FEMALE'
);


--
-- Name: child_group_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.child_group_enum AS ENUM (
    'MLADJA_JASLENA',
    'STARIJA_JASLENA',
    'MLADJA',
    'SREDNJA',
    'STARIJA',
    'NAJSTARIJA'
);


--
-- Name: match_group_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.match_group_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: child; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.child (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    current_kindergarten_id uuid NOT NULL,
    name character varying NOT NULL,
    birth_date date,
    age_group integer,
    gender public.child_gender_enum,
    "group" public.child_group_enum NOT NULL
);


--
-- Name: hidden_match; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hidden_match (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    match_group_id uuid NOT NULL,
    hidden_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: kindergarten; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kindergarten (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    city character varying NOT NULL,
    address character varying NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7)
);


--
-- Name: match_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_group (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status public.match_group_status_enum DEFAULT 'ACTIVE'::public.match_group_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: match_participant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_participant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_group_id uuid NOT NULL,
    child_id uuid,
    next_child_id uuid,
    has_accepted boolean DEFAULT false NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    full_name character varying NOT NULL,
    password_hash character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email_confirmed boolean DEFAULT false NOT NULL,
    email_confirmation_token character varying,
    email_confirmation_token_expires timestamp without time zone
);


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    child_id uuid NOT NULL,
    target_kindergarten_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: hidden_match PK_2a3ff66aa668d74a10ab97b03a5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hidden_match
    ADD CONSTRAINT "PK_2a3ff66aa668d74a10ab97b03a5" PRIMARY KEY (id);


--
-- Name: child PK_4609b9b323ca37c6bc435ec4b6b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT "PK_4609b9b323ca37c6bc435ec4b6b" PRIMARY KEY (id);


--
-- Name: wishlist PK_620bff4a240d66c357b5d820eaa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY (id);


--
-- Name: match_group PK_c4771d1b75b824a92fd9bd2b545; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_group
    ADD CONSTRAINT "PK_c4771d1b75b824a92fd9bd2b545" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: match_participant PK_deab53592edf83accdc8110a0f0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "PK_deab53592edf83accdc8110a0f0" PRIMARY KEY (id);


--
-- Name: kindergarten PK_f164358e4100850116659a0cf0a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kindergarten
    ADD CONSTRAINT "PK_f164358e4100850116659a0cf0a" PRIMARY KEY (id);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: hidden_match FK_11e8b32d185acdc4575d5f96820; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hidden_match
    ADD CONSTRAINT "FK_11e8b32d185acdc4575d5f96820" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: wishlist FK_24db5a54d6a2684ef3df2fc0c6f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "FK_24db5a54d6a2684ef3df2fc0c6f" FOREIGN KEY (target_kindergarten_id) REFERENCES public.kindergarten(id);


--
-- Name: child FK_2be796466dfc768b4c5167ede5a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT "FK_2be796466dfc768b4c5167ede5a" FOREIGN KEY (current_kindergarten_id) REFERENCES public.kindergarten(id);


--
-- Name: wishlist FK_3cf3c335eb534021f1a262f8fc7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "FK_3cf3c335eb534021f1a262f8fc7" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE CASCADE;


--
-- Name: child FK_4157a24f3378c1e06ae3a942868; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT "FK_4157a24f3378c1e06ae3a942868" FOREIGN KEY (parent_id) REFERENCES public."user"(id);


--
-- Name: match_participant FK_4ae2c8b198162533ea3e6f200e5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "FK_4ae2c8b198162533ea3e6f200e5" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE SET NULL;


--
-- Name: hidden_match FK_6ce9e4174369e34d26717968ecb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hidden_match
    ADD CONSTRAINT "FK_6ce9e4174369e34d26717968ecb" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id);


--
-- Name: match_participant FK_71d26a1ff395dc3f03196a1ed75; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "FK_71d26a1ff395dc3f03196a1ed75" FOREIGN KEY (next_child_id) REFERENCES public.child(id) ON DELETE SET NULL;


--
-- Name: match_participant FK_961f3328be5596fd3ddf23a87dd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "FK_961f3328be5596fd3ddf23a87dd" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id);


--
-- PostgreSQL database dump complete
--