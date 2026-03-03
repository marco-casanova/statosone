-- KinRelay clean baseline: shared extensions, helpers, profiles, and app memberships.
-- This file is intended for fresh Supabase projects.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_code text CHECK (country_code IS NULL OR char_length(country_code) = 2),
  latitude double precision,
  longitude double precision,
  geocoded_at timestamptz,
  role text CHECK (
    role IS NULL
    OR role IN ('patient', 'carer', 'family', 'specialist', 'nurse', 'caregiver', 'admin')
  ),
  status text NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'suspended', 'pending_approval')
  ),
  phone text,
  profile_image_url text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_lat_lng ON public.profiles(latitude, longitude);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_authenticated
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  incoming_role text;
BEGIN
  incoming_role := COALESCE(
    NEW.raw_user_meta_data->>'kr_role',
    NEW.raw_user_meta_data->>'role'
  );

  IF incoming_role NOT IN ('patient', 'carer', 'family', 'specialist', 'nurse', 'caregiver', 'admin') THEN
    incoming_role := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    incoming_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.app_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_name text NOT NULL,
  app_role text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_name)
);

CREATE INDEX IF NOT EXISTS idx_app_memberships_user ON public.app_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_app_memberships_app ON public.app_memberships(app_name);

ALTER TABLE public.app_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_memberships_select_self ON public.app_memberships;
CREATE POLICY app_memberships_select_self
ON public.app_memberships
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS app_memberships_insert_self ON public.app_memberships;
CREATE POLICY app_memberships_insert_self
ON public.app_memberships
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS app_memberships_update_self ON public.app_memberships;
CREATE POLICY app_memberships_update_self
ON public.app_memberships
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS app_memberships_updated_at ON public.app_memberships;
CREATE TRIGGER app_memberships_updated_at
BEFORE UPDATE ON public.app_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.user_has_app(app text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.app_memberships
    WHERE user_id = auth.uid()
      AND app_name = app
      AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_kinrelay_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.user_has_app('kinrelay');
END;
$$;

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  locale text NOT NULL,
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
