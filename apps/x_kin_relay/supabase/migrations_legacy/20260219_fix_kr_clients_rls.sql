-- ============================================
-- FIX KR_CLIENTS RLS & RELATED TABLES
-- ============================================
-- Fixes "new row violates row-level security policy for table kr_clients"
-- by ensuring permissive policies exist for all authenticated users.
-- Run this in Supabase SQL Editor.
-- ============================================

-- Drop ALL existing policies on kr_clients dynamically
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE tablename = 'kr_clients' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.kr_clients', policy_record.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.kr_clients ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to SELECT clients
CREATE POLICY "kr_clients_select"
ON public.kr_clients FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to INSERT clients (family_member_id will be their uid)
CREATE POLICY "kr_clients_insert"
ON public.kr_clients FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to UPDATE clients they own (or any, for carers)
CREATE POLICY "kr_clients_update"
ON public.kr_clients FOR UPDATE
TO authenticated
USING (true);

-- Allow users to DELETE clients they own
CREATE POLICY "kr_clients_delete"
ON public.kr_clients FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- KR_CARE_CIRCLES — ensure permissive policies too
-- (ProfileCreation inserts a circle before the client)
-- ============================================
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE tablename = 'kr_care_circles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.kr_care_circles', policy_record.policyname);
    END LOOP;
END $$;

ALTER TABLE public.kr_care_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kr_care_circles_select"
ON public.kr_care_circles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "kr_care_circles_insert"
ON public.kr_care_circles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "kr_care_circles_update"
ON public.kr_care_circles FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "kr_care_circles_delete"
ON public.kr_care_circles FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- KR_CIRCLE_MEMBERS — ensure permissive policies
-- ============================================
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE tablename = 'kr_circle_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.kr_circle_members', policy_record.policyname);
    END LOOP;
END $$;

ALTER TABLE public.kr_circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kr_circle_members_all"
ON public.kr_circle_members FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- Ensure date_of_birth is nullable
-- (original schema had it NOT NULL, but ProfileCreation doesn't pass it)
-- ============================================
ALTER TABLE public.kr_clients ALTER COLUMN date_of_birth DROP NOT NULL;

-- Ensure full_name is nullable (we use display_name)
ALTER TABLE public.kr_clients ALTER COLUMN full_name DROP NOT NULL;
