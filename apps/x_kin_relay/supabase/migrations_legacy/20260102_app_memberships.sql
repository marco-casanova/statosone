-- ============================================
-- STRATOS APP MEMBERSHIPS SYSTEM
-- ============================================
-- This table tracks which apps each user belongs to.
-- When a user registers for KinRelay, a row is added here.
-- This enables one Supabase project to serve multiple apps.
-- ============================================

-- App memberships table (which apps does each user belong to?)
CREATE TABLE IF NOT EXISTS app_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,  -- 'kinrelay', 'stratos', 'other_app', etc.
    app_role TEXT,           -- app-specific role
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, app_name)
);

CREATE INDEX IF NOT EXISTS idx_app_memberships_user ON app_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_app_memberships_app ON app_memberships(app_name);
CREATE INDEX IF NOT EXISTS idx_app_memberships_active ON app_memberships(is_active);

-- Enable RLS
ALTER TABLE app_memberships ENABLE ROW LEVEL SECURITY;

-- Users can see their own memberships
DROP POLICY IF EXISTS "Users view own memberships" ON app_memberships;
CREATE POLICY "Users view own memberships" ON app_memberships
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own memberships
DROP POLICY IF EXISTS "Users update own memberships" ON app_memberships;
CREATE POLICY "Users update own memberships" ON app_memberships
    FOR UPDATE USING (user_id = auth.uid());

-- Anyone can create memberships for themselves
DROP POLICY IF EXISTS "Users create own memberships" ON app_memberships;
CREATE POLICY "Users create own memberships" ON app_memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS app_memberships_updated_at ON app_memberships;
CREATE TRIGGER app_memberships_updated_at
    BEFORE UPDATE ON app_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- HELPER FUNCTION: Check if user belongs to an app
-- ============================================
CREATE OR REPLACE FUNCTION user_has_app(app TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM app_memberships
        WHERE user_id = auth.uid()
        AND app_name = app
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check if user is KinRelay member
-- ============================================
CREATE OR REPLACE FUNCTION is_kinrelay_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_app('kinrelay');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-CREATE KinRelay membership when kr_caregiver_profiles is created
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_kinrelay_membership()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO app_memberships (user_id, app_name, app_role, is_active)
    VALUES (NEW.user_id, 'kinrelay', NEW.kr_role::TEXT, TRUE)
    ON CONFLICT (user_id, app_name) DO UPDATE SET
        app_role = NEW.kr_role::TEXT,
        is_active = TRUE,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_kinrelay_membership ON kr_caregiver_profiles;
CREATE TRIGGER auto_kinrelay_membership
    AFTER INSERT OR UPDATE ON kr_caregiver_profiles
    FOR EACH ROW EXECUTE FUNCTION auto_create_kinrelay_membership();
