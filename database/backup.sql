--
-- PostgreSQL database dump
--

\restrict WetBQ0k1QhBe0Ybr1vUkcO76SPheFSoRS5rhtmgWXRatj05gdgVS69kGECuwSxm

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: child_gender_enum; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.child_gender_enum AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public.child_gender_enum OWNER TO admin;

--
-- Name: child_group_enum; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.child_group_enum AS ENUM (
    'MLADJA_JASLENA',
    'STARIJA_JASLENA',
    'MLADJA',
    'SREDNJA',
    'STARIJA',
    'NAJSTARIJA'
);


ALTER TYPE public.child_group_enum OWNER TO admin;

--
-- Name: match_group_status_enum; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.match_group_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.match_group_status_enum OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: child; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.child (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    parent_id uuid NOT NULL,
    current_kindergarten_id uuid NOT NULL,
    name character varying NOT NULL,
    birth_date date,
    age_group integer,
    gender public.child_gender_enum,
    "group" public.child_group_enum NOT NULL
);


ALTER TABLE public.child OWNER TO admin;

--
-- Name: hidden_match; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.hidden_match (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    match_group_id uuid NOT NULL,
    hidden_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.hidden_match OWNER TO admin;

--
-- Name: kindergarten; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.kindergarten (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    city character varying NOT NULL,
    address character varying NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7)
);


ALTER TABLE public.kindergarten OWNER TO admin;

--
-- Name: match_group; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.match_group (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status public.match_group_status_enum DEFAULT 'ACTIVE'::public.match_group_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.match_group OWNER TO admin;

--
-- Name: match_participant; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.match_participant (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    match_group_id uuid NOT NULL,
    child_id uuid,
    next_child_id uuid,
    has_accepted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.match_participant OWNER TO admin;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO admin;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO admin;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    full_name character varying NOT NULL,
    password_hash character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email_confirmed boolean DEFAULT false NOT NULL,
    email_confirmation_token character varying,
    email_confirmation_token_expires timestamp without time zone
);


ALTER TABLE public."user" OWNER TO admin;

--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.wishlist (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    child_id uuid NOT NULL,
    target_kindergarten_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wishlist OWNER TO admin;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: child; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.child (id, parent_id, current_kindergarten_id, name, birth_date, age_group, gender, "group") FROM stdin;
b8e3d169-2bef-406f-89e6-623e3ba29ec5	79fbd8c4-0cad-4d74-9173-d5de632ac973	e0dec026-e999-4000-96fa-b1bcdb04b701	Mila Kojić	2021-12-08	4	FEMALE	SREDNJA
b08615f8-f405-4e01-88b0-7bdc435f3a8e	ec43eb2f-d15e-4894-8a39-13c441433b71	a11fa503-172c-48ab-be4d-3d24ab59fe25	Petar Jovanović	2020-12-08	5	MALE	STARIJA
80af0ac2-140a-4a9d-894f-f932b6244f57	ec43eb2f-d15e-4894-8a39-13c441433b71	02c106d8-c6ae-4034-91cf-37000ae2f5cb	Dunja Jovanović	2023-12-08	2	FEMALE	STARIJA_JASLENA
92f11311-f99f-4bdf-b0d3-39e28681b076	1937c967-5cd3-4710-a329-156f160feb65	53c5ddb5-dff2-4263-b709-f248f2dd9b91	Vuk Petrović	2022-12-08	3	MALE	MLADJA
a1a2b4d0-0092-4aa4-8bb5-eddaf16fb637	7c6cb69d-6eb8-4ffe-8128-d1cd6a4c4ba6	e0067068-5077-4176-9c07-2118f943eb53	Sara Nikolić	2019-12-08	6	FEMALE	NAJSTARIJA
c01e3437-2d0d-4ade-b130-65ebac423efb	09764f32-78cf-4970-9965-a6bd1bdec118	aa14f141-8685-4af0-88dc-866171985ea1	Lazar Đorđević	2024-12-08	1	MALE	MLADJA_JASLENA
f51b950b-1fde-4821-949a-9a2dd8aa7b5a	bbb58287-e9f6-4cdf-a7ba-eb37963f081a	ad116821-4ca3-4979-b739-e1d8569e0528	Nina Stojanović	2021-12-08	4	FEMALE	SREDNJA
59360ce7-f0ad-4e13-985c-6e252c2b5996	49928174-6833-4489-9fe8-569ba96af0d8	5bf6ec98-2d26-43a8-a254-b06140198818	Mihajlo Ilić	2020-12-08	5	MALE	STARIJA
1beab3f3-7dfa-4acc-a2f7-23c3308cc115	54e32fda-6e91-48e5-9ed0-ebf0141399be	278234e6-1f06-4b70-8bee-6031927bd026	Una Marković	2023-12-08	2	FEMALE	STARIJA_JASLENA
72a2362b-1fda-4359-9431-aa2e285741bd	54e32fda-6e91-48e5-9ed0-ebf0141399be	3f692423-21eb-429b-a04b-597919221e4b	Vanja Marković	2021-12-08	4	MALE	SREDNJA
fb09f86e-ec32-4ae3-8851-b98be0f00288	c118cd79-590e-4b64-8246-9cf6bc081dea	54818442-c284-47b6-b577-7de9c6ce3b32	Kosta Kostić	2022-12-08	3	MALE	MLADJA
0909193f-2da4-4caf-a244-e4e7a49e2e0c	44096c34-209e-4075-88ec-495d51b0ef3e	e0dec026-e999-4000-96fa-b1bcdb04b701	Lena Vasić	2019-12-08	6	FEMALE	NAJSTARIJA
65e2fd9e-f617-4357-9ca5-94bfdec764d3	c42efc57-2fe2-43ba-9ac6-9c60aaebc563	c44269f9-4321-4b75-b87f-6febf0a92bf8	Ognjen Živković	2024-12-08	1	MALE	MLADJA_JASLENA
1b395694-1aa0-4ba8-96de-fbe430dc11be	37465a72-ed05-4cb8-9f23-964b78f12b3a	29fcdd55-2d0e-4d89-9579-c26ce0d26c13	Iva Tomić	2020-12-08	5	FEMALE	STARIJA
55d258e5-dc8a-4d4e-84c4-b97294ac90c4	b039d7ae-b958-4cbe-af50-953634578ade	62b66c19-dc31-4721-9faa-78b3646d97a9	Tadija Lukić	2023-12-08	2	MALE	STARIJA_JASLENA
22c445d2-6af5-4913-a77d-2e219b3ecbb6	9f4bfcb0-c0a1-4eb3-8f67-514aaf2d5c2b	2680aa94-0aaa-41a2-a1e4-84e775fe5091	Tara Bogdanović	2021-12-08	4	FEMALE	SREDNJA
5bf37919-4635-47da-b9ba-53638fc17719	e078459a-04e6-4bb1-a64a-7e16a6f36605	cf390a0e-3567-4b6c-9dcb-3dc3f0599d71	Viktor Ristić	2022-12-08	3	MALE	MLADJA
b732e88e-a2e9-49a7-971a-83a0c60e6e08	23141ff3-8a28-40d4-bac2-e31012e43430	a57ec9fd-faa6-4c25-88a6-a906cd6691ed	Anja Pavlović	2019-12-08	6	FEMALE	NAJSTARIJA
fcc9293c-138a-40f2-aa05-6729bb4297e5	176f872c-e2b0-4889-9814-2be1c93aa209	ce372331-d1e5-4c3d-8fe8-bfc1dec39816	Test	\N	\N	\N	MLADJA_JASLENA
\.


--
-- Data for Name: hidden_match; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.hidden_match (id, user_id, match_group_id, hidden_at) FROM stdin;
a542d9af-e5fc-415a-a61e-edc413460946	79fbd8c4-0cad-4d74-9173-d5de632ac973	81024cd6-4622-47e6-82ff-f9b94b317532	2025-12-08 19:02:41.861811
4aa4cacf-aadc-4cb7-9591-36473186e493	bbb58287-e9f6-4cdf-a7ba-eb37963f081a	81024cd6-4622-47e6-82ff-f9b94b317532	2025-12-08 19:19:14.199747
d4c37d58-fbb0-4574-94d9-3f7d8b8f944b	bbb58287-e9f6-4cdf-a7ba-eb37963f081a	96dc1f67-466c-4e83-839f-abdc89145422	2025-12-08 19:19:50.997068
62a288db-0950-458f-baa3-ca0d1ec0fa28	79fbd8c4-0cad-4d74-9173-d5de632ac973	96dc1f67-466c-4e83-839f-abdc89145422	2025-12-08 19:21:21.597698
\.


--
-- Data for Name: kindergarten; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.kindergarten (id, name, city, address, latitude, longitude) FROM stdin;
c0c1d5ad-f23b-45d8-a9e2-2fc68fd430f4	Palčica	Novi Sad	Branimira Ćosića 40	\N	\N
ecb2d755-ff8c-4ff8-a724-d8910319806d	Čuperak	Novi Sad	Save Kovačevića 7	\N	\N
ce372331-d1e5-4c3d-8fe8-bfc1dec39816	Zvončica	Novi Sad	Save Kovačevića 14	\N	\N
ee64e55c-005d-4651-8adc-907562ae1255	Vendi	Novi Sad	Braće Dronjak bb	\N	\N
65e4e252-42a8-4f0b-8d81-55ddefa03120	Zlatna ribica	Novi Sad	Marodićeva 4a	\N	\N
e2932840-c022-434d-a6f1-f4ec6b65108f	Zeka	Novi Sad	Budisava, Vuka Karadžića bb	\N	\N
cf390a0e-3567-4b6c-9dcb-3dc3f0599d71	Neven	Novi Sad	Kovilj, Vojvođanskih brigada 14	\N	\N
a57ec9fd-faa6-4c25-88a6-a906cd6691ed	Zvončić	Novi Sad	Kać, Save Maleševa b.b.	\N	\N
e563cdfd-7e97-45d2-aabc-c4c622a6ba85	Kolibri	Novi Sad	Bulevar Jaše Tomića 3	\N	\N
99a2b39c-7001-40ea-889d-e3f23770796c	Bambi	Novi Sad	Karađorđeva 55	\N	\N
4d64487d-5856-4ad1-8a4e-454d5a327943	Vrtić Srna	Novi Sad	Radoja Domanovića 24	\N	\N
07a842ff-1180-4547-a48e-4409bcacea11	Detelina sa 4 lista	Novi Sad	Kalmana Langa 2	\N	\N
585c7150-b2b1-4403-b30e-01cf052d43db	Pinokio	Novi Sad	Begeč, Kralja Petra l, 45	\N	\N
0830d1c4-94f0-430c-8eff-54291649f312	Švrća	Novi Sad	Jerneja Kopitara 1	\N	\N
7e7546ff-9946-48ff-8462-b3f6db28ef9e	Lane	Novi Sad	Heroja Pinkija 25	\N	\N
02c106d8-c6ae-4034-91cf-37000ae2f5cb	Crvenkapa	Novi Sad	Futog III, Proleterska 2	\N	\N
01c4b3eb-3c37-4c82-b3ed-2d8c57831fa2	Biberče	Novi Sad	Futog IV, Voj. Mišića bb	\N	\N
9ba532df-171e-4265-a2de-b04bdcba006e	Radosnica	Novi Sad	Adice, S. Šolaje bb	\N	\N
5f16166f-b65e-4ddf-b20d-9a77ae250c36	Dunavski cvet	Novi Sad	Ćirila i Metodija 69	\N	\N
e6694cc6-3c05-4165-a350-af2b838c1f70	Kockica	Sremski Karlovci	Karlovačkih đaka 31a Sremski Karlovci	\N	\N
fb256153-4cdd-47e8-b82c-037e8a64bc1c	Čigra	Novi Sad	Jože Vlahovića, bb	\N	\N
49826823-5636-4a7c-a5e2-a99c911537fa	Cvrčak	Novi Sad	Palmotićeva 1	\N	\N
e0dec026-e999-4000-96fa-b1bcdb04b701	Zeka	Novi Sad	Bukovac, Vidovdanska 8	\N	\N
baf827f0-0ce6-4351-b2e5-0a61ed898c1f	Čika Jova	Sremska Kamenica	Sremska Kamenica, Zmajevac 2	\N	\N
156861df-a923-4284-a2dc-169fb94cd761	Zmaj	Sremska Kamenica	Sremska Kamenica II, Bul. 23. Oktobra 2	\N	\N
042d487e-2ceb-4281-b622-86b69dcf5435	Plavi čuperak	Sremska Kamenica	Sremska Kamenica III, S. Miletića bb	\N	\N
21486578-6c3c-4fdd-a8d9-81e6d285443d	Izvorčić	Stari Ledinci	Stari Ledinci, V. Karadžića 63	\N	\N
a73fe911-f1ef-41b6-b2c3-a014c3c3ab59	Čarobnjak	Novi Ledinci	Novi Ledinci, Đurđevdanska 1	\N	\N
a013a7c3-a1b3-407d-a475-e5884d36538d	Bubamara	Novi Sad	Čenejska 50	\N	\N
217b6fa4-51d9-4ee3-8b76-ac4e52fa8ceb	Čarobni breg	Novi Sad	Klisanski put 165	\N	\N
40d0484f-352c-44e0-8041-e21645dbfdb3	Vidovdanski zvončić	Novi Sad	Vidovdansko naselje	\N	\N
ad116821-4ca3-4979-b739-e1d8569e0528	Lasta	Novi Sad	Čenej, Partizanska 2	\N	\N
34bba97b-61cb-4f80-ae53-720a526c8e66	Krcko oraščić	Novi Sad	Orahova	\N	\N
2680aa94-0aaa-41a2-a1e4-84e775fe5091	Duga	Novi Sad	Šangaj, VIII ulica br. 6	\N	\N
aa14f141-8685-4af0-88dc-866171985ea1	Veverica	Novi Sad	Visarionova 4a	\N	\N
54818442-c284-47b6-b577-7de9c6ce3b32	Đurđevak	Novi Sad	Beogradski kej 37	\N	\N
50f17a72-7913-42ff-9c38-e8d2fbe701fb	Plavi zec	Novi Sad	Miletićeva 22	\N	\N
278234e6-1f06-4b70-8bee-6031927bd026	Sigridrug	Novi Sad	Almaška 24	\N	\N
3f0bd800-246a-49e1-943e-6305f103016f	Različak	Novi Sad	Narodnog Fronta 45	\N	\N
613f62ac-c037-478b-b5b4-37bcdff322d5	Suncokret	Novi Sad	Alekse Šantića 32	\N	\N
f7a8de37-86d1-4920-a55d-ff1c519439ca	Poletarac	Novi Sad	Puškinova 19	\N	\N
0ec8e783-525b-43fc-9a7f-7ab222c17115	Zlatokosa	Novi Sad	Veternik, Kralja Aleksandra, 62	\N	\N
b5d4247c-81ba-4dd8-a120-cd57783bb993	Roda	Novi Sad	Veternik, Paunova	\N	\N
ff665076-f8e9-43f8-90c4-8ff5e8316260	Kamičak	Novi Sad	Veternik, Milana Tepića	\N	\N
a11fa503-172c-48ab-be4d-3d24ab59fe25	Novosađanče	Novi Sad	Banović Strahinje bb	\N	\N
c44269f9-4321-4b75-b87f-6febf0a92bf8	Zvezdani gaj	Novi Sad	Stepanovićevo	\N	\N
d2a98fbf-334c-4c32-956e-56682c542672	Lienka	Novi Sad	Kisač, Jana Amosa Komenskog	\N	\N
87e4b0aa-b84d-462e-a586-de35a7cd9856	Veseli patuljci	Novi Sad	Rumenka, P. Šandora 25	\N	\N
dde20c9b-0376-4adf-9f8a-73ad92bd9bcd	Plava Zvezda	Novi Sad	Sajlovo 37	\N	\N
4a5119c9-0570-4325-bbce-634ccb9f909c	Petar Pan	Novi Sad	Janka Čmelika 87	\N	\N
fa3883ef-945b-4ee4-b0b3-13365e6cab2b	Cvrčak i mrav	Novi Sad	Trg Majke Jevrosime 2	\N	\N
6481208a-762f-4a33-9a83-174a8a7dd2c6	Kalimero	Novi Sad	Dragiše Brašovana 16	\N	\N
88f93131-4709-4871-b060-819a1ba156f0	Mrvica	Novi Sad	Jirečekova 9	\N	\N
c872be33-174a-4202-9b21-8d3f78be5f91	Veseli vrtić	Novi Sad	Dr Ilije Đuričića 2	\N	\N
084530c1-ed4b-4f55-abe9-d831d8711a03	Čarolija	Novi Sad	Sonje Marinković 1	\N	\N
a4c47957-8bd6-4067-9c2a-55fa891f5d44	Veseljko	Novi Sad	Trg Komenskog 9	\N	\N
f6dc2a26-4597-406e-869b-f3715a02ad83	Maslačak	Novi Sad	Narodnog fronta 42	\N	\N
909eb0d1-a42c-43a3-8e22-a2653e63abc3	Svitac	Novi Sad	Stojana Novakovića bb	\N	\N
62b66c19-dc31-4721-9faa-78b3646d97a9	Guliver	Novi Sad	Bate Brkića 1a	\N	\N
2003a1b1-97ad-4498-84d0-aadb1f689010	Bistričak I	Novi Sad	Seljačkih Buna 63	\N	\N
29fcdd55-2d0e-4d89-9579-c26ce0d26c13	Bistričak II	Novi Sad	Seljačkih Buna 65	\N	\N
9b63d056-86c5-4268-8cc2-74bb83c29241	Zvezdan	Novi Sad	Seljačkih Buna 51	\N	\N
885bfb34-1caa-4f81-8f5f-3a02fa93461e	Bajka	Novi Sad	Stevana Hristića 15	\N	\N
e0067068-5077-4176-9c07-2118f943eb53	Veseli vozić	Novi Sad	Janka Čmelika 110	\N	\N
1a72fdac-ab65-4f54-8ade-9afe86b17b7e	Vilenjak	Novi Sad	Radnička 20	\N	\N
53c5ddb5-dff2-4263-b709-f248f2dd9b91	Meda	Novi Sad	Radnička 47	\N	\N
98773ba6-71ce-436b-a1b8-3c14bdad8ffb	Zlatna greda	Novi Sad	Zlatne Grede 6	\N	\N
3f692423-21eb-429b-a04b-597919221e4b	Vila	Novi Sad	Vojvođanskih Brigada 14	\N	\N
589701e5-e2a6-4775-9be4-060f66268231	Pčelica	Novi Sad	Laze Kostića 5	\N	\N
7f6aaef7-7e42-41d0-9867-8dd9c91e0828	Bubica	Novi Sad	Pap Pavla 9	\N	\N
dfb2e246-82fb-4e4d-aa2b-f544ac6a2e09	Panda	Novi Sad	Nikole Tesle 4	\N	\N
fc5a385c-d7d5-4093-970f-39b82900be38	Leptirić	Novi Sad	Braće Krkljuš 15	\N	\N
a39dc606-cc83-4465-9fd5-48f03f15c2a6	Sunce	Novi Sad	Gagarinova 10	\N	\N
f0430eca-f04c-4b53-b9cc-1b63836ec7ae	Spomenak	Novi Sad	Antona Urbana 2	\N	\N
5bf6ec98-2d26-43a8-a254-b06140198818	Pužić	Novi Sad	Vršačka 23	\N	\N
\.


--
-- Data for Name: match_group; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.match_group (id, status, created_at) FROM stdin;
81024cd6-4622-47e6-82ff-f9b94b317532	CANCELLED	2025-12-08 18:53:42.443074
96dc1f67-466c-4e83-839f-abdc89145422	CANCELLED	2025-12-08 18:53:42.448175
abc52a15-e37e-4dbe-9f88-08aee27dbf7e	COMPLETED	2025-12-08 19:21:13.260684
\.


--
-- Data for Name: match_participant; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.match_participant (id, match_group_id, child_id, next_child_id, has_accepted) FROM stdin;
0daefbea-bff9-4d8e-ba58-b2207992f54d	81024cd6-4622-47e6-82ff-f9b94b317532	b8e3d169-2bef-406f-89e6-623e3ba29ec5	f51b950b-1fde-4821-949a-9a2dd8aa7b5a	t
0efbe747-6aa8-46d2-84c5-0b523e714858	81024cd6-4622-47e6-82ff-f9b94b317532	f51b950b-1fde-4821-949a-9a2dd8aa7b5a	b8e3d169-2bef-406f-89e6-623e3ba29ec5	f
7502a427-5382-49e2-8e2a-7776e5178ea5	96dc1f67-466c-4e83-839f-abdc89145422	b8e3d169-2bef-406f-89e6-623e3ba29ec5	f51b950b-1fde-4821-949a-9a2dd8aa7b5a	t
540755d1-ad80-4efd-85b1-0711b4e3d856	96dc1f67-466c-4e83-839f-abdc89145422	f51b950b-1fde-4821-949a-9a2dd8aa7b5a	b8e3d169-2bef-406f-89e6-623e3ba29ec5	t
1a5f6201-e7b8-4ff1-8a04-9c6e4c20ce14	abc52a15-e37e-4dbe-9f88-08aee27dbf7e	b8e3d169-2bef-406f-89e6-623e3ba29ec5	f51b950b-1fde-4821-949a-9a2dd8aa7b5a	f
f5c1f026-909b-4d61-b3ec-a212a9795604	abc52a15-e37e-4dbe-9f88-08aee27dbf7e	f51b950b-1fde-4821-949a-9a2dd8aa7b5a	b8e3d169-2bef-406f-89e6-623e3ba29ec5	f
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1733514134000	AddGroupToChild1733514134000
2	1733673600000	AddEmailConfirmation1733673600000
3	1733680000000	CreateHiddenMatchTable1733680000000
4	1733760000000	SimplifyMatchStatus1733760000000
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."user" (id, email, full_name, password_hash, created_at, email_confirmed, email_confirmation_token, email_confirmation_token_expires) FROM stdin;
79fbd8c4-0cad-4d74-9173-d5de632ac973	test@example.com	Test Kojić	$2b$10$Ass2zdoTlgZfyCqw1dCt2.ImEU6tk6O59dT2JguMd1ZOQOSSFhsm.	2025-12-08 18:53:42.408274	f	\N	\N
ec43eb2f-d15e-4894-8a39-13c441433b71	marko.j@example.com	Marko Jovanović	$2b$10$b3AWknB/HG.P62icOFK2Ve/5LiJod2XuRKwcTpYTUYn.HbKSo7RPO	2025-12-08 18:53:42.408274	f	\N	\N
1937c967-5cd3-4710-a329-156f160feb65	jelena.p@example.com	Jelena Petrović	$2b$10$gbY0f1yf9c1NcSmU7EMh9ucUcSGM/QNZY6uafiQa9nJwoUz0s9NLW	2025-12-08 18:53:42.408274	f	\N	\N
7c6cb69d-6eb8-4ffe-8128-d1cd6a4c4ba6	nikola.n@example.com	Nikola Nikolić	$2b$10$w7fr9LmlK3xW3hhE1Bio8.t/fzDSyk/psTtJP/KT7sGLV1DzkIXTS	2025-12-08 18:53:42.408274	f	\N	\N
09764f32-78cf-4970-9965-a6bd1bdec118	ana.d@example.com	Ana Đorđević	$2b$10$.FbVRf3KWxlJ3f4PHeXBWutfUze9uJgt79/h4Nxo9HGGqMfGOKrru	2025-12-08 18:53:42.408274	f	\N	\N
bbb58287-e9f6-4cdf-a7ba-eb37963f081a	milos.s@example.com	Miloš Stojanović	$2b$10$i0nyT5o3hozOMESx37fVaOBg7i6bVuFIJ7mEsRbjcwbZV9l6iXzTe	2025-12-08 18:53:42.408274	f	\N	\N
49928174-6833-4489-9fe8-569ba96af0d8	milica.i@example.com	Milica Ilić	$2b$10$mZzzrGH3dI1RRwISQjC2HuIU80.0OwtcZHFSy5SdDoq9LqBVhdb/m	2025-12-08 18:53:42.408274	f	\N	\N
54e32fda-6e91-48e5-9ed0-ebf0141399be	luka.m@example.com	Luka Marković	$2b$10$x43ML2UZVeVF3rqxXWRV0eoSto./fZBm7Y4G/JBtQBXbUIyXJcjZu	2025-12-08 18:53:42.408274	f	\N	\N
c118cd79-590e-4b64-8246-9cf6bc081dea	marija.k@example.com	Marija Kostić	$2b$10$BNicDiYFrl/RQSBsKh.nA.J1Ka3gBt3Cb12FWZ2pnuK8vmhd43Cv.	2025-12-08 18:53:42.408274	f	\N	\N
44096c34-209e-4075-88ec-495d51b0ef3e	stefan.v@example.com	Stefan Vasić	$2b$10$WaccBpbSZCCgeyL24keIauHJtYs05gXaVn.5r/atlXIuRLy2Dpud.	2025-12-08 18:53:42.408274	f	\N	\N
c42efc57-2fe2-43ba-9ac6-9c60aaebc563	dragana.z@example.com	Dragana Živković	$2b$10$06NSoUhvOT6bvtNGpkltZOF9p41V0.V9jGVSzatrS76lqyzO66Qi2	2025-12-08 18:53:42.408274	f	\N	\N
37465a72-ed05-4cb8-9f23-964b78f12b3a	aleksandar.t@example.com	Aleksandar Tomić	$2b$10$d/.vaQ8M4JeXupsuyBzXweJmq.x3sXpNjObIT7/AaUm1.jV4gKxGO	2025-12-08 18:53:42.408274	f	\N	\N
b039d7ae-b958-4cbe-af50-953634578ade	sofija.l@example.com	Sofija Lukić	$2b$10$uBMdmcGRuF5qsv5KEsZl9ejuS5k6BSi0GbSgc4lRpdeUGYztpb35u	2025-12-08 18:53:42.408274	f	\N	\N
9f4bfcb0-c0a1-4eb3-8f67-514aaf2d5c2b	vuk.b@example.com	Vuk Bogdanović	$2b$10$KVKXGEsSErudQkKKHD5Xjeniofk1Vi8VseANGcFZ18r9ZlOkyds7i	2025-12-08 18:53:42.408274	f	\N	\N
e078459a-04e6-4bb1-a64a-7e16a6f36605	katarina.r@example.com	Katarina Ristić	$2b$10$xIrtq1KV6kBFs1L8jXlT4e4pEHhlVgy/yKNOiwoCZ.YhIQq8EMua6	2025-12-08 18:53:42.408274	f	\N	\N
23141ff3-8a28-40d4-bac2-e31012e43430	filip.p@example.com	Filip Pavlović	$2b$10$03fws7umYR8IMPS/t8Ociu5W9DBhgR9jY/DvRP8koMkhCXAgmj7XK	2025-12-08 18:53:42.408274	f	\N	\N
913295e9-8109-4040-871b-25ade25d5cef	bilanovic901@gmail.com	bilanovic901@gmail.com	$2b$10$c.e0CciQm4EVIENPAN5LCejIUWxfLvHHz26knjVQ2LB.ADeYTZvzS	2025-12-08 22:57:28.089519	t	\N	\N
ab97acfb-d05c-4a02-9aa3-dd4968b27eb4	123@123.com	123	$2b$10$mRMj8CUOdBqeISBZE5N6HuzMXKXTV8L7x2BI0Y.oxUmGXjcxKOFsa	2025-12-08 22:58:18.483523	t	\N	\N
1364080c-b70b-4639-8b8b-6a8e69cd065f	321@321.com	321	$2b$10$X4kRuoq5fiUYDAMzOkNvOO0BqYjA1LlJLWuDMNbsgXJ/TahuXp6Ue	2025-12-08 23:00:33.65857	f	cc18e6939c9521fe5723d14bb7d57878a59e3147c58d3bc71dd026deea131b23	2025-12-10 00:00:33.656
176f872c-e2b0-4889-9814-2be1c93aa209	bilanovic90@gmail.com	bilanovic90@gmail.com	$2b$10$sJ1im9jl/XYWbJQASalAMeP.6i.yBaoxYXoD6BABxZ6P9h6jXKrSi	2025-12-08 23:06:56.265804	t	\N	\N
\.


--
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.wishlist (id, child_id, target_kindergarten_id, created_at) FROM stdin;
50d2180a-d17c-48a1-8d02-d0921313b9dd	f51b950b-1fde-4821-949a-9a2dd8aa7b5a	e0dec026-e999-4000-96fa-b1bcdb04b701	2025-12-08 18:53:42.430747
0f1539d0-cff1-400e-90bf-2b91967f6cf9	b8e3d169-2bef-406f-89e6-623e3ba29ec5	f6dc2a26-4597-406e-869b-f3715a02ad83	2025-12-08 18:53:42.430747
c08ec7ab-e63d-4daf-a80f-6fd7a05245c1	b08615f8-f405-4e01-88b0-7bdc435f3a8e	fc5a385c-d7d5-4093-970f-39b82900be38	2025-12-08 18:53:42.430747
a5074f02-0023-4e74-aa48-acc9929b5ab9	b08615f8-f405-4e01-88b0-7bdc435f3a8e	042d487e-2ceb-4281-b622-86b69dcf5435	2025-12-08 18:53:42.430747
4eafe4b3-139a-4fbe-912a-8270a1e9d29a	80af0ac2-140a-4a9d-894f-f932b6244f57	a73fe911-f1ef-41b6-b2c3-a014c3c3ab59	2025-12-08 18:53:42.430747
f83589e2-cac9-421a-baf4-026b589d5c86	80af0ac2-140a-4a9d-894f-f932b6244f57	0ec8e783-525b-43fc-9a7f-7ab222c17115	2025-12-08 18:53:42.430747
3b727cc2-166b-470c-ba46-58880d0ba5a1	92f11311-f99f-4bdf-b0d3-39e28681b076	885bfb34-1caa-4f81-8f5f-3a02fa93461e	2025-12-08 18:53:42.430747
22b2b796-1769-4b55-bcb7-8b50b6a73cbc	a1a2b4d0-0092-4aa4-8bb5-eddaf16fb637	a57ec9fd-faa6-4c25-88a6-a906cd6691ed	2025-12-08 18:53:42.430747
eec87313-6936-4d02-9948-87c84f771d1e	c01e3437-2d0d-4ade-b130-65ebac423efb	34bba97b-61cb-4f80-ae53-720a526c8e66	2025-12-08 18:53:42.430747
6298a179-bfea-4a63-b559-c958c0f9b081	59360ce7-f0ad-4e13-985c-6e252c2b5996	07a842ff-1180-4547-a48e-4409bcacea11	2025-12-08 18:53:42.430747
8dd8bbac-6889-4c7c-8357-6e6032fa5931	59360ce7-f0ad-4e13-985c-6e252c2b5996	c872be33-174a-4202-9b21-8d3f78be5f91	2025-12-08 18:53:42.430747
0ba80362-9f3d-48aa-9de7-91aa10e261c8	1beab3f3-7dfa-4acc-a2f7-23c3308cc115	0ec8e783-525b-43fc-9a7f-7ab222c17115	2025-12-08 18:53:42.430747
ea108b6c-c950-42bf-a0b2-e06b7aff436a	1beab3f3-7dfa-4acc-a2f7-23c3308cc115	fa3883ef-945b-4ee4-b0b3-13365e6cab2b	2025-12-08 18:53:42.430747
9cfe232b-57a5-44df-a916-4c6ca3df833d	1beab3f3-7dfa-4acc-a2f7-23c3308cc115	2680aa94-0aaa-41a2-a1e4-84e775fe5091	2025-12-08 18:53:42.430747
130b2c0a-6c93-4afd-91e6-f2ba77915172	72a2362b-1fda-4359-9431-aa2e285741bd	1a72fdac-ab65-4f54-8ade-9afe86b17b7e	2025-12-08 18:53:42.430747
94722da3-cac3-40ed-af26-2a011c4f3522	72a2362b-1fda-4359-9431-aa2e285741bd	e0dec026-e999-4000-96fa-b1bcdb04b701	2025-12-08 18:53:42.430747
1d59a4d7-b596-4dce-817e-961ebac513fd	fb09f86e-ec32-4ae3-8851-b98be0f00288	2003a1b1-97ad-4498-84d0-aadb1f689010	2025-12-08 18:53:42.430747
54c0e866-f18c-4abf-be35-55ab39ae6d58	fb09f86e-ec32-4ae3-8851-b98be0f00288	e0dec026-e999-4000-96fa-b1bcdb04b701	2025-12-08 18:53:42.430747
6c7ce477-5244-459b-bd51-a39c32271137	0909193f-2da4-4caf-a244-e4e7a49e2e0c	f0430eca-f04c-4b53-b9cc-1b63836ec7ae	2025-12-08 18:53:42.430747
75bdd88e-9906-4290-becc-52c47dae8ec8	0909193f-2da4-4caf-a244-e4e7a49e2e0c	29fcdd55-2d0e-4d89-9579-c26ce0d26c13	2025-12-08 18:53:42.430747
cea7a8f3-a860-430f-9c0b-b9887ad9ca1b	0909193f-2da4-4caf-a244-e4e7a49e2e0c	ce372331-d1e5-4c3d-8fe8-bfc1dec39816	2025-12-08 18:53:42.430747
a5140d44-b4d2-4fbd-8d97-e074de8b6c46	65e2fd9e-f617-4357-9ca5-94bfdec764d3	a73fe911-f1ef-41b6-b2c3-a014c3c3ab59	2025-12-08 18:53:42.430747
b6d5ce01-c0a4-4593-abe8-88d4f7b50f06	65e2fd9e-f617-4357-9ca5-94bfdec764d3	589701e5-e2a6-4775-9be4-060f66268231	2025-12-08 18:53:42.430747
815dc70f-7cbe-4caa-84de-af148b803002	1b395694-1aa0-4ba8-96de-fbe430dc11be	e0dec026-e999-4000-96fa-b1bcdb04b701	2025-12-08 18:53:42.430747
3d1b0e46-1562-4615-be24-44a58bdf2349	55d258e5-dc8a-4d4e-84c4-b97294ac90c4	a013a7c3-a1b3-407d-a475-e5884d36538d	2025-12-08 18:53:42.430747
81748b8a-2422-4f97-a491-ba5d46a6c91d	22c445d2-6af5-4913-a77d-2e219b3ecbb6	40d0484f-352c-44e0-8041-e21645dbfdb3	2025-12-08 18:53:42.430747
060cb3f2-6b8e-4a5a-bd87-9229ccfa55a7	5bf37919-4635-47da-b9ba-53638fc17719	217b6fa4-51d9-4ee3-8b76-ac4e52fa8ceb	2025-12-08 18:53:42.430747
147b2e0f-1af2-4d4b-a87e-ee060810bd8d	5bf37919-4635-47da-b9ba-53638fc17719	65e4e252-42a8-4f0b-8d81-55ddefa03120	2025-12-08 18:53:42.430747
df118f40-6da0-4ef6-a6bd-f2ee01aa4ad4	b732e88e-a2e9-49a7-971a-83a0c60e6e08	084530c1-ed4b-4f55-abe9-d831d8711a03	2025-12-08 18:53:42.430747
a0871313-7b81-4ed1-8a01-40c9a43036c0	b732e88e-a2e9-49a7-971a-83a0c60e6e08	589701e5-e2a6-4775-9be4-060f66268231	2025-12-08 18:53:42.430747
cbe19ce9-bfa1-4ddc-ada4-9f896f06f953	b8e3d169-2bef-406f-89e6-623e3ba29ec5	ad116821-4ca3-4979-b739-e1d8569e0528	2025-12-08 19:21:13.220674
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 4, true);


--
-- Name: hidden_match PK_2a3ff66aa668d74a10ab97b03a5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.hidden_match
    ADD CONSTRAINT "PK_2a3ff66aa668d74a10ab97b03a5" PRIMARY KEY (id);


--
-- Name: child PK_4609b9b323ca37c6bc435ec4b6b; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT "PK_4609b9b323ca37c6bc435ec4b6b" PRIMARY KEY (id);


--
-- Name: wishlist PK_620bff4a240d66c357b5d820eaa; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: match_group PK_c4771d1b75b824a92fd9bd2b545; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.match_group
    ADD CONSTRAINT "PK_c4771d1b75b824a92fd9bd2b545" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: match_participant PK_deab53592edf83accdc8110a0f0; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "PK_deab53592edf83accdc8110a0f0" PRIMARY KEY (id);


--
-- Name: kindergarten PK_f164358e4100850116659a0cf0a; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.kindergarten
    ADD CONSTRAINT "PK_f164358e4100850116659a0cf0a" PRIMARY KEY (id);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: hidden_match FK_11e8b32d185acdc4575d5f96820; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.hidden_match
    ADD CONSTRAINT "FK_11e8b32d185acdc4575d5f96820" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: wishlist FK_24db5a54d6a2684ef3df2fc0c6f; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "FK_24db5a54d6a2684ef3df2fc0c6f" FOREIGN KEY (target_kindergarten_id) REFERENCES public.kindergarten(id);


--
-- Name: child FK_2be796466dfc768b4c5167ede5a; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT "FK_2be796466dfc768b4c5167ede5a" FOREIGN KEY (current_kindergarten_id) REFERENCES public.kindergarten(id);


--
-- Name: wishlist FK_3cf3c335eb534021f1a262f8fc7; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "FK_3cf3c335eb534021f1a262f8fc7" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE CASCADE;


--
-- Name: child FK_4157a24f3378c1e06ae3a942868; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT "FK_4157a24f3378c1e06ae3a942868" FOREIGN KEY (parent_id) REFERENCES public."user"(id);


--
-- Name: match_participant FK_4ae2c8b198162533ea3e6f200e5; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "FK_4ae2c8b198162533ea3e6f200e5" FOREIGN KEY (child_id) REFERENCES public.child(id) ON DELETE SET NULL;


--
-- Name: hidden_match FK_6ce9e4174369e34d26717968ecb; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.hidden_match
    ADD CONSTRAINT "FK_6ce9e4174369e34d26717968ecb" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id);


--
-- Name: match_participant FK_71d26a1ff395dc3f03196a1ed75; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "FK_71d26a1ff395dc3f03196a1ed75" FOREIGN KEY (next_child_id) REFERENCES public.child(id) ON DELETE SET NULL;


--
-- Name: match_participant FK_961f3328be5596fd3ddf23a87dd; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT "FK_961f3328be5596fd3ddf23a87dd" FOREIGN KEY (match_group_id) REFERENCES public.match_group(id);


--
-- PostgreSQL database dump complete
--

\unrestrict WetBQ0k1QhBe0Ybr1vUkcO76SPheFSoRS5rhtmgWXRatj05gdgVS69kGECuwSxm

