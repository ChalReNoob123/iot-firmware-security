-- SentinelForge Supabase PostgreSQL Database Schema
-- Run this in the Supabase SQL Editor (supabase.com -> Project -> SQL Editor)

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Devices Table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    architecture TEXT NOT NULL,
    endianness TEXT DEFAULT 'LITTLE',
    connection_type TEXT NOT NULL,
    status TEXT DEFAULT 'ONLINE',
    firmware_version TEXT NOT NULL,
    firmware_hash TEXT NOT NULL,
    firmware_size BIGINT NOT NULL,
    risk_score INTEGER DEFAULT 0,
    ssvc_highest_priority TEXT DEFAULT 'TRACK',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Attestations Table (Mandatory Legal / Ethical Gate)
CREATE TABLE IF NOT EXISTS public.attestations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    tester_name TEXT NOT NULL,
    tester_email TEXT NOT NULL,
    organization TEXT NOT NULL,
    authorization_type TEXT NOT NULL,
    signature_hash TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Scans Table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    fuzz_metrics JSONB,
    compliance_scorecard JSONB
);

-- 4. Findings Table (Zero-Days, Taint Traces & Weaknesses)
CREATE TABLE IF NOT EXISTS public.findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    cvss_v4_score NUMERIC(3, 1),
    epss_probability NUMERIC(4, 3),
    ssvc_decision TEXT NOT NULL,
    cve_id TEXT,
    emb3d_id TEXT,
    affected_component TEXT NOT NULL,
    is_zero_day BOOLEAN DEFAULT false,
    vex_status TEXT DEFAULT 'under_investigation',
    symbolic_trace JSONB,
    crash_snapshot JSONB,
    remediation_advice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.devices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON public.devices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
