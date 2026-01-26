-- ============================================
-- KINRELAY - APP-SPECIFIC SCHEMA
-- ============================================
-- Run AFTER the shared auth schema (schema.sql)
-- Purpose: Patient-family care coordination
-- ============================================

-- ============================================
-- 1. PATIENT PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Patient info
    display_name TEXT NOT NULL,
    date_of_birth DATE,
    medical_notes TEXT,
    
    -- Care settings
    care_level TEXT CHECK (care_level IN ('low', 'medium', 'high')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- ============================================
-- 2. FAMILY CONNECTIONS
-- ============================================
CREATE TYPE connection_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS family_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    family_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Connection info
    relationship TEXT, -- 'spouse', 'child', 'sibling', 'caregiver', etc.
    status connection_status DEFAULT 'pending',
    
    -- Permissions
    can_view_logs BOOLEAN DEFAULT TRUE,
    can_add_logs BOOLEAN DEFAULT FALSE,
    can_manage BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMPTZ,
    
    UNIQUE(patient_id, family_user_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_patient ON family_connections(patient_id);
CREATE INDEX IF NOT EXISTS idx_connections_family ON family_connections(family_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON family_connections(status);

-- ============================================
-- 3. CARE ACTIVITIES / LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Activity info
    activity_type TEXT NOT NULL, -- 'medication', 'meal', 'exercise', 'vitals', etc.
    title TEXT NOT NULL,
    notes TEXT,
    
    -- Timestamp of the activity (not when logged)
    activity_at TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_patient ON care_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_logs_activity_at ON care_logs(activity_at DESC);

-- ============================================
-- 4. RLS POLICIES
-- ============================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;

-- Patients: Users can see their own patients
CREATE POLICY "Users can manage own patients"
    ON patients FOR ALL
    USING (user_id = auth.uid());

-- Connections: Users can see connections they're part of
CREATE POLICY "Users can see own connections"
    ON family_connections FOR SELECT
    USING (
        family_user_id = auth.uid() OR
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Connections: Patient owners can manage connection requests
CREATE POLICY "Patient owners can manage connections"
    ON family_connections FOR ALL
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Family can create connection requests
CREATE POLICY "Family can request connections"
    ON family_connections FOR INSERT
    WITH CHECK (family_user_id = auth.uid());

-- Care logs: Connected family can view
CREATE POLICY "Connected users can view logs"
    ON care_logs FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
        OR
        patient_id IN (
            SELECT patient_id FROM family_connections 
            WHERE family_user_id = auth.uid() 
            AND status = 'approved' 
            AND can_view_logs = TRUE
        )
    );

-- Care logs: Authorized users can add
CREATE POLICY "Authorized users can add logs"
    ON care_logs FOR INSERT
    WITH CHECK (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
        OR
        patient_id IN (
            SELECT patient_id FROM family_connections 
            WHERE family_user_id = auth.uid() 
            AND status = 'approved' 
            AND can_add_logs = TRUE
        )
    );

-- Admin policies
CREATE POLICY "Admins can manage all patients"
    ON patients FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all connections"
    ON family_connections FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all logs"
    ON care_logs FOR ALL USING (is_admin());
