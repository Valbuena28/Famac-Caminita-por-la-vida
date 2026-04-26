--
-- PostgreSQL database dump
--

\restrict JyE3ZJHrdly1V4XotDI7xw25o7fYoo6d4Vz22BemUcg7SGtUdvLAELH7rEXLcW5

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."AppointmentStatus" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductType" AS ENUM (
    'SHIRT',
    'CAP',
    'NUMBER',
    'OTHER'
);


ALTER TYPE public."ProductType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'DOCTOR',
    'RECEPTIONIST'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SponsorTier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SponsorTier" AS ENUM (
    'DIAMOND',
    'PLATINUM',
    'GOLD',
    'SILVER'
);


ALTER TYPE public."SponsorTier" OWNER TO postgres;

--
-- Name: WalkEventStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WalkEventStatus" AS ENUM (
    'PLANNING',
    'ACTIVE',
    'FINISHED'
);


ALTER TYPE public."WalkEventStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status public."AppointmentStatus" DEFAULT 'PENDING'::public."AppointmentStatus" NOT NULL,
    reason text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "patientId" text,
    "doctorId" text,
    "manualPatientName" text
);


ALTER TABLE public."Appointment" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    action text NOT NULL,
    "user" text NOT NULL,
    target text NOT NULL,
    severity text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Chemotherapy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Chemotherapy" (
    id text NOT NULL,
    quantity integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    status text NOT NULL,
    "suppliedBy" text,
    "applicationPlace" text,
    "requestDetails" text,
    "medicalRecordId" text NOT NULL
);


ALTER TABLE public."Chemotherapy" OWNER TO postgres;

--
-- Name: DeceasedRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DeceasedRecord" (
    id text NOT NULL,
    "dateOfDeath" timestamp(3) without time zone NOT NULL,
    "causeOfDeath" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "patientId" text NOT NULL
);


ALTER TABLE public."DeceasedRecord" OWNER TO postgres;

--
-- Name: FamilyBackground; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FamilyBackground" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    "amountBs" double precision,
    "patientId" text NOT NULL
);


ALTER TABLE public."FamilyBackground" OWNER TO postgres;

--
-- Name: FamilyMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FamilyMember" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    relationship text NOT NULL,
    age integer NOT NULL,
    ci text,
    occupation text,
    works boolean DEFAULT false NOT NULL,
    "livesWithPatient" boolean DEFAULT true NOT NULL,
    "patientId" text NOT NULL
);


ALTER TABLE public."FamilyMember" OWNER TO postgres;

--
-- Name: FundAllocation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FundAllocation" (
    id text NOT NULL,
    concept text NOT NULL,
    amount numeric(65,30) NOT NULL,
    quantity integer,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "walkEventId" text NOT NULL,
    "patientId" text
);


ALTER TABLE public."FundAllocation" OWNER TO postgres;

--
-- Name: InventoryItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InventoryItem" (
    id text NOT NULL,
    name text NOT NULL,
    type public."ProductType" NOT NULL,
    size text,
    "unitPrice" numeric(65,30) NOT NULL,
    "totalQty" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "walkEventId" text NOT NULL
);


ALTER TABLE public."InventoryItem" OWNER TO postgres;

--
-- Name: MedicalRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MedicalRecord" (
    id text NOT NULL,
    diagnosis text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "patientId" text NOT NULL,
    "indicatedTreatment" text,
    observations text,
    "surgeryDate" timestamp(3) without time zone,
    "surgeryType" text,
    "treatingDoctor" text
);


ALTER TABLE public."MedicalRecord" OWNER TO postgres;

--
-- Name: Patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Patient" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    gender public."Gender" NOT NULL,
    "phoneNumber" text,
    email text,
    address text,
    "isDeceased" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    age integer,
    "birthPlace" text,
    ci text NOT NULL,
    "civilStatus" text,
    "emergencyContact" text,
    "familyHistory" text,
    municipality text,
    occupation text,
    state text,
    "fileNumber" text
);


ALTER TABLE public."Patient" OWNER TO postgres;

--
-- Name: PointOfSale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PointOfSale" (
    id text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    "contactName" text,
    "contactPhone" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PointOfSale" OWNER TO postgres;

--
-- Name: Sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sale" (
    id text NOT NULL,
    "customerName" text NOT NULL,
    "customerCi" text,
    "customerEmail" text,
    "customerPhone" text,
    total numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pointOfSaleId" text NOT NULL,
    "walkEventId" text NOT NULL
);


ALTER TABLE public."Sale" OWNER TO postgres;

--
-- Name: SaleItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SaleItem" (
    id text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(65,30) NOT NULL,
    subtotal numeric(65,30) NOT NULL,
    "saleId" text NOT NULL,
    "inventoryItemId" text NOT NULL
);


ALTER TABLE public."SaleItem" OWNER TO postgres;

--
-- Name: SocialReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SocialReport" (
    id text NOT NULL,
    "housingType" text NOT NULL,
    "housingCondition" text NOT NULL,
    "socioEconomicAspect" text,
    "patientId" text NOT NULL
);


ALTER TABLE public."SocialReport" OWNER TO postgres;

--
-- Name: Sponsor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sponsor" (
    id text NOT NULL,
    "companyName" text NOT NULL,
    "contactName" text,
    email text,
    phone text,
    tier public."SponsorTier" NOT NULL,
    "amountBs" numeric(65,30),
    "logoUrl" text,
    benefits text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "walkEventId" text NOT NULL
);


ALTER TABLE public."Sponsor" OWNER TO postgres;

--
-- Name: Stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Stock" (
    id text NOT NULL,
    "assignedQty" integer NOT NULL,
    "soldQty" integer DEFAULT 0 NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pointOfSaleId" text NOT NULL,
    "inventoryItemId" text NOT NULL
);


ALTER TABLE public."Stock" OWNER TO postgres;

--
-- Name: SystemConfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemConfig" (
    id integer DEFAULT 1 NOT NULL,
    "foundationName" text NOT NULL,
    director text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemConfig" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."Role" DEFAULT 'RECEPTIONIST'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: WalkEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalkEvent" (
    id text NOT NULL,
    name text NOT NULL,
    year integer NOT NULL,
    "goalAmount" numeric(65,30) NOT NULL,
    status public."WalkEventStatus" DEFAULT 'PLANNING'::public."WalkEventStatus" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WalkEvent" OWNER TO postgres;

--
-- Name: WalkExpense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalkExpense" (
    id text NOT NULL,
    concept text NOT NULL,
    amount numeric(65,30) NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "walkEventId" text NOT NULL
);


ALTER TABLE public."WalkExpense" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Appointment" (id, date, status, reason, notes, "createdAt", "updatedAt", "patientId", "doctorId", "manualPatientName") FROM stdin;
c40a2b91-70c3-4e6a-8433-4e4c2a384993	2026-03-20 19:55:00	PENDING	Arreglo de laptop 		2026-03-20 17:52:13.043	2026-03-20 17:52:13.043	\N	\N	Freddy tecnico
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, action, "user", target, severity, "createdAt") FROM stdin;
20ec37df-fa53-4e2e-b30c-43358249f72e	Modificación de Expediente	Operador Principal	Paciente Afectado: freddy valbuena	info	2026-04-11 19:30:40.426
d397127a-7053-4ddd-9659-0545ff2b89d4	Modificación de Expediente	Operador Principal	Paciente Afectado: Josefina  Beatriz	info	2026-04-11 19:30:53.25
a6408b51-ee14-4819-853d-bf0fcf2763c3	Modificación de Expediente	Operador Principal	Paciente Afectado: freddy valbuena	info	2026-04-11 19:39:15.266
c8516a2f-a421-40fa-a0d4-466344fb5d9a	Modificación de Expediente	Operador Principal	Paciente Afectado: freddy valbuena	info	2026-04-11 19:48:43.913
\.


--
-- Data for Name: Chemotherapy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Chemotherapy" (id, quantity, "startDate", "endDate", status, "suppliedBy", "applicationPlace", "requestDetails", "medicalRecordId") FROM stdin;
47a8c4f6-313b-47a6-9435-8dcd31205536	8	2026-03-20 00:00:00	\N	En Proceso	2 soluciones	Genesis peti		5782539a-6e6e-4573-81c9-6a5de6a76996
025cce8d-4ef1-4137-bbd5-beae3497fc48	6	2026-03-26 00:00:00	\N	No Iniciado	2 soluciones	Genesis peti		07e54870-b86c-4221-b4ce-71b91ab6e766
\.


--
-- Data for Name: DeceasedRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DeceasedRecord" (id, "dateOfDeath", "causeOfDeath", notes, "createdAt", "updatedAt", "patientId") FROM stdin;
\.


--
-- Data for Name: FamilyBackground; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FamilyBackground" (id, date, description, "amountBs", "patientId") FROM stdin;
99fb08c5-9442-45df-81cb-917bad191fc2	2026-03-20 00:00:00	traslado	2000	86035ce6-9ae5-4fa2-8f43-ce8946f0212d
a62b34b0-2492-4b29-8497-9334045ee18f	2026-03-25 00:00:00	dasdadawdaw	5000	7b14983c-3257-44d5-9fab-534a3f6f2f92
\.


--
-- Data for Name: FamilyMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FamilyMember" (id, "fullName", relationship, age, ci, occupation, works, "livesWithPatient", "patientId") FROM stdin;
2ee51c9a-901e-41f6-b372-90f5ab1ccdb7	Amigo	jose	44	\N	Ingeniero	t	t	86035ce6-9ae5-4fa2-8f43-ce8946f0212d
42d40a93-061f-4743-80c9-4589ce53a1be	jose	amigo	20	\N	taxi	t	t	7b14983c-3257-44d5-9fab-534a3f6f2f92
\.


--
-- Data for Name: FundAllocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FundAllocation" (id, concept, amount, quantity, notes, "createdAt", "walkEventId", "patientId") FROM stdin;
b9d43847-e233-4c43-8de7-2404ac60bcc9	Mamografías preventivas	12000.000000000000000000000000000000	240	Campaña de detección temprana en comunidades rurales del Zulia	2026-04-22 15:12:58.38	14dde4be-c629-4ac8-916b-5db5c65c712f	\N
67a36a01-6800-43d3-8570-23e74279c002	Quimioterapias subsidiadas	8000.000000000000000000000000000000	16	Pacientes en tratamiento activo que no pueden costear la totalidad	2026-04-22 15:12:58.383	14dde4be-c629-4ac8-916b-5db5c65c712f	\N
3d910b75-d5fb-4991-932c-78c08fcb0a36	Prótesis mamarias post-mastectomía	5000.000000000000000000000000000000	10	Programa de reconstrucción para pacientes de bajos recursos	2026-04-22 15:12:58.384	14dde4be-c629-4ac8-916b-5db5c65c712f	\N
b0b4ee48-3566-46d5-85f1-b4fc9f338cae	Transporte de pacientes a consultas	3000.000000000000000000000000000000	150	Subsidio de traslado para pacientes foráneos	2026-04-22 15:12:58.386	14dde4be-c629-4ac8-916b-5db5c65c712f	\N
65e1182e-6275-464e-ac15-c8a7cec1acdf	Medicamentos oncológicos	6000.000000000000000000000000000000	30	Compra centralizada de medicamentos a precio preferencial	2026-04-22 15:12:58.388	14dde4be-c629-4ac8-916b-5db5c65c712f	\N
\.


--
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryItem" (id, name, type, size, "unitPrice", "totalQty", "createdAt", "walkEventId") FROM stdin;
39ec3a84-679a-4bd9-b4ed-01994382610c	Camisa Rosa - Talla S	SHIRT	S	15.000000000000000000000000000000	200	2026-04-22 15:12:58.042	14dde4be-c629-4ac8-916b-5db5c65c712f
968ce481-8f8d-4aee-aa6d-c1ff7afb2742	Camisa Rosa - Talla M	SHIRT	M	15.000000000000000000000000000000	350	2026-04-22 15:12:58.046	14dde4be-c629-4ac8-916b-5db5c65c712f
1207781a-aa64-4e49-ba1f-a0d9edabbc18	Camisa Rosa - Talla L	SHIRT	L	15.000000000000000000000000000000	300	2026-04-22 15:12:58.048	14dde4be-c629-4ac8-916b-5db5c65c712f
7ee24e29-d86e-4cd9-926a-ced6128221a7	Camisa Rosa - Talla XL	SHIRT	XL	15.000000000000000000000000000000	150	2026-04-22 15:12:58.051	14dde4be-c629-4ac8-916b-5db5c65c712f
ba259ff3-f155-4a13-aa2a-5abf049f19a4	Gorra Rosa FAMAC	CAP	\N	10.000000000000000000000000000000	500	2026-04-22 15:12:58.054	14dde4be-c629-4ac8-916b-5db5c65c712f
7205f541-7c3f-4de3-a14a-12e63554dac5	Número de Participante	NUMBER	\N	5.000000000000000000000000000000	1000	2026-04-22 15:12:58.057	14dde4be-c629-4ac8-916b-5db5c65c712f
c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d	Pulsera Rosa Solidaria	OTHER	\N	3.000000000000000000000000000000	800	2026-04-22 15:12:58.061	14dde4be-c629-4ac8-916b-5db5c65c712f
be041e29-f76b-4778-b32f-ec613982d26d	Kit Hidratación (Agua + Snack)	OTHER	\N	8.000000000000000000000000000000	600	2026-04-22 15:12:58.063	14dde4be-c629-4ac8-916b-5db5c65c712f
\.


--
-- Data for Name: MedicalRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MedicalRecord" (id, diagnosis, "createdAt", "updatedAt", "patientId", "indicatedTreatment", observations, "surgeryDate", "surgeryType", "treatingDoctor") FROM stdin;
5782539a-6e6e-4573-81c9-6a5de6a76996	Sea de mama de tipo infiltrante	2026-03-20 12:00:31.431	2026-04-11 19:30:53.242	86035ce6-9ae5-4fa2-8f43-ce8946f0212d	quimioterapia y radioterapia	dfadqda	2026-05-07 00:00:00	Mastetomia parcial	Maria alejandra cierra
07e54870-b86c-4221-b4ce-71b91ab6e766	Sea de mama de tipo infiltrante	2026-03-19 23:04:14.29	2026-04-11 19:48:43.901	7b14983c-3257-44d5-9fab-534a3f6f2f92	quimioterapia y radioterapia	adadawdawd	2026-03-28 00:00:00	Mastetomia parcial	Maria alejandra cierra
\.


--
-- Data for Name: Patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Patient" (id, "firstName", "lastName", "dateOfBirth", gender, "phoneNumber", email, address, "isDeceased", "createdAt", "updatedAt", age, "birthPlace", ci, "civilStatus", "emergencyContact", "familyHistory", municipality, occupation, state, "fileNumber") FROM stdin;
86035ce6-9ae5-4fa2-8f43-ce8946f0212d	Josefina 	Beatriz	1995-02-23 00:00:00	FEMALE	0422567890	\N	Calle 14	f	2026-03-20 12:00:31.431	2026-04-11 19:30:53.236	31		23454321	Casado/a	Hijo	Abuelo		Ingenieria	Falcón	A2
7b14983c-3257-44d5-9fab-534a3f6f2f92	freddy	valbuena	1998-05-19 00:00:00	MALE	04246255740		Calle 14	f	2026-03-19 23:04:14.29	2026-04-11 19:48:43.888	27		23456728	Soltero/a	Hermano 	abuela	Maracaibo	Ingenieria	Zulia	A1
\.


--
-- Data for Name: PointOfSale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PointOfSale" (id, name, location, "contactName", "contactPhone", "isActive", "createdAt", "updatedAt") FROM stdin;
6bf1b350-6079-45bd-af45-0aa5a742f1de	C.C. Sambil Maracaibo	Av. La Limpia, Maracaibo	María González	0414-6521234	t	2026-04-22 15:12:58.027	2026-04-22 15:12:58.027
155588bc-8eac-4003-bdf4-24f24064d274	Plaza de la República	Av. 5 de Julio, Centro	Ana Rodríguez	0424-6987654	t	2026-04-22 15:12:58.031	2026-04-22 15:12:58.031
05ddfd09-f0b7-46a5-a805-3005436d3fd7	C.C. Lago Mall	Av. El Milagro	Carmen López	0412-7654321	t	2026-04-22 15:12:58.033	2026-04-22 15:12:58.033
5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	Sede FAMAC Principal	Calle 72 con Av. 15, Maracaibo	Luisa Pérez	0414-6112233	t	2026-04-22 15:12:58.035	2026-04-22 15:12:58.035
0753ce50-067a-4015-8d79-7ea9421c9380	Plaza Baralt	Centro Histórico, Maracaibo	Rosa Martínez	0424-6223344	t	2026-04-22 15:12:58.037	2026-04-22 15:12:58.037
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sale" (id, "customerName", "customerCi", "customerEmail", "customerPhone", total, "createdAt", "pointOfSaleId", "walkEventId") FROM stdin;
68993bb0-0937-422a-9690-08d00aa27fce	Juan Pérez	V-15234567	\N	\N	60.000000000000000000000000000000	2026-04-22 15:12:58.168	6bf1b350-6079-45bd-af45-0aa5a742f1de	14dde4be-c629-4ac8-916b-5db5c65c712f
df4c38ca-b587-4f38-a19a-02318ea0840d	María Fernández	V-18765432	\N	\N	30.000000000000000000000000000000	2026-04-22 15:12:58.197	6bf1b350-6079-45bd-af45-0aa5a742f1de	14dde4be-c629-4ac8-916b-5db5c65c712f
738cf756-5b63-4fc0-bbbc-635589cb3bbf	Carlos Rodríguez	V-20123456	\N	\N	69.000000000000000000000000000000	2026-04-22 15:12:58.208	155588bc-8eac-4003-bdf4-24f24064d274	14dde4be-c629-4ac8-916b-5db5c65c712f
fb12f98a-6f35-41fe-8605-cfb1e51659be	Ana Suárez	V-22345678	\N	\N	33.000000000000000000000000000000	2026-04-22 15:12:58.22	6bf1b350-6079-45bd-af45-0aa5a742f1de	14dde4be-c629-4ac8-916b-5db5c65c712f
c71e8c4d-0849-4db4-80f0-139e9041ea7f	Pedro Ramírez	V-19876543	\N	\N	70.000000000000000000000000000000	2026-04-22 15:12:58.231	05ddfd09-f0b7-46a5-a805-3005436d3fd7	14dde4be-c629-4ac8-916b-5db5c65c712f
177e9518-cc14-4366-9ff4-456a6b737059	Sofía Morales	V-21098765	\N	\N	46.000000000000000000000000000000	2026-04-22 15:12:58.243	05ddfd09-f0b7-46a5-a805-3005436d3fd7	14dde4be-c629-4ac8-916b-5db5c65c712f
a7d7ec53-8422-4a7d-9d07-e2ce45afa04e	Luis Hernández	V-16543210	\N	\N	50.000000000000000000000000000000	2026-04-22 15:12:58.252	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	14dde4be-c629-4ac8-916b-5db5c65c712f
aa21e861-4bb0-41d4-add9-bc524047ae4d	Laura Vargas	V-23456789	\N	\N	46.000000000000000000000000000000	2026-04-22 15:12:58.265	155588bc-8eac-4003-bdf4-24f24064d274	14dde4be-c629-4ac8-916b-5db5c65c712f
7ce8fa35-b7e8-4875-9d0a-aee8623fa25f	Diego Torres	V-17654321	\N	\N	30.000000000000000000000000000000	2026-04-22 15:12:58.273	0753ce50-067a-4015-8d79-7ea9421c9380	14dde4be-c629-4ac8-916b-5db5c65c712f
4d6c9b3d-601c-4cf4-8dff-8e03ca3157d0	Valentina Díaz	V-24567890	\N	\N	41.000000000000000000000000000000	2026-04-22 15:12:58.279	6bf1b350-6079-45bd-af45-0aa5a742f1de	14dde4be-c629-4ac8-916b-5db5c65c712f
13a1fa4a-203c-4e6d-ad06-f12cd9673bed	Andrés Castillo	V-14321098	\N	\N	80.000000000000000000000000000000	2026-04-22 15:12:58.288	05ddfd09-f0b7-46a5-a805-3005436d3fd7	14dde4be-c629-4ac8-916b-5db5c65c712f
3ccfb5c1-5f3d-4737-a45a-e199764b2405	Gabriela Mendoza	V-25678901	\N	\N	78.000000000000000000000000000000	2026-04-22 15:12:58.293	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	14dde4be-c629-4ac8-916b-5db5c65c712f
350bb590-f9f0-4657-8f30-da17b0490443	Roberto Silva	V-13210987	\N	\N	50.000000000000000000000000000000	2026-04-22 15:12:58.299	0753ce50-067a-4015-8d79-7ea9421c9380	14dde4be-c629-4ac8-916b-5db5c65c712f
07eaa94d-6c50-43cf-8080-6de4b87c8b85	Patricia Flores	V-26789012	\N	\N	55.000000000000000000000000000000	2026-04-22 15:12:58.306	6bf1b350-6079-45bd-af45-0aa5a742f1de	14dde4be-c629-4ac8-916b-5db5c65c712f
83e1adf1-6023-454f-90c5-f0676ff69d84	Fernando Ortiz	V-12109876	\N	\N	42.000000000000000000000000000000	2026-04-22 15:12:58.317	155588bc-8eac-4003-bdf4-24f24064d274	14dde4be-c629-4ac8-916b-5db5c65c712f
aa7bbc63-41df-4eb3-9b50-43abbb158405	Claudia Rivas	V-27890123	\N	\N	38.000000000000000000000000000000	2026-04-22 15:12:58.325	05ddfd09-f0b7-46a5-a805-3005436d3fd7	14dde4be-c629-4ac8-916b-5db5c65c712f
21e74a83-a16d-4301-b20b-8565486ec0fc	Miguel Acosta	V-11098765	\N	\N	60.000000000000000000000000000000	2026-04-22 15:12:58.333	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	14dde4be-c629-4ac8-916b-5db5c65c712f
db9b7c49-ee48-4813-a537-20ceec3a74d7	Daniela Chávez	V-28901234	\N	\N	20.000000000000000000000000000000	2026-04-22 15:12:58.342	0753ce50-067a-4015-8d79-7ea9421c9380	14dde4be-c629-4ac8-916b-5db5c65c712f
3fcf1ded-3a1e-41e1-8312-cc152114acbe	Empresa ABC (compra corporativa)	J-12345678-9	\N	\N	600.000000000000000000000000000000	2026-04-22 15:12:58.347	6bf1b350-6079-45bd-af45-0aa5a742f1de	14dde4be-c629-4ac8-916b-5db5c65c712f
a7c7cd0b-5f0c-43a9-b6dc-7fb47aef276c	Colegio Santa Rosa	J-98765432-1	\N	\N	420.000000000000000000000000000000	2026-04-22 15:12:58.354	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	14dde4be-c629-4ac8-916b-5db5c65c712f
\.


--
-- Data for Name: SaleItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SaleItem" (id, quantity, "unitPrice", subtotal, "saleId", "inventoryItemId") FROM stdin;
bec633b1-ebff-420c-a770-6b4abc2b6b9b	2	15.000000000000000000000000000000	30.000000000000000000000000000000	68993bb0-0937-422a-9690-08d00aa27fce	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
bbd1f401-d2f8-432e-a30b-be90d0986764	2	10.000000000000000000000000000000	20.000000000000000000000000000000	68993bb0-0937-422a-9690-08d00aa27fce	ba259ff3-f155-4a13-aa2a-5abf049f19a4
841fe342-0590-459c-9f0f-8e33aaf53eab	2	5.000000000000000000000000000000	10.000000000000000000000000000000	68993bb0-0937-422a-9690-08d00aa27fce	7205f541-7c3f-4de3-a14a-12e63554dac5
317b51c0-07bb-439f-8b79-64c4ef2e6c7e	1	15.000000000000000000000000000000	15.000000000000000000000000000000	df4c38ca-b587-4f38-a19a-02318ea0840d	39ec3a84-679a-4bd9-b4ed-01994382610c
924d5694-796a-4163-b97e-e604bd30afc2	1	10.000000000000000000000000000000	10.000000000000000000000000000000	df4c38ca-b587-4f38-a19a-02318ea0840d	ba259ff3-f155-4a13-aa2a-5abf049f19a4
3ae8b699-f00b-443c-a6fd-32d80845673a	1	5.000000000000000000000000000000	5.000000000000000000000000000000	df4c38ca-b587-4f38-a19a-02318ea0840d	7205f541-7c3f-4de3-a14a-12e63554dac5
5573b007-f8eb-4c0d-821f-bd25a47b0b0a	3	15.000000000000000000000000000000	45.000000000000000000000000000000	738cf756-5b63-4fc0-bbbc-635589cb3bbf	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
49950f01-e1ac-4d36-9987-c0dd5710f59e	3	5.000000000000000000000000000000	15.000000000000000000000000000000	738cf756-5b63-4fc0-bbbc-635589cb3bbf	7205f541-7c3f-4de3-a14a-12e63554dac5
2e7bbf67-6c1c-4b24-8836-db35a8b7bcad	3	3.000000000000000000000000000000	9.000000000000000000000000000000	738cf756-5b63-4fc0-bbbc-635589cb3bbf	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
1bbe7f52-b816-4d9d-989b-43fad96a13f2	1	15.000000000000000000000000000000	15.000000000000000000000000000000	fb12f98a-6f35-41fe-8605-cfb1e51659be	1207781a-aa64-4e49-ba1f-a0d9edabbc18
9818faa7-ca2b-428a-af85-844f65e39e4b	1	10.000000000000000000000000000000	10.000000000000000000000000000000	fb12f98a-6f35-41fe-8605-cfb1e51659be	ba259ff3-f155-4a13-aa2a-5abf049f19a4
df0ead64-ea4b-44fe-b433-224998e65742	1	8.000000000000000000000000000000	8.000000000000000000000000000000	fb12f98a-6f35-41fe-8605-cfb1e51659be	be041e29-f76b-4778-b32f-ec613982d26d
df36db75-8d95-483c-b237-87d4190ac8ac	2	15.000000000000000000000000000000	30.000000000000000000000000000000	c71e8c4d-0849-4db4-80f0-139e9041ea7f	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
8d9ee8d6-33e3-4bda-8039-25467e643970	3	10.000000000000000000000000000000	30.000000000000000000000000000000	c71e8c4d-0849-4db4-80f0-139e9041ea7f	ba259ff3-f155-4a13-aa2a-5abf049f19a4
0eaf6530-d5d6-46b8-a4f0-13c0cc82fa77	2	5.000000000000000000000000000000	10.000000000000000000000000000000	c71e8c4d-0849-4db4-80f0-139e9041ea7f	7205f541-7c3f-4de3-a14a-12e63554dac5
f8bdc8cc-13ca-4f49-9764-3b4ff04ae550	2	15.000000000000000000000000000000	30.000000000000000000000000000000	177e9518-cc14-4366-9ff4-456a6b737059	1207781a-aa64-4e49-ba1f-a0d9edabbc18
7626b38d-b0b7-44ab-8ff2-29850dbff55d	2	8.000000000000000000000000000000	16.000000000000000000000000000000	177e9518-cc14-4366-9ff4-456a6b737059	be041e29-f76b-4778-b32f-ec613982d26d
05416e36-70df-4b39-9557-ca1811efed21	1	15.000000000000000000000000000000	15.000000000000000000000000000000	a7d7ec53-8422-4a7d-9d07-e2ce45afa04e	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
261e0fa7-560c-4634-8fb6-7c8bcc4577f6	2	10.000000000000000000000000000000	20.000000000000000000000000000000	a7d7ec53-8422-4a7d-9d07-e2ce45afa04e	ba259ff3-f155-4a13-aa2a-5abf049f19a4
5d172b22-0c0b-4fe0-84dd-4b6252b8e839	5	3.000000000000000000000000000000	15.000000000000000000000000000000	a7d7ec53-8422-4a7d-9d07-e2ce45afa04e	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
81ca4c12-f3f7-4ab3-bad7-c00abe8247bc	2	15.000000000000000000000000000000	30.000000000000000000000000000000	aa21e861-4bb0-41d4-add9-bc524047ae4d	39ec3a84-679a-4bd9-b4ed-01994382610c
05a378bd-5c01-43d9-9a85-ce8ce24dfdf9	2	5.000000000000000000000000000000	10.000000000000000000000000000000	aa21e861-4bb0-41d4-add9-bc524047ae4d	7205f541-7c3f-4de3-a14a-12e63554dac5
c0fb5f37-dcc9-466c-9ae7-ac9221b19536	2	3.000000000000000000000000000000	6.000000000000000000000000000000	aa21e861-4bb0-41d4-add9-bc524047ae4d	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
8515bf65-21d8-4418-b82d-b3e16e4ba4c0	1	15.000000000000000000000000000000	15.000000000000000000000000000000	7ce8fa35-b7e8-4875-9d0a-aee8623fa25f	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
80ce1267-95e4-4cdd-8288-a825e1bafdb2	1	10.000000000000000000000000000000	10.000000000000000000000000000000	7ce8fa35-b7e8-4875-9d0a-aee8623fa25f	ba259ff3-f155-4a13-aa2a-5abf049f19a4
151c0e97-7e82-4402-999e-50e1eaf2827a	1	5.000000000000000000000000000000	5.000000000000000000000000000000	7ce8fa35-b7e8-4875-9d0a-aee8623fa25f	7205f541-7c3f-4de3-a14a-12e63554dac5
24695437-fe65-40d5-9482-d27d13ca922d	1	15.000000000000000000000000000000	15.000000000000000000000000000000	4d6c9b3d-601c-4cf4-8dff-8e03ca3157d0	7ee24e29-d86e-4cd9-926a-ced6128221a7
de1e2701-deba-49ce-9ee9-6c178f48246c	1	10.000000000000000000000000000000	10.000000000000000000000000000000	4d6c9b3d-601c-4cf4-8dff-8e03ca3157d0	ba259ff3-f155-4a13-aa2a-5abf049f19a4
2092878f-7c6e-43fd-890a-f1288ac8a3c5	2	8.000000000000000000000000000000	16.000000000000000000000000000000	4d6c9b3d-601c-4cf4-8dff-8e03ca3157d0	be041e29-f76b-4778-b32f-ec613982d26d
21a188d6-8be7-4598-a0ad-27107d2756d7	4	15.000000000000000000000000000000	60.000000000000000000000000000000	13a1fa4a-203c-4e6d-ad06-f12cd9673bed	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
6b41d04e-90c0-4a96-add4-6047516410bf	4	5.000000000000000000000000000000	20.000000000000000000000000000000	13a1fa4a-203c-4e6d-ad06-f12cd9673bed	7205f541-7c3f-4de3-a14a-12e63554dac5
49694c08-2036-4b87-bfbb-47fabd7eeea4	3	15.000000000000000000000000000000	45.000000000000000000000000000000	3ccfb5c1-5f3d-4737-a45a-e199764b2405	1207781a-aa64-4e49-ba1f-a0d9edabbc18
0e385207-92cb-447f-9d01-fed45bcb40c5	3	3.000000000000000000000000000000	9.000000000000000000000000000000	3ccfb5c1-5f3d-4737-a45a-e199764b2405	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
a342ed54-e968-4d56-bb40-4e8c51579fa7	3	8.000000000000000000000000000000	24.000000000000000000000000000000	3ccfb5c1-5f3d-4737-a45a-e199764b2405	be041e29-f76b-4778-b32f-ec613982d26d
df66ee64-557a-41c3-ad5d-90e96fe7a7e6	2	15.000000000000000000000000000000	30.000000000000000000000000000000	350bb590-f9f0-4657-8f30-da17b0490443	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
765fd43a-3130-46dd-b417-4f3e28bf598d	2	10.000000000000000000000000000000	20.000000000000000000000000000000	350bb590-f9f0-4657-8f30-da17b0490443	ba259ff3-f155-4a13-aa2a-5abf049f19a4
52b9ac9a-fb84-41b6-96e0-b99b9ddd4aff	1	15.000000000000000000000000000000	15.000000000000000000000000000000	07eaa94d-6c50-43cf-8080-6de4b87c8b85	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
e256ecb8-b56e-48af-b077-ccb198c90190	1	15.000000000000000000000000000000	15.000000000000000000000000000000	07eaa94d-6c50-43cf-8080-6de4b87c8b85	1207781a-aa64-4e49-ba1f-a0d9edabbc18
d6b6c714-4294-4277-ad86-5b47665bd0ff	2	10.000000000000000000000000000000	20.000000000000000000000000000000	07eaa94d-6c50-43cf-8080-6de4b87c8b85	ba259ff3-f155-4a13-aa2a-5abf049f19a4
be6d8544-3250-483a-b194-24168cd1e60b	1	5.000000000000000000000000000000	5.000000000000000000000000000000	07eaa94d-6c50-43cf-8080-6de4b87c8b85	7205f541-7c3f-4de3-a14a-12e63554dac5
13fce1bf-3d53-48b0-a740-8898fd0cce7d	2	15.000000000000000000000000000000	30.000000000000000000000000000000	83e1adf1-6023-454f-90c5-f0676ff69d84	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
9c74b418-e41c-4631-8b4b-a1b4e4a955bf	4	3.000000000000000000000000000000	12.000000000000000000000000000000	83e1adf1-6023-454f-90c5-f0676ff69d84	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
6baa6b8d-d73b-4554-af04-a5553d01b61c	1	15.000000000000000000000000000000	15.000000000000000000000000000000	aa7bbc63-41df-4eb3-9b50-43abbb158405	39ec3a84-679a-4bd9-b4ed-01994382610c
26570486-b5c1-41de-b471-6c1da4bcfe47	1	15.000000000000000000000000000000	15.000000000000000000000000000000	aa7bbc63-41df-4eb3-9b50-43abbb158405	7ee24e29-d86e-4cd9-926a-ced6128221a7
26bd0cbe-9d0a-4b7b-a65a-7fddb99a8375	1	8.000000000000000000000000000000	8.000000000000000000000000000000	aa7bbc63-41df-4eb3-9b50-43abbb158405	be041e29-f76b-4778-b32f-ec613982d26d
297f68eb-57f0-4805-9b57-9e3e41506cfb	3	10.000000000000000000000000000000	30.000000000000000000000000000000	21e74a83-a16d-4301-b20b-8565486ec0fc	ba259ff3-f155-4a13-aa2a-5abf049f19a4
88ac117b-7a34-42bf-82f1-e38c8dbb45b9	3	5.000000000000000000000000000000	15.000000000000000000000000000000	21e74a83-a16d-4301-b20b-8565486ec0fc	7205f541-7c3f-4de3-a14a-12e63554dac5
674d284d-f20b-419b-a584-6e6b86284541	5	3.000000000000000000000000000000	15.000000000000000000000000000000	21e74a83-a16d-4301-b20b-8565486ec0fc	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
dbe94ea2-2838-4100-9a19-bf1c7f8bde78	1	15.000000000000000000000000000000	15.000000000000000000000000000000	db9b7c49-ee48-4813-a537-20ceec3a74d7	1207781a-aa64-4e49-ba1f-a0d9edabbc18
bab8f56c-5516-4696-8155-cb33f3a8bcc2	1	5.000000000000000000000000000000	5.000000000000000000000000000000	db9b7c49-ee48-4813-a537-20ceec3a74d7	7205f541-7c3f-4de3-a14a-12e63554dac5
36d1981d-25d4-458b-9c04-2dc7911ab1e2	20	15.000000000000000000000000000000	300.000000000000000000000000000000	3fcf1ded-3a1e-41e1-8312-cc152114acbe	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
963ad05f-499c-423e-8381-764b590b987e	20	10.000000000000000000000000000000	200.000000000000000000000000000000	3fcf1ded-3a1e-41e1-8312-cc152114acbe	ba259ff3-f155-4a13-aa2a-5abf049f19a4
dd612904-57b7-4a5d-9778-960cab7bffd7	20	5.000000000000000000000000000000	100.000000000000000000000000000000	3fcf1ded-3a1e-41e1-8312-cc152114acbe	7205f541-7c3f-4de3-a14a-12e63554dac5
5419e038-f0ca-4ed2-854f-db79f2be979a	15	15.000000000000000000000000000000	225.000000000000000000000000000000	a7c7cd0b-5f0c-43a9-b6dc-7fb47aef276c	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
d618a0cd-cd2c-4a02-b60e-f6b82da8bdbb	15	5.000000000000000000000000000000	75.000000000000000000000000000000	a7c7cd0b-5f0c-43a9-b6dc-7fb47aef276c	7205f541-7c3f-4de3-a14a-12e63554dac5
a702dffb-ec17-4074-b91f-e253bffae059	15	8.000000000000000000000000000000	120.000000000000000000000000000000	a7c7cd0b-5f0c-43a9-b6dc-7fb47aef276c	be041e29-f76b-4778-b32f-ec613982d26d
\.


--
-- Data for Name: SocialReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SocialReport" (id, "housingType", "housingCondition", "socioEconomicAspect", "patientId") FROM stdin;
e25e4f6f-bf37-4e92-b3ce-4ee7f6691f54	apartamento	propia	evaluacion	86035ce6-9ae5-4fa2-8f43-ce8946f0212d
8411642f-61f3-4138-ae50-8a1717ebc2e1	apartamento	propia	eva;uazdsaad	7b14983c-3257-44d5-9fab-534a3f6f2f92
\.


--
-- Data for Name: Sponsor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sponsor" (id, "companyName", "contactName", email, phone, tier, "amountBs", "logoUrl", benefits, "createdAt", "walkEventId") FROM stdin;
792aba64-536e-4605-8cb2-1cfe8271ee32	Empresas Polar	Carlos Mendoza	\N	\N	DIAMOND	15000.000000000000000000000000000000	\N	Logo principal en camisas, banner en meta, mención en todos los medios	2026-04-22 15:12:58.36	14dde4be-c629-4ac8-916b-5db5c65c712f
9fbc6966-36c8-4577-9792-9a4823b39ad3	Banco Occidental de Descuento	Roberto Urdaneta	\N	\N	PLATINUM	10000.000000000000000000000000000000	\N	Logo secundario en camisas, stand en punto de partida	2026-04-22 15:12:58.363	14dde4be-c629-4ac8-916b-5db5c65c712f
e26fc180-dca8-4a1a-8b1a-9dd77993b326	Farmacias SAAS	Ana Martínez	\N	\N	GOLD	5000.000000000000000000000000000000	\N	Logo en gorras, hidratación para participantes	2026-04-22 15:12:58.364	14dde4be-c629-4ac8-916b-5db5c65c712f
b77f5dd3-fbfe-48a6-a6dd-289b58de68e3	Clínica Paraíso	Dr. Luis Parra	\N	\N	GOLD	5000.000000000000000000000000000000	\N	Stand médico durante el evento, logo en material POP	2026-04-22 15:12:58.365	14dde4be-c629-4ac8-916b-5db5c65c712f
4c3729f6-bea8-4002-bac4-5e521276288e	Supermercados Garzón	José Garzón	\N	\N	SILVER	2500.000000000000000000000000000000	\N	Snacks para kit de hidratación, mención en redes	2026-04-22 15:12:58.366	14dde4be-c629-4ac8-916b-5db5c65c712f
2172c333-9786-4776-9a1a-8ddae1b8ca70	Panadería La Rosa	Carmen Rosa	\N	\N	SILVER	1500.000000000000000000000000000000	\N	Refrigerios post-caminata, mención en programa	2026-04-22 15:12:58.367	14dde4be-c629-4ac8-916b-5db5c65c712f
\.


--
-- Data for Name: Stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Stock" (id, "assignedQty", "soldQty", "assignedAt", "pointOfSaleId", "inventoryItemId") FROM stdin;
a26c3fee-9ed8-425b-8e8c-27512c673386	200	0	2026-04-22 15:12:58.08	6bf1b350-6079-45bd-af45-0aa5a742f1de	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
54de0973-2e47-4aa9-86e6-3b764385ebf0	60	0	2026-04-22 15:12:58.087	155588bc-8eac-4003-bdf4-24f24064d274	1207781a-aa64-4e49-ba1f-a0d9edabbc18
c5693b83-c3ea-4d58-94ac-52f016e49ad3	100	0	2026-04-22 15:12:58.089	155588bc-8eac-4003-bdf4-24f24064d274	ba259ff3-f155-4a13-aa2a-5abf049f19a4
32391fcc-9041-47fa-bfaf-eb87bf31d420	200	0	2026-04-22 15:12:58.127	0753ce50-067a-4015-8d79-7ea9421c9380	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
b2b9089a-3724-4b55-a777-401520da7ae3	150	0	2026-04-22 15:12:58.128	0753ce50-067a-4015-8d79-7ea9421c9380	be041e29-f76b-4778-b32f-ec613982d26d
c9485264-555d-475b-aea1-5107dd232c67	30	1	2026-04-22 15:12:58.121	0753ce50-067a-4015-8d79-7ea9421c9380	1207781a-aa64-4e49-ba1f-a0d9edabbc18
cae0a3ce-cf0b-42a0-8c3d-106044c3b807	120	3	2026-04-22 15:12:58.101	05ddfd09-f0b7-46a5-a805-3005436d3fd7	ba259ff3-f155-4a13-aa2a-5abf049f19a4
46cc53e0-b652-4f1b-86b5-c1dff1b5a2fa	60	1	2026-04-22 15:12:58.066	6bf1b350-6079-45bd-af45-0aa5a742f1de	39ec3a84-679a-4bd9-b4ed-01994382610c
73189a62-17b7-4b92-acd5-9ef5da0959c3	80	2	2026-04-22 15:12:58.073	6bf1b350-6079-45bd-af45-0aa5a742f1de	1207781a-aa64-4e49-ba1f-a0d9edabbc18
3b4858cc-1c42-42a3-bfa5-2e04e5226290	150	2	2026-04-22 15:12:58.125	0753ce50-067a-4015-8d79-7ea9421c9380	7205f541-7c3f-4de3-a14a-12e63554dac5
ac280445-4e2e-448d-9b48-dfee9425f3c7	100	23	2026-04-22 15:12:58.071	6bf1b350-6079-45bd-af45-0aa5a742f1de	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
ddb62dec-9574-4b9c-a769-1c50a2176ecf	150	27	2026-04-22 15:12:58.076	6bf1b350-6079-45bd-af45-0aa5a742f1de	ba259ff3-f155-4a13-aa2a-5abf049f19a4
32d9482c-64be-43c5-ab81-db3492a322ea	80	5	2026-04-22 15:12:58.085	155588bc-8eac-4003-bdf4-24f24064d274	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
148c5561-c857-42be-a0a8-661dd859a2ab	70	2	2026-04-22 15:12:58.097	05ddfd09-f0b7-46a5-a805-3005436d3fd7	1207781a-aa64-4e49-ba1f-a0d9edabbc18
c9daaf79-5f9b-4582-b8c8-753df1669f0a	250	24	2026-04-22 15:12:58.078	6bf1b350-6079-45bd-af45-0aa5a742f1de	7205f541-7c3f-4de3-a14a-12e63554dac5
cf2866b5-254f-4549-83e1-e5cf44ccb7c5	50	16	2026-04-22 15:12:58.107	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
c7cd51e8-584e-43c2-b971-5184e024e867	150	9	2026-04-22 15:12:58.092	155588bc-8eac-4003-bdf4-24f24064d274	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
0d777523-df54-4a22-8649-31178b61cadf	40	2	2026-04-22 15:12:58.083	155588bc-8eac-4003-bdf4-24f24064d274	39ec3a84-679a-4bd9-b4ed-01994382610c
501e7012-4a0f-45f5-9680-6951756bfd4f	200	5	2026-04-22 15:12:58.09	155588bc-8eac-4003-bdf4-24f24064d274	7205f541-7c3f-4de3-a14a-12e63554dac5
b19e8a36-c2b4-4dc3-a427-658e38bb81b8	200	18	2026-04-22 15:12:58.113	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	7205f541-7c3f-4de3-a14a-12e63554dac5
065032c9-9803-420e-97cb-d9a6d386d39b	50	1	2026-04-22 15:12:58.094	05ddfd09-f0b7-46a5-a805-3005436d3fd7	39ec3a84-679a-4bd9-b4ed-01994382610c
35b4f58d-ba6f-4dd4-b93b-f8f2b9af97f5	40	1	2026-04-22 15:12:58.075	6bf1b350-6079-45bd-af45-0aa5a742f1de	7ee24e29-d86e-4cd9-926a-ced6128221a7
4addbcbc-1bb4-4e6e-90e4-184fc7aa22fd	200	18	2026-04-22 15:12:58.117	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	be041e29-f76b-4778-b32f-ec613982d26d
dbd133f7-9097-4170-a9ee-37598d3ac39f	150	3	2026-04-22 15:12:58.082	6bf1b350-6079-45bd-af45-0aa5a742f1de	be041e29-f76b-4778-b32f-ec613982d26d
2f64801b-23a7-48fb-a6bf-0e47f8c95fa2	90	6	2026-04-22 15:12:58.096	05ddfd09-f0b7-46a5-a805-3005436d3fd7	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
0bb86651-582e-4f10-9dee-2a19ad734310	200	6	2026-04-22 15:12:58.103	05ddfd09-f0b7-46a5-a805-3005436d3fd7	7205f541-7c3f-4de3-a14a-12e63554dac5
26217a25-ecc8-4845-903a-1b018eda54f2	60	3	2026-04-22 15:12:58.109	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	1207781a-aa64-4e49-ba1f-a0d9edabbc18
ef4a3411-e57e-44df-82a1-c553b236b4c6	30	3	2026-04-22 15:12:58.119	0753ce50-067a-4015-8d79-7ea9421c9380	968ce481-8f8d-4aee-aa6d-c1ff7afb2742
8cf2ca5b-607d-4211-96e5-e34e19168cbb	50	3	2026-04-22 15:12:58.123	0753ce50-067a-4015-8d79-7ea9421c9380	ba259ff3-f155-4a13-aa2a-5abf049f19a4
bcaee2fd-7d8a-4fdf-906f-46ae55eef605	50	1	2026-04-22 15:12:58.099	05ddfd09-f0b7-46a5-a805-3005436d3fd7	7ee24e29-d86e-4cd9-926a-ced6128221a7
df7634eb-08d1-4755-9545-6e5cf3b54ca2	100	3	2026-04-22 15:12:58.105	05ddfd09-f0b7-46a5-a805-3005436d3fd7	be041e29-f76b-4778-b32f-ec613982d26d
84f8cc29-3941-4b81-9497-791bd116d6d0	80	5	2026-04-22 15:12:58.111	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	ba259ff3-f155-4a13-aa2a-5abf049f19a4
131fef11-6e86-4b90-a11d-2fb386e389ae	250	13	2026-04-22 15:12:58.115	5f9a163a-3514-46e0-ba0b-e3c8960fb1c4	c26822c3-4c5d-4b27-ad6e-3bdbc0fe4d8d
\.


--
-- Data for Name: SystemConfig; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemConfig" (id, "foundationName", director, address, phone, email, "updatedAt") FROM stdin;
1	Famac 	Presidente: Betty	Centro comercial Indio Mara			2026-03-20 12:46:13.517
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt") FROM stdin;
a61a3d23-c8cd-4031-b5e9-0ec1e9e65523	admin@famac.com	$2b$10$35WYfwkdu1PJPT16K8vzN.X/iHwoW.fGsDZd8BZNmm66bY0kw1Yn.	Admin	SGP	ADMIN	2026-03-19 15:20:25.306	2026-03-19 15:20:25.306
6336ad9a-4bae-4531-884f-81af6baee216	freddyvalbuena28@gmail.com	$2b$10$MndUJui5MgxWGDSkl6dMQ.Z08NZoXkzAYYDqTYp9guKeRGGwmZOkm	freddy	valbuena	ADMIN	2026-03-20 12:57:17.847	2026-03-20 12:57:17.847
ea271c46-cdfb-4440-b107-66cbd6cae86d	naigua@famac.com	$2b$10$fRhTYrg7pOw2vi3MDLBwFeyZ1gx2e/5/wnnXVgaKbVRbE16M3R4RO	Naigua	.	RECEPTIONIST	2026-04-11 19:29:44.29	2026-04-11 19:29:44.29
\.


--
-- Data for Name: WalkEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalkEvent" (id, name, year, "goalAmount", status, "startDate", "endDate", "createdAt", "updatedAt") FROM stdin;
14dde4be-c629-4ac8-916b-5db5c65c712f	Caminata Rosa 2026	2026	50000.000000000000000000000000000000	ACTIVE	2026-10-15 00:00:00	2026-10-15 00:00:00	2026-04-22 15:12:57.857	2026-04-22 15:12:57.857
\.


--
-- Data for Name: WalkExpense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalkExpense" (id, concept, amount, date, notes, "createdAt", "walkEventId") FROM stdin;
5b063a88-5859-4e71-a5fb-c4521cd84e07	Impresión de camisas (1000 unidades)	8000.000000000000000000000000000000	2026-09-15 00:00:00	Taller de serigrafía La Victoria	2026-04-22 15:12:58.369	14dde4be-c629-4ac8-916b-5db5c65c712f
12e78526-e027-46c4-96af-8fa5b975a13f	Impresión de gorras (500 unidades)	2500.000000000000000000000000000000	2026-09-15 00:00:00	Incluye bordado del logo	2026-04-22 15:12:58.372	14dde4be-c629-4ac8-916b-5db5c65c712f
8542b274-2c3a-4b78-8b08-301e554c9632	Tarima y sonido para evento	3500.000000000000000000000000000000	2026-10-01 00:00:00	Empresa de eventos SoundMax	2026-04-22 15:12:58.373	14dde4be-c629-4ac8-916b-5db5c65c712f
3dddff84-ed8a-4e90-8e1b-3bb3daad91a6	Transporte de mercancía a puntos	1200.000000000000000000000000000000	2026-10-10 00:00:00	3 viajes en camioneta	2026-04-22 15:12:58.374	14dde4be-c629-4ac8-916b-5db5c65c712f
2c7dbc1f-967d-46b3-a691-c21f48b105a4	Permisos municipales y logística	800.000000000000000000000000000000	2026-10-05 00:00:00	Alcaldía de Maracaibo	2026-04-22 15:12:58.376	14dde4be-c629-4ac8-916b-5db5c65c712f
04ebc0ff-bde4-4eb2-8926-57e739444f13	Hidratación adicional (500 botellas)	1000.000000000000000000000000000000	2026-10-12 00:00:00	Agua mineral para participantes	2026-04-22 15:12:58.377	14dde4be-c629-4ac8-916b-5db5c65c712f
828acef7-edf6-4432-bb8f-758595d4c449	Material POP (banners, volantes)	1500.000000000000000000000000000000	2026-09-20 00:00:00	Imprenta Digital Express	2026-04-22 15:12:58.379	14dde4be-c629-4ac8-916b-5db5c65c712f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a8d0c197-aa55-4a58-811f-e8e1e1da75bf	00ee90f74450e072fb25305dd2bfc98d48013f2845d2055e4971dca9e3252f0d	2026-03-19 10:09:46.562638-04	20260319140946_init	\N	\N	2026-03-19 10:09:46.512763-04	1
\.


--
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Chemotherapy Chemotherapy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chemotherapy"
    ADD CONSTRAINT "Chemotherapy_pkey" PRIMARY KEY (id);


--
-- Name: DeceasedRecord DeceasedRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeceasedRecord"
    ADD CONSTRAINT "DeceasedRecord_pkey" PRIMARY KEY (id);


--
-- Name: FamilyBackground FamilyBackground_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyBackground"
    ADD CONSTRAINT "FamilyBackground_pkey" PRIMARY KEY (id);


--
-- Name: FamilyMember FamilyMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyMember"
    ADD CONSTRAINT "FamilyMember_pkey" PRIMARY KEY (id);


--
-- Name: FundAllocation FundAllocation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundAllocation"
    ADD CONSTRAINT "FundAllocation_pkey" PRIMARY KEY (id);


--
-- Name: InventoryItem InventoryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY (id);


--
-- Name: MedicalRecord MedicalRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY (id);


--
-- Name: Patient Patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Patient"
    ADD CONSTRAINT "Patient_pkey" PRIMARY KEY (id);


--
-- Name: PointOfSale PointOfSale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PointOfSale"
    ADD CONSTRAINT "PointOfSale_pkey" PRIMARY KEY (id);


--
-- Name: SaleItem SaleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: SocialReport SocialReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SocialReport"
    ADD CONSTRAINT "SocialReport_pkey" PRIMARY KEY (id);


--
-- Name: Sponsor Sponsor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sponsor"
    ADD CONSTRAINT "Sponsor_pkey" PRIMARY KEY (id);


--
-- Name: Stock Stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stock"
    ADD CONSTRAINT "Stock_pkey" PRIMARY KEY (id);


--
-- Name: SystemConfig SystemConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemConfig"
    ADD CONSTRAINT "SystemConfig_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WalkEvent WalkEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalkEvent"
    ADD CONSTRAINT "WalkEvent_pkey" PRIMARY KEY (id);


--
-- Name: WalkExpense WalkExpense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalkExpense"
    ADD CONSTRAINT "WalkExpense_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: DeceasedRecord_patientId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DeceasedRecord_patientId_key" ON public."DeceasedRecord" USING btree ("patientId");


--
-- Name: Patient_ci_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Patient_ci_key" ON public."Patient" USING btree (ci);


--
-- Name: Patient_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Patient_email_key" ON public."Patient" USING btree (email);


--
-- Name: Patient_fileNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Patient_fileNumber_key" ON public."Patient" USING btree ("fileNumber");


--
-- Name: SocialReport_patientId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SocialReport_patientId_key" ON public."SocialReport" USING btree ("patientId");


--
-- Name: Stock_pointOfSaleId_inventoryItemId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Stock_pointOfSaleId_inventoryItemId_key" ON public."Stock" USING btree ("pointOfSaleId", "inventoryItemId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WalkEvent_year_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WalkEvent_year_key" ON public."WalkEvent" USING btree (year);


--
-- Name: Appointment Appointment_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Appointment Appointment_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Chemotherapy Chemotherapy_medicalRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chemotherapy"
    ADD CONSTRAINT "Chemotherapy_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DeceasedRecord DeceasedRecord_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeceasedRecord"
    ADD CONSTRAINT "DeceasedRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FamilyBackground FamilyBackground_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyBackground"
    ADD CONSTRAINT "FamilyBackground_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FamilyMember FamilyMember_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyMember"
    ADD CONSTRAINT "FamilyMember_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundAllocation FundAllocation_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundAllocation"
    ADD CONSTRAINT "FundAllocation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FundAllocation FundAllocation_walkEventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundAllocation"
    ADD CONSTRAINT "FundAllocation_walkEventId_fkey" FOREIGN KEY ("walkEventId") REFERENCES public."WalkEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryItem InventoryItem_walkEventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_walkEventId_fkey" FOREIGN KEY ("walkEventId") REFERENCES public."WalkEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MedicalRecord MedicalRecord_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SaleItem SaleItem_inventoryItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleItem SaleItem_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sale Sale_pointOfSaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pointOfSaleId_fkey" FOREIGN KEY ("pointOfSaleId") REFERENCES public."PointOfSale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Sale Sale_walkEventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_walkEventId_fkey" FOREIGN KEY ("walkEventId") REFERENCES public."WalkEvent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SocialReport SocialReport_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SocialReport"
    ADD CONSTRAINT "SocialReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sponsor Sponsor_walkEventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sponsor"
    ADD CONSTRAINT "Sponsor_walkEventId_fkey" FOREIGN KEY ("walkEventId") REFERENCES public."WalkEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Stock Stock_inventoryItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stock"
    ADD CONSTRAINT "Stock_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Stock Stock_pointOfSaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stock"
    ADD CONSTRAINT "Stock_pointOfSaleId_fkey" FOREIGN KEY ("pointOfSaleId") REFERENCES public."PointOfSale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WalkExpense WalkExpense_walkEventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalkExpense"
    ADD CONSTRAINT "WalkExpense_walkEventId_fkey" FOREIGN KEY ("walkEventId") REFERENCES public."WalkEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JyE3ZJHrdly1V4XotDI7xw25o7fYoo6d4Vz22BemUcg7SGtUdvLAELH7rEXLcW5

