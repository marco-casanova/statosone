-- ============================================
-- KELLERSHARER - APP-SPECIFIC SCHEMA
-- ============================================
-- Run AFTER the shared auth schema (schema.sql)
-- Purpose: Marketplace for renting unused spaces
-- ============================================

-- ============================================
-- 1. SPACE LISTINGS
-- ============================================
CREATE TYPE space_type AS ENUM ('basement', 'garage', 'storage', 'warehouse', 'other');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'paused', 'rented');

CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Basic info
    title TEXT NOT NULL,
    description TEXT,
    space_type space_type DEFAULT 'storage',
    
    -- Size
    size_sqm DECIMAL(10,2), -- square meters
    
    -- Location
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'DE',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Pricing
    price_monthly INTEGER, -- in cents
    
    -- Features (stored as JSONB)
    features JSONB DEFAULT '[]'::JSONB, -- ['climate_controlled', 'secure', '24h_access']
    
    -- Images
    images JSONB DEFAULT '[]'::JSONB, -- array of URLs
    
    -- Status
    status listing_status DEFAULT 'draft',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_spaces_owner ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);
CREATE INDEX IF NOT EXISTS idx_spaces_city ON spaces(city);
CREATE INDEX IF NOT EXISTS idx_spaces_type ON spaces(space_type);
CREATE INDEX IF NOT EXISTS idx_spaces_price ON spaces(price_monthly);

-- ============================================
-- 2. CONTACT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS space_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Message
    message TEXT NOT NULL,
    
    -- Read status
    read_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_space ON space_messages(space_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON space_messages(sender_id);

-- ============================================
-- 3. REPORTS (for fraud review)
-- ============================================
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Report details
    reason TEXT NOT NULL,
    description TEXT,
    status report_status DEFAULT 'pending',
    
    -- Admin response
    admin_notes TEXT,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_space ON reports(space_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================
-- 4. RLS POLICIES
-- ============================================
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Spaces: Anyone can view active listings
CREATE POLICY "Anyone can view active spaces"
    ON spaces FOR SELECT
    USING (status = 'active');

-- Spaces: Owners can manage own listings
CREATE POLICY "Owners can manage own spaces"
    ON spaces FOR ALL
    USING (owner_id = auth.uid());

-- Messages: Owners and senders can view messages
CREATE POLICY "Parties can view messages"
    ON space_messages FOR SELECT
    USING (
        sender_id = auth.uid()
        OR
        space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid())
    );

-- Messages: Authenticated users can send messages
CREATE POLICY "Users can send messages"
    ON space_messages FOR INSERT
    WITH CHECK (sender_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Messages: Owners can mark as read
CREATE POLICY "Owners can update messages"
    ON space_messages FOR UPDATE
    USING (space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid()));

-- Reports: Authenticated users can create reports
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (reporter_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Reports: Reporters can view own reports
CREATE POLICY "Reporters can view own reports"
    ON reports FOR SELECT
    USING (reporter_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can manage all spaces"
    ON spaces FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all messages"
    ON space_messages FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage all reports"
    ON reports FOR ALL USING (is_admin());
