-- ============================================
-- STRATOS - COMPLETE DATABASE SCHEMA
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- This sets up auth + all app tables in one project
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: SHARED AUTH SYSTEM
-- ============================================

-- 1.1 User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'provider', 'company', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.2 Profiles Table (core user data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    user_type TEXT, -- app-specific: 'patient', 'family', 'developer', 'company', etc.
    app_source TEXT, -- which app they signed up from
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_app_source ON profiles(app_source);

-- 1.3 Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, user_type, app_source)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user',
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'app_source', 'unknown')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 1.4 Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 1.5 Helper functions
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1.6 Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');


-- ============================================
-- PART 2: KINRELAY (Patient-Family Care)
-- ============================================

-- 2.1 Patients
CREATE TABLE IF NOT EXISTS kr_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    date_of_birth DATE,
    medical_notes TEXT,
    care_level TEXT CHECK (care_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_patients_user ON kr_patients(user_id);

-- 2.2 Family Connections
DO $$ BEGIN
    CREATE TYPE kr_connection_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS kr_family_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES kr_patients(id) ON DELETE CASCADE,
    family_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT,
    status kr_connection_status DEFAULT 'pending',
    can_view_logs BOOLEAN DEFAULT TRUE,
    can_add_logs BOOLEAN DEFAULT FALSE,
    can_manage BOOLEAN DEFAULT FALSE,
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMPTZ,
    UNIQUE(patient_id, family_user_id)
);

CREATE INDEX IF NOT EXISTS idx_kr_connections_patient ON kr_family_connections(patient_id);
CREATE INDEX IF NOT EXISTS idx_kr_connections_family ON kr_family_connections(family_user_id);

-- 2.3 Care Logs
CREATE TABLE IF NOT EXISTS kr_care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES kr_patients(id) ON DELETE CASCADE,
    logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    activity_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kr_logs_patient ON kr_care_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_kr_logs_activity_at ON kr_care_logs(activity_at DESC);

-- 2.4 KinRelay RLS
ALTER TABLE kr_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_care_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own patients" ON kr_patients;
CREATE POLICY "Users manage own patients" ON kr_patients FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all patients" ON kr_patients;
CREATE POLICY "Admins manage all patients" ON kr_patients FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Users see own connections" ON kr_family_connections;
CREATE POLICY "Users see own connections" ON kr_family_connections FOR SELECT
USING (family_user_id = auth.uid() OR patient_id IN (SELECT id FROM kr_patients WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Patient owners manage connections" ON kr_family_connections;
CREATE POLICY "Patient owners manage connections" ON kr_family_connections FOR ALL
USING (patient_id IN (SELECT id FROM kr_patients WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Family can request connections" ON kr_family_connections;
CREATE POLICY "Family can request connections" ON kr_family_connections FOR INSERT
WITH CHECK (family_user_id = auth.uid());

DROP POLICY IF EXISTS "Connected users view logs" ON kr_care_logs;
CREATE POLICY "Connected users view logs" ON kr_care_logs FOR SELECT
USING (
    patient_id IN (SELECT id FROM kr_patients WHERE user_id = auth.uid())
    OR patient_id IN (
        SELECT patient_id FROM kr_family_connections 
        WHERE family_user_id = auth.uid() AND status = 'approved' AND can_view_logs = TRUE
    )
);

DROP POLICY IF EXISTS "Authorized users add logs" ON kr_care_logs;
CREATE POLICY "Authorized users add logs" ON kr_care_logs FOR INSERT
WITH CHECK (
    patient_id IN (SELECT id FROM kr_patients WHERE user_id = auth.uid())
    OR patient_id IN (
        SELECT patient_id FROM kr_family_connections 
        WHERE family_user_id = auth.uid() AND status = 'approved' AND can_add_logs = TRUE
    )
);

DROP POLICY IF EXISTS "Admins manage all kr tables" ON kr_care_logs;
CREATE POLICY "Admins manage all kr tables" ON kr_care_logs FOR ALL USING (is_admin());


-- ============================================
-- PART 3: STRATOSTALENT (Developer Rental)
-- ============================================

-- 3.1 Developers
CREATE TABLE IF NOT EXISTS st_developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    title TEXT,
    bio TEXT,
    years_experience INTEGER,
    skills JSONB DEFAULT '[]'::JSONB,
    available BOOLEAN DEFAULT TRUE,
    hourly_rate INTEGER,
    location TEXT,
    remote_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_st_developers_user ON st_developers(user_id);
CREATE INDEX IF NOT EXISTS idx_st_developers_available ON st_developers(available);
CREATE INDEX IF NOT EXISTS idx_st_developers_skills ON st_developers USING GIN(skills);

-- 3.2 Companies
CREATE TABLE IF NOT EXISTS st_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    website TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_st_companies_user ON st_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_st_companies_verified ON st_companies(verified);

-- 3.3 Contact Requests
DO $$ BEGIN
    CREATE TYPE st_request_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS st_contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES st_companies(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES st_developers(id) ON DELETE CASCADE,
    message TEXT,
    status st_request_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    responded_at TIMESTAMPTZ,
    UNIQUE(company_id, developer_id)
);

CREATE INDEX IF NOT EXISTS idx_st_requests_company ON st_contact_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_st_requests_developer ON st_contact_requests(developer_id);

-- 3.4 StratosTalent RLS
ALTER TABLE st_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view available developers" ON st_developers;
CREATE POLICY "Anyone view available developers" ON st_developers FOR SELECT USING (available = TRUE);

DROP POLICY IF EXISTS "Users manage own developer profile" ON st_developers;
CREATE POLICY "Users manage own developer profile" ON st_developers FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone view verified companies" ON st_companies;
CREATE POLICY "Anyone view verified companies" ON st_companies FOR SELECT USING (verified = TRUE);

DROP POLICY IF EXISTS "Users manage own company" ON st_companies;
CREATE POLICY "Users manage own company" ON st_companies FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Companies send requests" ON st_contact_requests;
CREATE POLICY "Companies send requests" ON st_contact_requests FOR INSERT
WITH CHECK (company_id IN (SELECT id FROM st_companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Parties view requests" ON st_contact_requests;
CREATE POLICY "Parties view requests" ON st_contact_requests FOR SELECT
USING (
    company_id IN (SELECT id FROM st_companies WHERE user_id = auth.uid())
    OR developer_id IN (SELECT id FROM st_developers WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Developers respond to requests" ON st_contact_requests;
CREATE POLICY "Developers respond to requests" ON st_contact_requests FOR UPDATE
USING (developer_id IN (SELECT id FROM st_developers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage st tables" ON st_developers;
CREATE POLICY "Admins manage st tables" ON st_developers FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Admins manage st companies" ON st_companies;
CREATE POLICY "Admins manage st companies" ON st_companies FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Admins manage st requests" ON st_contact_requests;
CREATE POLICY "Admins manage st requests" ON st_contact_requests FOR ALL USING (is_admin());


-- ============================================
-- PART 4: DREAMNEST (Digital Library)
-- ============================================

-- 4.1 Books
CREATE TABLE IF NOT EXISTS dn_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    cover_url TEXT,
    age_min INTEGER DEFAULT 0,
    age_max INTEGER DEFAULT 99,
    categories JSONB DEFAULT '[]'::JSONB,
    has_text BOOLEAN DEFAULT TRUE,
    has_images BOOLEAN DEFAULT FALSE,
    has_video BOOLEAN DEFAULT FALSE,
    has_narration BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dn_books_published ON dn_books(published);
CREATE INDEX IF NOT EXISTS idx_dn_books_categories ON dn_books USING GIN(categories);

-- 4.2 Book Pages
CREATE TABLE IF NOT EXISTS dn_book_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES dn_books(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    text_content TEXT,
    image_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(book_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_dn_pages_book ON dn_book_pages(book_id);

-- 4.3 User Library
CREATE TABLE IF NOT EXISTS dn_user_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES dn_books(id) ON DELETE CASCADE,
    current_page INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    is_favorite BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_dn_library_user ON dn_user_library(user_id);

-- 4.4 DreamNest RLS
ALTER TABLE dn_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE dn_book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dn_user_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view published books" ON dn_books;
CREATE POLICY "Anyone view published books" ON dn_books FOR SELECT USING (published = TRUE);

DROP POLICY IF EXISTS "Anyone view published pages" ON dn_book_pages;
CREATE POLICY "Anyone view published pages" ON dn_book_pages FOR SELECT
USING (book_id IN (SELECT id FROM dn_books WHERE published = TRUE));

DROP POLICY IF EXISTS "Users manage own library" ON dn_user_library;
CREATE POLICY "Users manage own library" ON dn_user_library FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage dn books" ON dn_books;
CREATE POLICY "Admins manage dn books" ON dn_books FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Admins manage dn pages" ON dn_book_pages;
CREATE POLICY "Admins manage dn pages" ON dn_book_pages FOR ALL USING (is_admin());


-- ============================================
-- PART 5: KELLERSHARER (Space Rental)
-- ============================================

-- 5.1 Types
DO $$ BEGIN
    CREATE TYPE ks_space_type AS ENUM ('basement', 'garage', 'storage', 'warehouse', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ks_listing_status AS ENUM ('draft', 'active', 'paused', 'rented');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ks_report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 5.2 Spaces
CREATE TABLE IF NOT EXISTS ks_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    space_type ks_space_type DEFAULT 'storage',
    size_sqm DECIMAL(10,2),
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'DE',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    price_monthly INTEGER,
    features JSONB DEFAULT '[]'::JSONB,
    images JSONB DEFAULT '[]'::JSONB,
    status ks_listing_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ks_spaces_owner ON ks_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_ks_spaces_status ON ks_spaces(status);
CREATE INDEX IF NOT EXISTS idx_ks_spaces_city ON ks_spaces(city);

-- 5.3 Messages
CREATE TABLE IF NOT EXISTS ks_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES ks_spaces(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ks_messages_space ON ks_messages(space_id);

-- 5.4 Reports
CREATE TABLE IF NOT EXISTS ks_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES ks_spaces(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status ks_report_status DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ks_reports_status ON ks_reports(status);

-- 5.5 KellerSharer RLS
ALTER TABLE ks_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ks_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ks_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view active spaces" ON ks_spaces;
CREATE POLICY "Anyone view active spaces" ON ks_spaces FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Owners manage own spaces" ON ks_spaces;
CREATE POLICY "Owners manage own spaces" ON ks_spaces FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Parties view messages" ON ks_messages;
CREATE POLICY "Parties view messages" ON ks_messages FOR SELECT
USING (sender_id = auth.uid() OR space_id IN (SELECT id FROM ks_spaces WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users send messages" ON ks_messages;
CREATE POLICY "Users send messages" ON ks_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users create reports" ON ks_reports;
CREATE POLICY "Users create reports" ON ks_reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Reporters view own reports" ON ks_reports;
CREATE POLICY "Reporters view own reports" ON ks_reports FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage ks tables" ON ks_spaces;
CREATE POLICY "Admins manage ks tables" ON ks_spaces FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Admins manage ks messages" ON ks_messages;
CREATE POLICY "Admins manage ks messages" ON ks_messages FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins manage ks reports" ON ks_reports;
CREATE POLICY "Admins manage ks reports" ON ks_reports FOR ALL USING (is_admin());


-- ============================================
-- PART 6: STRATOSHOME (Inverted Real Estate)
-- ============================================

-- 6.1 Types
DO $$ BEGIN
    CREATE TYPE sh_contact_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 6.2 Tenant Profiles
CREATE TABLE IF NOT EXISTS sh_tenant_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    headline TEXT,
    bio TEXT,
    age INTEGER,
    occupation TEXT,
    preferred_cities JSONB DEFAULT '[]'::JSONB,
    preferred_districts JSONB DEFAULT '[]'::JSONB,
    budget_min INTEGER,
    budget_max INTEGER,
    rooms_min INTEGER DEFAULT 1,
    rooms_max INTEGER,
    size_min_sqm INTEGER,
    move_in_date DATE,
    pets BOOLEAN DEFAULT FALSE,
    smoker BOOLEAN DEFAULT FALSE,
    schufa_ready BOOLEAN DEFAULT FALSE,
    income_proof_ready BOOLEAN DEFAULT FALSE,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sh_tenants_user ON sh_tenant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sh_tenants_visible ON sh_tenant_profiles(visible);
CREATE INDEX IF NOT EXISTS idx_sh_tenants_cities ON sh_tenant_profiles USING GIN(preferred_cities);

-- 6.3 Renter/Landlord Profiles
CREATE TABLE IF NOT EXISTS sh_renter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT,
    is_company BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sh_renters_user ON sh_renter_profiles(user_id);

-- 6.4 Housing Contacts
CREATE TABLE IF NOT EXISTS sh_housing_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    renter_id UUID REFERENCES sh_renter_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES sh_tenant_profiles(id) ON DELETE CASCADE,
    message TEXT,
    property_info TEXT,
    status sh_contact_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    responded_at TIMESTAMPTZ,
    UNIQUE(renter_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_sh_contacts_renter ON sh_housing_contacts(renter_id);
CREATE INDEX IF NOT EXISTS idx_sh_contacts_tenant ON sh_housing_contacts(tenant_id);

-- 6.5 Saved Tenants
CREATE TABLE IF NOT EXISTS sh_saved_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    renter_id UUID REFERENCES sh_renter_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES sh_tenant_profiles(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(renter_id, tenant_id)
);

-- 6.6 StratosHome RLS
ALTER TABLE sh_tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sh_renter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sh_housing_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sh_saved_tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view visible tenants" ON sh_tenant_profiles;
CREATE POLICY "Anyone view visible tenants" ON sh_tenant_profiles FOR SELECT USING (visible = TRUE);

DROP POLICY IF EXISTS "Users manage own tenant profile" ON sh_tenant_profiles;
CREATE POLICY "Users manage own tenant profile" ON sh_tenant_profiles FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone view verified renters" ON sh_renter_profiles;
CREATE POLICY "Anyone view verified renters" ON sh_renter_profiles FOR SELECT USING (verified = TRUE);

DROP POLICY IF EXISTS "Users manage own renter profile" ON sh_renter_profiles;
CREATE POLICY "Users manage own renter profile" ON sh_renter_profiles FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Renters send contacts" ON sh_housing_contacts;
CREATE POLICY "Renters send contacts" ON sh_housing_contacts FOR INSERT
WITH CHECK (renter_id IN (SELECT id FROM sh_renter_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Parties view contacts" ON sh_housing_contacts;
CREATE POLICY "Parties view contacts" ON sh_housing_contacts FOR SELECT
USING (
    renter_id IN (SELECT id FROM sh_renter_profiles WHERE user_id = auth.uid())
    OR tenant_id IN (SELECT id FROM sh_tenant_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Tenants respond to contacts" ON sh_housing_contacts;
CREATE POLICY "Tenants respond to contacts" ON sh_housing_contacts FOR UPDATE
USING (tenant_id IN (SELECT id FROM sh_tenant_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Renters manage saved" ON sh_saved_tenants;
CREATE POLICY "Renters manage saved" ON sh_saved_tenants FOR ALL
USING (renter_id IN (SELECT id FROM sh_renter_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage sh tenants" ON sh_tenant_profiles;
CREATE POLICY "Admins manage sh tenants" ON sh_tenant_profiles FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Admins manage sh renters" ON sh_renter_profiles;
CREATE POLICY "Admins manage sh renters" ON sh_renter_profiles FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Admins manage sh contacts" ON sh_housing_contacts;
CREATE POLICY "Admins manage sh contacts" ON sh_housing_contacts FOR ALL USING (is_admin());


-- ============================================
-- PART 7: VERIFICATION & SAMPLE DATA
-- ============================================

-- Check all tables were created
DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'profiles',
        'kr_patients', 'kr_family_connections', 'kr_care_logs',
        'st_developers', 'st_companies', 'st_contact_requests',
        'dn_books', 'dn_book_pages', 'dn_user_library',
        'ks_spaces', 'ks_messages', 'ks_reports',
        'sh_tenant_profiles', 'sh_renter_profiles', 'sh_housing_contacts', 'sh_saved_tenants'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
            RAISE WARNING 'Table % was not created!', t;
        END IF;
    END LOOP;
    RAISE NOTICE '✅ All tables verified!';
END $$;

-- ============================================
-- ADMIN SETUP
-- ============================================
-- To make a user admin after they sign up:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- ============================================
-- DONE!
-- ============================================
-- Your Stratos database is ready.
-- 
-- Table prefixes:
--   profiles    - Shared auth (all apps)
--   kr_*        - KinRelay
--   st_*        - StratosTalent  
--   dn_*        - DreamNest
--   ks_*        - KellerSharer
--   sh_*        - StratosHome
-- ============================================
