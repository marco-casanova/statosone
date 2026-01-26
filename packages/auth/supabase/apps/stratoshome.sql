-- ============================================
-- STRATOSHOME - APP-SPECIFIC SCHEMA
-- ============================================
-- Run AFTER the shared auth schema (schema.sql)
-- Purpose: Inverted real estate - renters find tenants
-- ============================================

-- ============================================
-- 1. TENANT PROFILES (users looking for housing)
-- ============================================
CREATE TABLE IF NOT EXISTS tenant_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Basic info
    headline TEXT, -- "Young professional looking for 2-room apartment"
    bio TEXT,
    
    -- Demographics
    age INTEGER,
    occupation TEXT,
    
    -- Preferences
    preferred_cities JSONB DEFAULT '[]'::JSONB,
    preferred_districts JSONB DEFAULT '[]'::JSONB,
    
    -- Budget
    budget_min INTEGER, -- in cents
    budget_max INTEGER,
    
    -- Requirements
    rooms_min INTEGER DEFAULT 1,
    rooms_max INTEGER,
    size_min_sqm INTEGER,
    move_in_date DATE,
    
    -- Lifestyle
    pets BOOLEAN DEFAULT FALSE,
    smoker BOOLEAN DEFAULT FALSE,
    
    -- Documents ready
    schufa_ready BOOLEAN DEFAULT FALSE,
    income_proof_ready BOOLEAN DEFAULT FALSE,
    
    -- Visibility
    visible BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenants_user ON tenant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_visible ON tenant_profiles(visible);
CREATE INDEX IF NOT EXISTS idx_tenants_budget ON tenant_profiles(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_tenants_cities ON tenant_profiles USING GIN(preferred_cities);

-- ============================================
-- 2. RENTER/LANDLORD PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS renter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Info
    company_name TEXT,
    is_company BOOLEAN DEFAULT FALSE,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_renters_user ON renter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_renters_verified ON renter_profiles(verified);

-- ============================================
-- 3. CONTACT REQUESTS (Renter → Tenant)
-- ============================================
CREATE TYPE contact_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE IF NOT EXISTS housing_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    renter_id UUID REFERENCES renter_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenant_profiles(id) ON DELETE CASCADE,
    
    -- Contact details
    message TEXT,
    property_info TEXT, -- brief description of what they're offering
    
    -- Status
    status contact_status DEFAULT 'pending',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    responded_at TIMESTAMPTZ,
    
    UNIQUE(renter_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_renter ON housing_contacts(renter_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON housing_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON housing_contacts(status);

-- ============================================
-- 4. SAVED PROFILES (Renter bookmarks)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    renter_id UUID REFERENCES renter_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenant_profiles(id) ON DELETE CASCADE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(renter_id, tenant_id)
);

-- ============================================
-- 5. RLS POLICIES
-- ============================================
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE renter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tenants ENABLE ROW LEVEL SECURITY;

-- Tenant profiles: Visible profiles are public
CREATE POLICY "Anyone can view visible tenant profiles"
    ON tenant_profiles FOR SELECT
    USING (visible = TRUE);

-- Tenant profiles: Users manage own profile
CREATE POLICY "Users can manage own tenant profile"
    ON tenant_profiles FOR ALL
    USING (user_id = auth.uid());

-- Renter profiles: Verified are public
CREATE POLICY "Anyone can view verified renters"
    ON renter_profiles FOR SELECT
    USING (verified = TRUE);

-- Renter profiles: Users manage own
CREATE POLICY "Users can manage own renter profile"
    ON renter_profiles FOR ALL
    USING (user_id = auth.uid());

-- Contacts: Renters can initiate
CREATE POLICY "Renters can send contacts"
    ON housing_contacts FOR INSERT
    WITH CHECK (
        renter_id IN (SELECT id FROM renter_profiles WHERE user_id = auth.uid())
    );

-- Contacts: Both parties can view
CREATE POLICY "Parties can view contacts"
    ON housing_contacts FOR SELECT
    USING (
        renter_id IN (SELECT id FROM renter_profiles WHERE user_id = auth.uid())
        OR
        tenant_id IN (SELECT id FROM tenant_profiles WHERE user_id = auth.uid())
    );

-- Contacts: Tenants can respond
CREATE POLICY "Tenants can respond to contacts"
    ON housing_contacts FOR UPDATE
    USING (tenant_id IN (SELECT id FROM tenant_profiles WHERE user_id = auth.uid()));

-- Saved tenants: Renters manage own
CREATE POLICY "Renters can manage saved tenants"
    ON saved_tenants FOR ALL
    USING (renter_id IN (SELECT id FROM renter_profiles WHERE user_id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can manage all tenant profiles"
    ON tenant_profiles FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all renter profiles"
    ON renter_profiles FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all contacts"
    ON housing_contacts FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all saved"
    ON saved_tenants FOR SELECT USING (is_admin());
