-- ============================================
-- MISSING KR_ TABLES MIGRATION
-- ============================================
-- This migration adds kr_care_circles and kr_medications tables
-- that are referenced in the application but were missing from schema.
-- Run this in Supabase SQL Editor.
-- ============================================

-- ============================================
-- FIX KR_CLIENTS RLS (must be done first to avoid recursion)
-- ============================================
-- Force drop ALL policies on kr_clients using dynamic SQL
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'kr_clients'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON kr_clients', policy_record.policyname);
    END LOOP;
END $$;

-- Simple non-recursive policies for kr_clients
CREATE POLICY "Allow all select on kr_clients"
ON kr_clients FOR SELECT USING (true);

CREATE POLICY "Allow all insert on kr_clients"
ON kr_clients FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on kr_clients"
ON kr_clients FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on kr_clients"
ON kr_clients FOR DELETE USING (true);

-- ============================================
-- KR_CARE_CIRCLES (care coordination groups)
-- ============================================
-- A care circle is a group of caregivers coordinating care for a client
CREATE TABLE IF NOT EXISTS kr_care_circles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'family', -- family, senior_wg, ambulant_service
    description TEXT,
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    primary_contact_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for kr_care_circles
CREATE INDEX IF NOT EXISTS idx_kr_care_circles_client ON kr_care_circles(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_care_circles_type ON kr_care_circles(type);
CREATE INDEX IF NOT EXISTS idx_kr_care_circles_active ON kr_care_circles(is_active);
CREATE INDEX IF NOT EXISTS idx_kr_care_circles_created_by ON kr_care_circles(created_by);

-- RLS for kr_care_circles
ALTER TABLE kr_care_circles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow all select on kr_care_circles" ON kr_care_circles;
DROP POLICY IF EXISTS "Allow all insert on kr_care_circles" ON kr_care_circles;
DROP POLICY IF EXISTS "Allow all update on kr_care_circles" ON kr_care_circles;
DROP POLICY IF EXISTS "Allow all delete on kr_care_circles" ON kr_care_circles;
DROP POLICY IF EXISTS "Users can view care circles they created or are members of" ON kr_care_circles;
DROP POLICY IF EXISTS "Users can insert care circles" ON kr_care_circles;
DROP POLICY IF EXISTS "Users can update their own care circles" ON kr_care_circles;
DROP POLICY IF EXISTS "Users can delete their own care circles" ON kr_care_circles;

-- Simplified policies to avoid recursion
CREATE POLICY "Allow all select on kr_care_circles"
ON kr_care_circles FOR SELECT USING (true);

CREATE POLICY "Allow all insert on kr_care_circles"
ON kr_care_circles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on kr_care_circles"
ON kr_care_circles FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on kr_care_circles"
ON kr_care_circles FOR DELETE USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_kr_care_circles_updated_at ON kr_care_circles;
CREATE TRIGGER update_kr_care_circles_updated_at
    BEFORE UPDATE ON kr_care_circles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- KR_CIRCLE_MEMBERS (members of a care circle)
-- ============================================
CREATE TABLE IF NOT EXISTS kr_circle_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID REFERENCES kr_care_circles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- admin, member, viewer
    permissions JSONB DEFAULT '{"can_log": true, "can_view_reports": true}',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_kr_circle_members_circle ON kr_circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_kr_circle_members_user ON kr_circle_members(user_id);

-- RLS for kr_circle_members
ALTER TABLE kr_circle_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow all select on kr_circle_members" ON kr_circle_members;
DROP POLICY IF EXISTS "Allow all operations on kr_circle_members" ON kr_circle_members;
DROP POLICY IF EXISTS "Users can view circle members they belong to" ON kr_circle_members;
DROP POLICY IF EXISTS "Circle admins can manage members" ON kr_circle_members;

-- Simplified policies to avoid recursion
CREATE POLICY "Allow all select on kr_circle_members"
ON kr_circle_members FOR SELECT USING (true);

CREATE POLICY "Allow all operations on kr_circle_members"
ON kr_circle_members FOR ALL USING (true);

-- ============================================
-- KR_MEDICATIONS (medication records)
-- ============================================
-- Drop and recreate to ensure correct schema
DROP TABLE IF EXISTS kr_medications CASCADE;

CREATE TABLE kr_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    form TEXT DEFAULT 'tablet', -- tablet, capsule, liquid, patch, cream, inhaler, drops, other
    route TEXT DEFAULT 'oral', -- oral, sublingual, topical, transdermal, inhalation, ocular, otic, nasal, rectal, other
    dose TEXT,
    unit TEXT,
    strength TEXT,
    frequency TEXT,
    schedule JSONB, -- specific times for administration
    instructions TEXT,
    purpose TEXT,
    prescriber_name TEXT,
    prescriber_phone TEXT,
    pharmacy_name TEXT,
    pharmacy_phone TEXT,
    rx_number TEXT,
    start_date DATE,
    end_date DATE,
    refills_remaining INTEGER,
    last_refill_date DATE,
    next_refill_date DATE,
    side_effects TEXT[],
    interactions TEXT[],
    warnings TEXT[],
    active BOOLEAN DEFAULT TRUE,
    is_prn BOOLEAN DEFAULT FALSE, -- as needed medication
    prn_instructions TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for kr_medications
CREATE INDEX IF NOT EXISTS idx_kr_medications_recipient ON kr_medications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_medications_active ON kr_medications(active);
CREATE INDEX IF NOT EXISTS idx_kr_medications_name ON kr_medications(name);

-- RLS for kr_medications
ALTER TABLE kr_medications ENABLE ROW LEVEL SECURITY;

-- Simplified policies to avoid recursion
CREATE POLICY "Allow all select on kr_medications"
ON kr_medications FOR SELECT USING (true);

CREATE POLICY "Allow all insert on kr_medications"
ON kr_medications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on kr_medications"
ON kr_medications FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on kr_medications"
ON kr_medications FOR DELETE USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_kr_medications_updated_at ON kr_medications;
CREATE TRIGGER update_kr_medications_updated_at
    BEFORE UPDATE ON kr_medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Add display_name column to kr_clients if missing
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kr_clients' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE kr_clients ADD COLUMN display_name TEXT;
        -- Populate display_name from full_name for existing records
        UPDATE kr_clients SET display_name = full_name WHERE display_name IS NULL;
    END IF;
END $$;

-- ============================================
-- Add birth_year column to kr_clients if missing
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kr_clients' AND column_name = 'birth_year'
    ) THEN
        ALTER TABLE kr_clients ADD COLUMN birth_year INTEGER;
    END IF;
END $$;

-- ============================================
-- Add primary_language column to kr_clients if missing
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kr_clients' AND column_name = 'primary_language'
    ) THEN
        ALTER TABLE kr_clients ADD COLUMN primary_language TEXT DEFAULT 'en';
    END IF;
END $$;

-- ============================================
-- Make full_name nullable (we use display_name now)
-- ============================================
ALTER TABLE kr_clients ALTER COLUMN full_name DROP NOT NULL;

-- ============================================
-- Make date_of_birth nullable
-- ============================================
ALTER TABLE kr_clients ALTER COLUMN date_of_birth DROP NOT NULL;

-- ============================================
-- Add circle_id column to kr_clients if missing
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kr_clients' AND column_name = 'circle_id'
    ) THEN
        ALTER TABLE kr_clients ADD COLUMN circle_id UUID REFERENCES kr_care_circles(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_kr_clients_circle ON kr_clients(circle_id);
    END IF;
END $$;

-- ============================================
-- KR_ACTIVITIES (activity/incident logs)
-- ============================================
-- Drop and recreate to ensure correct schema
DROP TABLE IF EXISTS kr_activities CASCADE;

CREATE TABLE kr_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID REFERENCES kr_care_circles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- safety, health_observation, adl, environment, service, engagement
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Subtype columns for each category
    subtype_safety TEXT, -- falls, safeguarding, medication_error, etc.
    subtype_health TEXT, -- breathing_difficulty, chest_pain, etc.
    subtype_adl TEXT, -- hydration, meal, toileting, etc.
    subtype_environment TEXT, -- cleaning, maintenance, etc.
    subtype_service TEXT, -- care_plan, family_contact, etc.
    subtype_engagement TEXT, -- social_activity, entertainment, etc.
    -- Additional fields
    assistance_level TEXT, -- independent, supervision, partial, full
    severity TEXT, -- minor, moderate, major, critical
    notes TEXT,
    details JSONB DEFAULT '{}',
    attachments TEXT[],
    status TEXT DEFAULT 'logged', -- logged, reviewed, escalated, resolved
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for kr_activities
CREATE INDEX IF NOT EXISTS idx_kr_activities_circle ON kr_activities(circle_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_recipient ON kr_activities(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_category ON kr_activities(category);
CREATE INDEX IF NOT EXISTS idx_kr_activities_observed ON kr_activities(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_kr_activities_recorded_by ON kr_activities(recorded_by);

-- RLS for kr_activities
ALTER TABLE kr_activities ENABLE ROW LEVEL SECURITY;

-- Simplified policies to avoid recursion
CREATE POLICY "Allow all select on kr_activities"
ON kr_activities FOR SELECT USING (true);

CREATE POLICY "Allow all insert on kr_activities"
ON kr_activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on kr_activities"
ON kr_activities FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on kr_activities"
ON kr_activities FOR DELETE USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_kr_activities_updated_at ON kr_activities;
CREATE TRIGGER update_kr_activities_updated_at
    BEFORE UPDATE ON kr_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
