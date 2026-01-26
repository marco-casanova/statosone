-- ============================================
-- STRATOSTALENT - APP-SPECIFIC SCHEMA
-- ============================================
-- Run AFTER the shared auth schema (schema.sql)
-- Purpose: Companies renting developers
-- ============================================

-- ============================================
-- 1. DEVELOPER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Basic info
    title TEXT, -- 'Senior Frontend Developer', etc.
    bio TEXT,
    years_experience INTEGER,
    
    -- Skills (stored as JSONB array)
    skills JSONB DEFAULT '[]'::JSONB,
    
    -- Availability
    available BOOLEAN DEFAULT TRUE,
    hourly_rate INTEGER, -- in cents
    
    -- Location
    location TEXT,
    remote_only BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_developers_user_id ON developers(user_id);
CREATE INDEX IF NOT EXISTS idx_developers_available ON developers(available);
CREATE INDEX IF NOT EXISTS idx_developers_skills ON developers USING GIN(skills);

-- ============================================
-- 2. COMPANY PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Company info
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    website TEXT,
    
    -- Contact
    contact_email TEXT,
    contact_phone TEXT,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verified);

-- ============================================
-- 3. CONTACT REQUESTS
-- ============================================
CREATE TYPE contact_request_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
    
    -- Request details
    message TEXT,
    status contact_request_status DEFAULT 'pending',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    responded_at TIMESTAMPTZ,
    
    UNIQUE(company_id, developer_id)
);

CREATE INDEX IF NOT EXISTS idx_requests_company ON contact_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_requests_developer ON contact_requests(developer_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON contact_requests(status);

-- ============================================
-- 4. RLS POLICIES
-- ============================================
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Developers: Public read for available developers
CREATE POLICY "Anyone can view available developers"
    ON developers FOR SELECT
    USING (available = TRUE);

-- Developers: Users can manage own profile
CREATE POLICY "Users can manage own developer profile"
    ON developers FOR ALL
    USING (user_id = auth.uid());

-- Companies: Verified companies are public
CREATE POLICY "Anyone can view verified companies"
    ON companies FOR SELECT
    USING (verified = TRUE);

-- Companies: Users can manage own company
CREATE POLICY "Users can manage own company"
    ON companies FOR ALL
    USING (user_id = auth.uid());

-- Contact requests: Companies can send
CREATE POLICY "Companies can send contact requests"
    ON contact_requests FOR INSERT
    WITH CHECK (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- Contact requests: Both parties can view their requests
CREATE POLICY "Parties can view their requests"
    ON contact_requests FOR SELECT
    USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
        OR
        developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid())
    );

-- Contact requests: Developers can respond
CREATE POLICY "Developers can respond to requests"
    ON contact_requests FOR UPDATE
    USING (developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can manage all developers"
    ON developers FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all companies"
    ON companies FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all requests"
    ON contact_requests FOR ALL USING (is_admin());
