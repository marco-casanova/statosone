-- ============================================================
-- Shared Storage Bucket Strategy for Multi-MVP Supabase Project
-- ============================================================
-- This migration sets up a single "assets" bucket shared across all MVPs
-- with path-based separation and RLS policies for security.

-- ============================================================
-- 1. APPS TABLE - Registry of all MVPs
-- ============================================================
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,  -- e.g., 'dreamnest', 'kinrelay'
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert known apps
INSERT INTO apps (key, name, description) VALUES
  ('dreamnest', 'DreamNest Library', 'Virtual picture book platform for children'),
  ('kinrelay', 'KinRelay', 'Family communication app')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 2. USER_APP_MEMBERSHIPS - Links users to apps they can access
-- ============================================================
CREATE TABLE IF NOT EXISTS user_app_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_key TEXT NOT NULL REFERENCES apps(key) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'author', 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_key)
);

CREATE INDEX IF NOT EXISTS idx_user_app_memberships_user_id ON user_app_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_memberships_app_key ON user_app_memberships(app_key);

-- ============================================================
-- 3. HELPER FUNCTIONS
-- ============================================================

-- Extract app_key from storage path (first segment)
CREATE OR REPLACE FUNCTION storage_get_app_key(path TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Path format: {app_key}/{env}/{visibility}/{resource_type}/{owner_type}/{owner_id}/{filename}
  RETURN split_part(path, '/', 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Extract environment from storage path (second segment)
CREATE OR REPLACE FUNCTION storage_get_env(path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN split_part(path, '/', 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Extract visibility from storage path (third segment)
CREATE OR REPLACE FUNCTION storage_get_visibility(path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN split_part(path, '/', 3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Extract owner_id from storage path (sixth segment)
CREATE OR REPLACE FUNCTION storage_get_owner_id(path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN split_part(path, '/', 6);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if user is member of an app
CREATE OR REPLACE FUNCTION is_app_member(p_user_id UUID, p_app_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_app_memberships
    WHERE user_id = p_user_id AND app_key = p_app_key
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role in an app
CREATE OR REPLACE FUNCTION has_app_role(p_user_id UUID, p_app_key TEXT, p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_app_memberships
    WHERE user_id = p_user_id 
    AND app_key = p_app_key 
    AND role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current environment (from app settings or default)
CREATE OR REPLACE FUNCTION get_current_env()
RETURNS TEXT AS $$
BEGIN
  -- Could read from app_settings table or return default
  -- For now, return 'prod' as default
  RETURN COALESCE(current_setting('app.environment', true), 'prod');
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 4. CREATE SHARED BUCKET
-- ============================================================
-- Note: Run this in Supabase Dashboard or use their API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('assets', 'assets', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. STORAGE POLICIES FOR SHARED BUCKET
-- ============================================================

-- Drop existing policies if any (clean slate)
DROP POLICY IF EXISTS "Public assets are readable by anyone" ON storage.objects;
DROP POLICY IF EXISTS "Private assets readable by app members" ON storage.objects;
DROP POLICY IF EXISTS "App members can upload to their app" ON storage.objects;
DROP POLICY IF EXISTS "App members can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "App members can delete their uploads" ON storage.objects;

-- Policy 1: PUBLIC READ
-- Anyone can read assets where visibility = 'public'
CREATE POLICY "Public assets are readable by anyone"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'assets'
    AND storage_get_visibility(name) = 'public'
  );

-- Policy 2: PRIVATE READ
-- Authenticated users can read private assets if they're a member of that app
CREATE POLICY "Private assets readable by app members"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND storage_get_visibility(name) = 'private'
    AND is_app_member(auth.uid(), storage_get_app_key(name))
  );

-- Policy 3: INSERT
-- Authenticated users can upload to apps they're members of
CREATE POLICY "App members can upload to their app"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assets'
    AND is_app_member(auth.uid(), storage_get_app_key(name))
    -- Ensure the path follows our convention
    AND storage_get_app_key(name) IS NOT NULL
    AND storage_get_env(name) IN ('dev', 'staging', 'prod')
    AND storage_get_visibility(name) IN ('public', 'private')
  );

-- Policy 4: UPDATE
-- Users can update assets they uploaded (based on owner_id matching)
CREATE POLICY "App members can update their uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND is_app_member(auth.uid(), storage_get_app_key(name))
    -- For DreamNest, owner_id is author_id, check via authors table
    AND (
      -- Direct user ownership
      storage_get_owner_id(name) = auth.uid()::text
      -- Or author ownership (for DreamNest)
      OR storage_get_owner_id(name) IN (
        SELECT id::text FROM authors WHERE user_id = auth.uid()
      )
    )
  );

-- Policy 5: DELETE
-- Users can delete assets they uploaded
CREATE POLICY "App members can delete their uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND is_app_member(auth.uid(), storage_get_app_key(name))
    AND (
      storage_get_owner_id(name) = auth.uid()::text
      OR storage_get_owner_id(name) IN (
        SELECT id::text FROM authors WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- 6. RLS FOR USER_APP_MEMBERSHIPS
-- ============================================================
ALTER TABLE user_app_memberships ENABLE ROW LEVEL SECURITY;

-- Users can see their own memberships
CREATE POLICY "Users can view own memberships"
  ON user_app_memberships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only admins can create memberships (or use service role)
CREATE POLICY "Service role can manage memberships"
  ON user_app_memberships FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 7. AUTO-MEMBERSHIP ON SIGNUP (TRIGGER)
-- ============================================================
-- Automatically add users to DreamNest when they sign up
-- (Adjust this based on your signup flow)

CREATE OR REPLACE FUNCTION auto_add_app_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Default: Add new users to DreamNest
  -- In production, this would be based on which app they signed up from
  INSERT INTO user_app_memberships (user_id, app_key, role)
  VALUES (NEW.id, 'dreamnest', 'user')
  ON CONFLICT (user_id, app_key) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created_add_membership ON auth.users;
CREATE TRIGGER on_auth_user_created_add_membership
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_app_membership();

-- ============================================================
-- 8. MIGRATE EXISTING USERS TO HAVE DREAMNEST MEMBERSHIP
-- ============================================================
INSERT INTO user_app_memberships (user_id, app_key, role)
SELECT id, 'dreamnest', 'user'
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM user_app_memberships WHERE app_key = 'dreamnest'
)
ON CONFLICT (user_id, app_key) DO NOTHING;

-- Give existing authors the 'author' role
UPDATE user_app_memberships uam
SET role = 'author'
FROM authors a
WHERE uam.user_id = a.user_id 
AND uam.app_key = 'dreamnest'
AND uam.role = 'user';
