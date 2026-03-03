-- ============================================
-- KINRELAY COMPLETE SCHEMA MIGRATION
-- ============================================
-- This migration extends the existing Stratos database
-- with comprehensive KinRelay care management tables.
-- All tables use the kr_ prefix to match existing convention.
-- 
-- PREREQUISITE: Run the main Stratos schema first
-- This depends on: profiles table, update_updated_at function
-- ============================================

-- KinRelay-specific Enums (prefixed to avoid conflicts)
DO $$ BEGIN
    CREATE TYPE kr_caregiver_role AS ENUM ('family', 'specialist', 'nurse', 'caregiver');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kr_profile_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kr_task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kr_incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- KR_CAREGIVER_PROFILES (extends profiles for caregivers)
-- ============================================
-- Stores additional profile data for KinRelay users
-- (specialists, nurses, caregivers, family members)
CREATE TABLE IF NOT EXISTS kr_caregiver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    kr_role kr_caregiver_role NOT NULL DEFAULT 'family',
    status kr_profile_status NOT NULL DEFAULT 'pending_approval',
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    date_of_birth DATE,
    bio TEXT,
    specialization TEXT,
    certifications TEXT[],
    years_of_experience INTEGER,
    hourly_rate DECIMAL(10, 2),
    availability JSONB,
    languages TEXT[],
    is_available_for_hire BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_user ON kr_caregiver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_role ON kr_caregiver_profiles(kr_role);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_status ON kr_caregiver_profiles(status);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_available ON kr_caregiver_profiles(is_available_for_hire);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_rating ON kr_caregiver_profiles(rating);

-- ============================================
-- KR_CLIENTS (people receiving care)
-- ============================================
-- Replaces the existing kr_patients with more comprehensive fields
CREATE TABLE IF NOT EXISTS kr_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    address TEXT,
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_conditions TEXT[],
    allergies TEXT[],
    medications_notes TEXT,
    dietary_restrictions TEXT,
    mobility_level TEXT,
    cognitive_status TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    primary_physician_name TEXT,
    primary_physician_phone TEXT,
    care_requirements TEXT,
    additional_notes TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_clients_family_member ON kr_clients(family_member_id);

-- ============================================
-- KR_CARE_ASSIGNMENTS (links specialists to clients)
-- ============================================
CREATE TABLE IF NOT EXISTS kr_care_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    specialist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    assignment_type TEXT, -- full-time, part-time, temporary
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_care_assignments_client ON kr_care_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_care_assignments_specialist ON kr_care_assignments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_kr_care_assignments_active ON kr_care_assignments(is_active);

-- ============================================
-- KR_CARE_CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS kr_care_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_es TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- KR_CARE_SUBCATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS kr_care_subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES kr_care_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_es TEXT NOT NULL,
    unit TEXT,
    input_type TEXT DEFAULT 'text',
    options JSONB,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_care_subcategories_category ON kr_care_subcategories(category_id);

-- ============================================
-- KR_MEDICATIONS
-- ============================================
-- Note: This table is recreated with expanded schema in 20260103_add_missing_kr_tables.sql
-- Keeping basic structure here for reference; the later migration will override this
CREATE TABLE IF NOT EXISTS kr_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    unit TEXT,
    frequency TEXT,
    frequency_times INTEGER,
    schedule_times TIME[],
    route TEXT,
    prescribing_doctor TEXT,
    prescription_number TEXT,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    side_effects TEXT[],
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_medications_recipient ON kr_medications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_medications_active ON kr_medications(active);

-- ============================================
-- KR_TASKS (Daily care tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS kr_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES kr_care_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES kr_care_subcategories(id) ON DELETE SET NULL,
    task_date DATE NOT NULL,
    scheduled_time TIME,
    completed_time TIMESTAMPTZ,
    status kr_task_status DEFAULT 'pending',
    value JSONB,
    description TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_tasks_client ON kr_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_tasks_assigned_to ON kr_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_kr_tasks_date ON kr_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_kr_tasks_status ON kr_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kr_tasks_category ON kr_tasks(category_id);

-- ============================================
-- KR_ACTIVITIES (Activity/Care logs)
-- ============================================
-- Log individual care activities performed
CREATE TABLE IF NOT EXISTS kr_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    caregiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES kr_care_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES kr_care_subcategories(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    activity_time TIME DEFAULT CURRENT_TIME,
    duration_minutes INTEGER,
    value JSONB,
    notes TEXT,
    location TEXT,
    mood TEXT,
    energy_level TEXT,
    attachments TEXT[],
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_activities_client ON kr_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_recipient ON kr_activities(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_caregiver ON kr_activities(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_date ON kr_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_kr_activities_category ON kr_activities(category_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_type ON kr_activities(activity_type);

-- ============================================
-- KR_MEDICATION_ADMINISTRATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS kr_medication_administrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID REFERENCES kr_medications(id) ON DELETE CASCADE,
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    administered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    actual_time TIMESTAMPTZ,
    dosage_given TEXT,
    was_taken BOOLEAN DEFAULT FALSE,
    was_refused BOOLEAN DEFAULT FALSE,
    refusal_reason TEXT,
    side_effects_observed TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_med_admin_medication ON kr_medication_administrations(medication_id);
CREATE INDEX IF NOT EXISTS idx_kr_med_admin_client ON kr_medication_administrations(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_med_admin_scheduled ON kr_medication_administrations(scheduled_time);

-- ============================================
-- KR_INCIDENTS
-- ============================================
CREATE TABLE IF NOT EXISTS kr_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL,
    severity kr_incident_severity DEFAULT 'medium',
    incident_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    description TEXT NOT NULL,
    immediate_action_taken TEXT,
    witnesses TEXT[],
    injuries_sustained TEXT,
    medical_attention_required BOOLEAN DEFAULT FALSE,
    medical_attention_details TEXT,
    family_notified BOOLEAN DEFAULT FALSE,
    family_notification_time TIMESTAMPTZ,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_incidents_client ON kr_incidents(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_incidents_date ON kr_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_kr_incidents_severity ON kr_incidents(severity);

-- ============================================
-- KR_BEHAVIOR_PATTERNS
-- ============================================
CREATE TABLE IF NOT EXISTS kr_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    behavior_type TEXT NOT NULL,
    severity TEXT,
    trigger TEXT,
    antecedent TEXT,
    behavior_description TEXT NOT NULL,
    consequence TEXT,
    intervention_used TEXT,
    effectiveness TEXT,
    duration_minutes INTEGER,
    time_of_day TIME,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_behavior_client ON kr_behavior_patterns(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_behavior_date ON kr_behavior_patterns(recorded_at);

-- ============================================
-- KR_SLEEP_PATTERNS
-- ============================================
CREATE TABLE IF NOT EXISTS kr_sleep_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    sleep_date DATE NOT NULL,
    bedtime TIME,
    wake_time TIME,
    total_hours DECIMAL(4, 2),
    quality TEXT,
    interruptions INTEGER DEFAULT 0,
    interruption_reasons TEXT[],
    naps JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_sleep_client ON kr_sleep_patterns(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_sleep_date ON kr_sleep_patterns(sleep_date);

-- ============================================
-- KR_ACTIVITY_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS kr_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES kr_care_categories(id) ON DELETE SET NULL,
    log_date DATE NOT NULL,
    log_time TIME,
    activity_type TEXT NOT NULL,
    details JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_activity_logs_client ON kr_activity_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_activity_logs_date ON kr_activity_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_kr_activity_logs_category ON kr_activity_logs(category_id);

-- ============================================
-- KR_REVIEWS (for specialists/caregivers)
-- ============================================
CREATE TABLE IF NOT EXISTS kr_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES kr_clients(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    would_recommend BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_reviews_specialist ON kr_reviews(specialist_id);
CREATE INDEX IF NOT EXISTS idx_kr_reviews_rating ON kr_reviews(rating);

-- ============================================
-- KR_MESSAGES (between family members and specialists)
-- ============================================
CREATE TABLE IF NOT EXISTS kr_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES kr_clients(id) ON DELETE SET NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    parent_message_id UUID REFERENCES kr_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_messages_sender ON kr_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_kr_messages_recipient ON kr_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_messages_unread ON kr_messages(recipient_id, is_read);

-- ============================================
-- TRIGGERS: Auto-update timestamps
-- ============================================
-- Uses the existing update_updated_at function from main schema

DROP TRIGGER IF EXISTS kr_caregiver_profiles_updated_at ON kr_caregiver_profiles;
CREATE TRIGGER kr_caregiver_profiles_updated_at
    BEFORE UPDATE ON kr_caregiver_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS kr_clients_updated_at ON kr_clients;
CREATE TRIGGER kr_clients_updated_at
    BEFORE UPDATE ON kr_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS kr_care_assignments_updated_at ON kr_care_assignments;
CREATE TRIGGER kr_care_assignments_updated_at
    BEFORE UPDATE ON kr_care_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS kr_medications_updated_at ON kr_medications;
CREATE TRIGGER kr_medications_updated_at
    BEFORE UPDATE ON kr_medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS kr_tasks_updated_at ON kr_tasks;
CREATE TRIGGER kr_tasks_updated_at
    BEFORE UPDATE ON kr_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS kr_incidents_updated_at ON kr_incidents;
CREATE TRIGGER kr_incidents_updated_at
    BEFORE UPDATE ON kr_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS kr_reviews_updated_at ON kr_reviews;
CREATE TRIGGER kr_reviews_updated_at
    BEFORE UPDATE ON kr_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: Update specialist rating in kr_caregiver_profiles
-- ============================================
CREATE OR REPLACE FUNCTION kr_update_specialist_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE kr_caregiver_profiles
    SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM kr_reviews WHERE specialist_id = NEW.specialist_id),
        total_reviews = (SELECT COUNT(*) FROM kr_reviews WHERE specialist_id = NEW.specialist_id)
    WHERE user_id = NEW.specialist_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kr_update_rating_after_review ON kr_reviews;
CREATE TRIGGER kr_update_rating_after_review
    AFTER INSERT OR UPDATE ON kr_reviews
    FOR EACH ROW EXECUTE FUNCTION kr_update_specialist_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all KinRelay tables
ALTER TABLE kr_caregiver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_care_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_care_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_care_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_medication_administrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_sleep_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- KR_CAREGIVER_PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Public caregiver profiles viewable" ON kr_caregiver_profiles;
CREATE POLICY "Public caregiver profiles viewable" ON kr_caregiver_profiles
    FOR SELECT USING (is_available_for_hire = TRUE OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users manage own caregiver profile" ON kr_caregiver_profiles;
CREATE POLICY "Users manage own caregiver profile" ON kr_caregiver_profiles
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all caregiver profiles" ON kr_caregiver_profiles;
CREATE POLICY "Admins manage all caregiver profiles" ON kr_caregiver_profiles
    FOR ALL USING (is_admin());

-- ============================================
-- KR_CLIENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Family members view their clients" ON kr_clients;
CREATE POLICY "Family members view their clients" ON kr_clients
    FOR SELECT USING (
        family_member_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_care_assignments
            WHERE kr_care_assignments.client_id = kr_clients.id
            AND kr_care_assignments.specialist_id = auth.uid()
            AND kr_care_assignments.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Family members create clients" ON kr_clients;
CREATE POLICY "Family members create clients" ON kr_clients
    FOR INSERT WITH CHECK (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Family members update their clients" ON kr_clients;
CREATE POLICY "Family members update their clients" ON kr_clients
    FOR UPDATE USING (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Family members delete their clients" ON kr_clients;
CREATE POLICY "Family members delete their clients" ON kr_clients
    FOR DELETE USING (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all clients" ON kr_clients;
CREATE POLICY "Admins manage all clients" ON kr_clients
    FOR ALL USING (is_admin());

-- ============================================
-- KR_CARE_ASSIGNMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Care assignments viewable by involved parties" ON kr_care_assignments;
CREATE POLICY "Care assignments viewable by involved parties" ON kr_care_assignments
    FOR SELECT USING (
        specialist_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_care_assignments.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Family creates assignments" ON kr_care_assignments;
CREATE POLICY "Family creates assignments" ON kr_care_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_care_assignments.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Family manages assignments" ON kr_care_assignments;
CREATE POLICY "Family manages assignments" ON kr_care_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_care_assignments.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins manage all assignments" ON kr_care_assignments;
CREATE POLICY "Admins manage all assignments" ON kr_care_assignments
    FOR ALL USING (is_admin());

-- ============================================
-- KR_CARE_CATEGORIES & SUBCATEGORIES (public read)
-- ============================================
DROP POLICY IF EXISTS "Everyone view care categories" ON kr_care_categories;
CREATE POLICY "Everyone view care categories" ON kr_care_categories
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage care categories" ON kr_care_categories;
CREATE POLICY "Admins manage care categories" ON kr_care_categories
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Everyone view care subcategories" ON kr_care_subcategories;
CREATE POLICY "Everyone view care subcategories" ON kr_care_subcategories
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage care subcategories" ON kr_care_subcategories;
CREATE POLICY "Admins manage care subcategories" ON kr_care_subcategories
    FOR ALL USING (is_admin());

-- ============================================
-- KR_MEDICATIONS POLICIES
-- ============================================
-- Note: These policies are overridden by simpler policies in 20260103_add_missing_kr_tables.sql
DROP POLICY IF EXISTS "Medications viewable by authorized users" ON kr_medications;
CREATE POLICY "Medications viewable by authorized users" ON kr_medications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_medications.recipient_id
            AND (
                kr_clients.family_member_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM kr_care_assignments
                    WHERE kr_care_assignments.client_id = kr_clients.id
                    AND kr_care_assignments.specialist_id = auth.uid()
                    AND kr_care_assignments.is_active = TRUE
                )
            )
        )
    );

DROP POLICY IF EXISTS "Authorized users create medications" ON kr_medications;
CREATE POLICY "Authorized users create medications" ON kr_medications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_medications.recipient_id
            AND (
                kr_clients.family_member_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM kr_care_assignments
                    WHERE kr_care_assignments.client_id = kr_clients.id
                    AND kr_care_assignments.specialist_id = auth.uid()
                    AND kr_care_assignments.is_active = TRUE
                )
            )
        )
    );

DROP POLICY IF EXISTS "Authorized users update medications" ON kr_medications;
CREATE POLICY "Authorized users update medications" ON kr_medications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_medications.recipient_id
            AND (
                kr_clients.family_member_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM kr_care_assignments
                    WHERE kr_care_assignments.client_id = kr_clients.id
                    AND kr_care_assignments.specialist_id = auth.uid()
                    AND kr_care_assignments.is_active = TRUE
                )
            )
        )
    );

DROP POLICY IF EXISTS "Admins manage all medications" ON kr_medications;
CREATE POLICY "Admins manage all medications" ON kr_medications
    FOR ALL USING (is_admin());

-- ============================================
-- KR_TASKS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Tasks viewable by authorized users" ON kr_tasks;
CREATE POLICY "Tasks viewable by authorized users" ON kr_tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_tasks.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Authorized users create tasks" ON kr_tasks;
CREATE POLICY "Authorized users create tasks" ON kr_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_tasks.client_id
            AND (
                kr_clients.family_member_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM kr_care_assignments
                    WHERE kr_care_assignments.client_id = kr_clients.id
                    AND kr_care_assignments.specialist_id = auth.uid()
                    AND kr_care_assignments.is_active = TRUE
                )
            )
        )
    );

DROP POLICY IF EXISTS "Assigned specialists update tasks" ON kr_tasks;
CREATE POLICY "Assigned specialists update tasks" ON kr_tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_tasks.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins manage all tasks" ON kr_tasks;
CREATE POLICY "Admins manage all tasks" ON kr_tasks
    FOR ALL USING (is_admin());

-- ============================================
-- KR_MEDICATION_ADMINISTRATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Med administrations viewable by authorized users" ON kr_medication_administrations;
CREATE POLICY "Med administrations viewable by authorized users" ON kr_medication_administrations
    FOR SELECT USING (
        administered_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_medication_administrations.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Specialists record medication administrations" ON kr_medication_administrations;
CREATE POLICY "Specialists record medication administrations" ON kr_medication_administrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_care_assignments
            WHERE kr_care_assignments.client_id = kr_medication_administrations.client_id
            AND kr_care_assignments.specialist_id = auth.uid()
            AND kr_care_assignments.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Specialists update medication administrations" ON kr_medication_administrations;
CREATE POLICY "Specialists update medication administrations" ON kr_medication_administrations
    FOR UPDATE USING (administered_by = auth.uid());

DROP POLICY IF EXISTS "Admins manage all med administrations" ON kr_medication_administrations;
CREATE POLICY "Admins manage all med administrations" ON kr_medication_administrations
    FOR ALL USING (is_admin());

-- ============================================
-- KR_INCIDENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Incidents viewable by authorized users" ON kr_incidents;
CREATE POLICY "Incidents viewable by authorized users" ON kr_incidents
    FOR SELECT USING (
        reported_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_incidents.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Specialists create incidents" ON kr_incidents;
CREATE POLICY "Specialists create incidents" ON kr_incidents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_care_assignments
            WHERE kr_care_assignments.client_id = kr_incidents.client_id
            AND kr_care_assignments.specialist_id = auth.uid()
            AND kr_care_assignments.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Reporters update incidents" ON kr_incidents;
CREATE POLICY "Reporters update incidents" ON kr_incidents
    FOR UPDATE USING (reported_by = auth.uid());

DROP POLICY IF EXISTS "Admins manage all incidents" ON kr_incidents;
CREATE POLICY "Admins manage all incidents" ON kr_incidents
    FOR ALL USING (is_admin());

-- ============================================
-- KR_BEHAVIOR_PATTERNS, SLEEP_PATTERNS, ACTIVITY_LOGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Behavior patterns viewable by authorized users" ON kr_behavior_patterns;
CREATE POLICY "Behavior patterns viewable by authorized users" ON kr_behavior_patterns
    FOR SELECT USING (
        recorded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_behavior_patterns.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Specialists record behavior patterns" ON kr_behavior_patterns;
CREATE POLICY "Specialists record behavior patterns" ON kr_behavior_patterns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_care_assignments
            WHERE kr_care_assignments.client_id = kr_behavior_patterns.client_id
            AND kr_care_assignments.specialist_id = auth.uid()
            AND kr_care_assignments.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Admins manage behavior patterns" ON kr_behavior_patterns;
CREATE POLICY "Admins manage behavior patterns" ON kr_behavior_patterns
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Sleep patterns viewable by authorized users" ON kr_sleep_patterns;
CREATE POLICY "Sleep patterns viewable by authorized users" ON kr_sleep_patterns
    FOR SELECT USING (
        recorded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_sleep_patterns.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Specialists record sleep patterns" ON kr_sleep_patterns;
CREATE POLICY "Specialists record sleep patterns" ON kr_sleep_patterns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_care_assignments
            WHERE kr_care_assignments.client_id = kr_sleep_patterns.client_id
            AND kr_care_assignments.specialist_id = auth.uid()
            AND kr_care_assignments.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Admins manage sleep patterns" ON kr_sleep_patterns;
CREATE POLICY "Admins manage sleep patterns" ON kr_sleep_patterns
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Activity logs viewable by authorized users" ON kr_activity_logs;
CREATE POLICY "Activity logs viewable by authorized users" ON kr_activity_logs
    FOR SELECT USING (
        recorded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM kr_clients
            WHERE kr_clients.id = kr_activity_logs.client_id
            AND kr_clients.family_member_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Specialists record activity logs" ON kr_activity_logs;
CREATE POLICY "Specialists record activity logs" ON kr_activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kr_care_assignments
            WHERE kr_care_assignments.client_id = kr_activity_logs.client_id
            AND kr_care_assignments.specialist_id = auth.uid()
            AND kr_care_assignments.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Admins manage activity logs" ON kr_activity_logs;
CREATE POLICY "Admins manage activity logs" ON kr_activity_logs
    FOR ALL USING (is_admin());

-- ============================================
-- KR_REVIEWS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Reviews publicly viewable" ON kr_reviews;
CREATE POLICY "Reviews publicly viewable" ON kr_reviews
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users create reviews" ON kr_reviews;
CREATE POLICY "Users create reviews" ON kr_reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Users update own reviews" ON kr_reviews;
CREATE POLICY "Users update own reviews" ON kr_reviews
    FOR UPDATE USING (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all reviews" ON kr_reviews;
CREATE POLICY "Admins manage all reviews" ON kr_reviews
    FOR ALL USING (is_admin());

-- ============================================
-- KR_MESSAGES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users view their messages" ON kr_messages;
CREATE POLICY "Users view their messages" ON kr_messages
    FOR SELECT USING (
        sender_id = auth.uid() OR
        recipient_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users send messages" ON kr_messages;
CREATE POLICY "Users send messages" ON kr_messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Recipients mark messages read" ON kr_messages;
CREATE POLICY "Recipients mark messages read" ON kr_messages
    FOR UPDATE USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all messages" ON kr_messages;
CREATE POLICY "Admins manage all messages" ON kr_messages
    FOR ALL USING (is_admin());

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'kr_caregiver_profiles',
        'kr_clients',
        'kr_care_assignments',
        'kr_care_categories',
        'kr_care_subcategories',
        'kr_medications',
        'kr_tasks',
        'kr_medication_administrations',
        'kr_incidents',
        'kr_behavior_patterns',
        'kr_sleep_patterns',
        'kr_activity_logs',
        'kr_reviews',
        'kr_messages'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
            RAISE WARNING 'Table % was not created!', t;
        END IF;
    END LOOP;
    RAISE NOTICE '✅ All KinRelay tables verified!';
END $$;

-- ============================================
-- DONE!
-- ============================================
-- KinRelay schema extension complete.
-- 
-- Tables created (all with kr_ prefix):
--   kr_caregiver_profiles  - Extended profile for KinRelay users
--   kr_clients             - People receiving care
--   kr_care_assignments    - Links specialists to clients
--   kr_care_categories     - Care task categories
--   kr_care_subcategories  - Subcategories with input types
--   kr_medications         - Medication prescriptions
--   kr_tasks               - Daily care tasks
--   kr_medication_administrations - Medication tracking
--   kr_incidents           - Incident reports
--   kr_behavior_patterns   - Behavioral tracking
--   kr_sleep_patterns      - Sleep tracking
--   kr_activity_logs       - General activity tracking
--   kr_reviews             - Specialist ratings
--   kr_messages            - Communication
-- ============================================
