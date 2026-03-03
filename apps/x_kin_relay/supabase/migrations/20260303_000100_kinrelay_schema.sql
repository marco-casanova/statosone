-- KinRelay clean baseline: normalized schema matching the current app.
-- This file replaces the previous conflicting migration branches.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kr_caregiver_role') THEN
    CREATE TYPE public.kr_caregiver_role AS ENUM ('family', 'specialist', 'nurse', 'caregiver');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kr_task_status') THEN
    CREATE TYPE public.kr_task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kr_incident_severity') THEN
    CREATE TYPE public.kr_incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.kr_caregiver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  kr_role public.kr_caregiver_role NOT NULL DEFAULT 'family',
  role text NOT NULL DEFAULT 'family' CHECK (role IN ('family', 'specialist', 'nurse', 'caregiver')),
  status text NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'suspended', 'pending_approval')
  ),
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  date_of_birth date,
  bio text,
  specialization text,
  certifications text[] NOT NULL DEFAULT '{}'::text[],
  years_of_experience integer,
  hourly_rate numeric(10, 2),
  availability jsonb NOT NULL DEFAULT '{}'::jsonb,
  languages text[] NOT NULL DEFAULT '{}'::text[],
  is_available_for_hire boolean NOT NULL DEFAULT false,
  rating numeric(3, 2) NOT NULL DEFAULT 0.00,
  total_reviews integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_user ON public.kr_caregiver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_kr_role ON public.kr_caregiver_profiles(kr_role);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_role ON public.kr_caregiver_profiles(role);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_status ON public.kr_caregiver_profiles(status);
CREATE INDEX IF NOT EXISTS idx_kr_caregiver_profiles_available ON public.kr_caregiver_profiles(is_available_for_hire);

CREATE OR REPLACE FUNCTION public.sync_kr_caregiver_profile_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.kr_role IS NULL AND NEW.role IS NOT NULL THEN
    NEW.kr_role := NEW.role::public.kr_caregiver_role;
  END IF;

  NEW.role := NEW.kr_role::text;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kr_caregiver_profiles_sync_compat ON public.kr_caregiver_profiles;
CREATE TRIGGER kr_caregiver_profiles_sync_compat
BEFORE INSERT OR UPDATE ON public.kr_caregiver_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_kr_caregiver_profile_compat_fields();

CREATE TABLE IF NOT EXISTS public.kr_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text,
  full_name text,
  birth_year integer,
  date_of_birth date,
  gender text,
  address text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_code text CHECK (country_code IS NULL OR char_length(country_code) = 2),
  latitude double precision,
  longitude double precision,
  geocoded_at timestamptz,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_conditions text[] NOT NULL DEFAULT '{}'::text[],
  allergies text[] NOT NULL DEFAULT '{}'::text[],
  medications_notes text,
  dietary_restrictions text,
  mobility_level text,
  cognitive_status text,
  insurance_provider text,
  insurance_policy_number text,
  primary_physician_name text,
  primary_physician_phone text,
  primary_language text NOT NULL DEFAULT 'en',
  care_requirements text,
  additional_notes text,
  profile_image_url text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_clients_family_member ON public.kr_clients(family_member_id);
CREATE INDEX IF NOT EXISTS idx_kr_clients_display_name ON public.kr_clients(display_name);
CREATE INDEX IF NOT EXISTS idx_kr_clients_city ON public.kr_clients(city);
CREATE INDEX IF NOT EXISTS idx_kr_clients_lat_lng ON public.kr_clients(latitude, longitude);

CREATE OR REPLACE FUNCTION public.sync_kr_client_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.display_name IS NULL OR btrim(NEW.display_name) = '' THEN
    NEW.display_name := NULLIF(NEW.full_name, '');
  END IF;

  IF NEW.full_name IS NULL OR btrim(NEW.full_name) = '' THEN
    NEW.full_name := NULLIF(NEW.display_name, '');
  END IF;

  IF NEW.birth_year IS NULL AND NEW.date_of_birth IS NOT NULL THEN
    NEW.birth_year := EXTRACT(YEAR FROM NEW.date_of_birth)::integer;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kr_clients_sync_compat ON public.kr_clients;
CREATE TRIGGER kr_clients_sync_compat
BEFORE INSERT OR UPDATE ON public.kr_clients
FOR EACH ROW
EXECUTE FUNCTION public.sync_kr_client_compat_fields();

CREATE TABLE IF NOT EXISTS public.kr_care_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'family',
  description text,
  client_id uuid REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  primary_contact_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_care_circles_client ON public.kr_care_circles(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_care_circles_active ON public.kr_care_circles(is_active);

ALTER TABLE public.kr_clients
  ADD COLUMN IF NOT EXISTS circle_id uuid REFERENCES public.kr_care_circles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kr_clients_circle ON public.kr_clients(circle_id);

CREATE TABLE IF NOT EXISTS public.kr_circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.kr_care_circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  permissions jsonb NOT NULL DEFAULT '{"can_log": true, "can_view_reports": true, "can_manage": false}'::jsonb,
  joined_at timestamptz NOT NULL DEFAULT NOW(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_kr_circle_members_circle ON public.kr_circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_kr_circle_members_user ON public.kr_circle_members(user_id);

CREATE TABLE IF NOT EXISTS public.kr_care_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  specialist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  assignment_type text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_care_assignments_client ON public.kr_care_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_care_assignments_specialist ON public.kr_care_assignments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_kr_care_assignments_active ON public.kr_care_assignments(is_active);

CREATE TABLE IF NOT EXISTS public.kr_care_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_es text NOT NULL,
  icon text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kr_care_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.kr_care_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_es text NOT NULL,
  unit text,
  input_type text NOT NULL DEFAULT 'text',
  options jsonb,
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_care_subcategories_category ON public.kr_care_subcategories(category_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_kr_care_subcategories_category_name
ON public.kr_care_subcategories(category_id, name);

CREATE TABLE IF NOT EXISTS public.kr_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.kr_care_categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES public.kr_care_subcategories(id) ON DELETE SET NULL,
  task_date date NOT NULL,
  scheduled_time time,
  completed_time timestamptz,
  status public.kr_task_status NOT NULL DEFAULT 'pending',
  value jsonb,
  description text,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_tasks_client ON public.kr_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_tasks_assigned_to ON public.kr_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_kr_tasks_date ON public.kr_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_kr_tasks_status ON public.kr_tasks(status);

CREATE TABLE IF NOT EXISTS public.kr_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  generic_name text,
  brand_name text,
  form text DEFAULT 'tablet',
  route text DEFAULT 'oral',
  dose text,
  dosage text,
  unit text,
  strength text,
  frequency text,
  frequency_times integer,
  schedule_times time[],
  schedule jsonb,
  instructions text,
  purpose text,
  prescribing_doctor text,
  prescriber_name text,
  prescriber_phone text,
  pharmacy_name text,
  pharmacy_phone text,
  prescription_number text,
  rx_number text,
  start_date date,
  end_date date,
  refills_remaining integer,
  last_refill_date date,
  next_refill_date date,
  side_effects text[] NOT NULL DEFAULT '{}'::text[],
  interactions text[] NOT NULL DEFAULT '{}'::text[],
  warnings text[] NOT NULL DEFAULT '{}'::text[],
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_prn boolean NOT NULL DEFAULT false,
  prn_instructions text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_medications_client ON public.kr_medications(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_medications_recipient ON public.kr_medications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_medications_is_active ON public.kr_medications(is_active);
CREATE INDEX IF NOT EXISTS idx_kr_medications_name ON public.kr_medications(name);

CREATE OR REPLACE FUNCTION public.sync_kr_medication_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.client_id IS NULL THEN
    NEW.client_id := NEW.recipient_id;
  END IF;

  IF NEW.recipient_id IS NULL THEN
    NEW.recipient_id := NEW.client_id;
  END IF;

  IF NEW.is_active IS NULL AND NEW.active IS NOT NULL THEN
    NEW.is_active := NEW.active;
  END IF;

  IF NEW.active IS NULL AND NEW.is_active IS NOT NULL THEN
    NEW.active := NEW.is_active;
  END IF;

  IF NEW.dosage IS NULL AND NEW.dose IS NOT NULL THEN
    NEW.dosage := NEW.dose;
  END IF;

  IF NEW.dose IS NULL AND NEW.dosage IS NOT NULL THEN
    NEW.dose := NEW.dosage;
  END IF;

  IF NEW.prescribing_doctor IS NULL AND NEW.prescriber_name IS NOT NULL THEN
    NEW.prescribing_doctor := NEW.prescriber_name;
  END IF;

  IF NEW.prescriber_name IS NULL AND NEW.prescribing_doctor IS NOT NULL THEN
    NEW.prescriber_name := NEW.prescribing_doctor;
  END IF;

  IF NEW.schedule IS NULL AND NEW.schedule_times IS NOT NULL THEN
    NEW.schedule := jsonb_build_object('times', NEW.schedule_times);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kr_medications_sync_compat ON public.kr_medications;
CREATE TRIGGER kr_medications_sync_compat
BEFORE INSERT OR UPDATE ON public.kr_medications
FOR EACH ROW
EXECUTE FUNCTION public.sync_kr_medication_compat_fields();

CREATE TABLE IF NOT EXISTS public.kr_medication_administrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES public.kr_medications(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  administered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_time timestamptz NOT NULL,
  actual_time timestamptz,
  dosage_given text,
  was_taken boolean NOT NULL DEFAULT false,
  was_refused boolean NOT NULL DEFAULT false,
  refusal_reason text,
  side_effects_observed text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_med_admin_client ON public.kr_medication_administrations(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_med_admin_medication ON public.kr_medication_administrations(medication_id);
CREATE INDEX IF NOT EXISTS idx_kr_med_admin_scheduled ON public.kr_medication_administrations(scheduled_time);

CREATE TABLE IF NOT EXISTS public.kr_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.kr_care_circles(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES public.kr_clients(id) ON DELETE SET NULL,
  client_id uuid,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  caregiver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category text NOT NULL,
  activity_type text,
  observed_at timestamptz NOT NULL DEFAULT NOW(),
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  activity_time time DEFAULT CURRENT_TIME,
  duration_minutes integer,
  value jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  subtype_safety text,
  subtype_observation text,
  subtype_health text,
  subtype_adl text,
  subtype_environment text,
  subtype_service text,
  subtype_engagement text,
  assistance_level text,
  severity text,
  notes text,
  location text,
  mood text,
  energy_level text,
  attachments text[] NOT NULL DEFAULT '{}'::text[],
  is_flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  status text NOT NULL DEFAULT 'logged',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_activities_circle ON public.kr_activities(circle_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_recipient ON public.kr_activities(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_category ON public.kr_activities(category);
CREATE INDEX IF NOT EXISTS idx_kr_activities_observed_at ON public.kr_activities(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_kr_activities_recorded_by ON public.kr_activities(recorded_by);

CREATE OR REPLACE FUNCTION public.sync_kr_activity_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.client_id IS NULL THEN
    NEW.client_id := NEW.recipient_id;
  END IF;

  IF NEW.recipient_id IS NULL THEN
    NEW.recipient_id := NEW.client_id;
  END IF;

  IF NEW.subtype_observation IS NULL AND NEW.subtype_health IS NOT NULL THEN
    NEW.subtype_observation := NEW.subtype_health;
  END IF;

  IF NEW.subtype_health IS NULL AND NEW.subtype_observation IS NOT NULL THEN
    NEW.subtype_health := NEW.subtype_observation;
  END IF;

  IF NEW.observed_at IS NULL THEN
    NEW.observed_at := COALESCE(
      (NEW.activity_date + COALESCE(NEW.activity_time, TIME '00:00')) AT TIME ZONE 'UTC',
      NOW()
    );
  END IF;

  NEW.activity_date := COALESCE(NEW.activity_date, (NEW.observed_at AT TIME ZONE 'UTC')::date);
  NEW.activity_time := COALESCE(NEW.activity_time, (NEW.observed_at AT TIME ZONE 'UTC')::time);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kr_activities_sync_compat ON public.kr_activities;
CREATE TRIGGER kr_activities_sync_compat
BEFORE INSERT OR UPDATE ON public.kr_activities
FOR EACH ROW
EXECUTE FUNCTION public.sync_kr_activity_compat_fields();

CREATE TABLE IF NOT EXISTS public.kr_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  incident_type text NOT NULL,
  severity public.kr_incident_severity NOT NULL DEFAULT 'medium',
  incident_date timestamptz NOT NULL DEFAULT NOW(),
  location text,
  description text NOT NULL,
  immediate_action_taken text,
  witnesses text[] NOT NULL DEFAULT '{}'::text[],
  injuries_sustained text,
  medical_attention_required boolean NOT NULL DEFAULT false,
  medical_attention_details text,
  family_notified boolean NOT NULL DEFAULT false,
  family_notification_time timestamptz,
  follow_up_required boolean NOT NULL DEFAULT false,
  follow_up_notes text,
  attachments text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_incidents_client ON public.kr_incidents(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_incidents_date ON public.kr_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_kr_incidents_severity ON public.kr_incidents(severity);

CREATE TABLE IF NOT EXISTS public.kr_behavior_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  behavior_type text NOT NULL,
  severity text,
  trigger text,
  antecedent text,
  behavior_description text NOT NULL,
  consequence text,
  intervention_used text,
  effectiveness text,
  duration_minutes integer,
  time_of_day time,
  recorded_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kr_sleep_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sleep_date date NOT NULL,
  bedtime time,
  wake_time time,
  total_hours numeric(4, 2),
  quality text,
  interruptions integer NOT NULL DEFAULT 0,
  interruption_reasons text[] NOT NULL DEFAULT '{}'::text[],
  naps jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kr_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.kr_clients(id) ON DELETE CASCADE,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.kr_care_categories(id) ON DELETE SET NULL,
  log_date date NOT NULL,
  log_time time,
  activity_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kr_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.kr_clients(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  would_recommend boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kr_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.kr_clients(id) ON DELETE SET NULL,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  parent_message_id uuid REFERENCES public.kr_messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kr_ref_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_display text NOT NULL,
  active_substance text,
  atc_code text,
  category text,
  source text NOT NULL DEFAULT 'docmorris',
  verified boolean NOT NULL DEFAULT false,
  evidence_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_kr_ref_medications_substance_cat
ON public.kr_ref_medications (COALESCE(active_substance, ''), COALESCE(atc_code, ''), COALESCE(category, ''));

CREATE OR REPLACE FUNCTION public.auto_create_kinrelay_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_memberships (user_id, app_name, app_role, is_active)
  VALUES (NEW.user_id, 'kinrelay', NEW.kr_role::text, NEW.status = 'active')
  ON CONFLICT (user_id, app_name) DO UPDATE
  SET
    app_role = EXCLUDED.app_role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kr_caregiver_profiles_sync_membership ON public.kr_caregiver_profiles;
CREATE TRIGGER kr_caregiver_profiles_sync_membership
AFTER INSERT OR UPDATE OF kr_role, status ON public.kr_caregiver_profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_kinrelay_membership();

CREATE OR REPLACE FUNCTION public.kr_update_specialist_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.kr_caregiver_profiles
  SET
    rating = COALESCE(
      (SELECT AVG(rating)::numeric(3, 2) FROM public.kr_reviews WHERE specialist_id = NEW.specialist_id),
      0
    ),
    total_reviews = (
      SELECT COUNT(*) FROM public.kr_reviews WHERE specialist_id = NEW.specialist_id
    )
  WHERE user_id = NEW.specialist_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kr_reviews_update_rating ON public.kr_reviews;
CREATE TRIGGER kr_reviews_update_rating
AFTER INSERT OR UPDATE ON public.kr_reviews
FOR EACH ROW
EXECUTE FUNCTION public.kr_update_specialist_rating();

DROP TRIGGER IF EXISTS kr_caregiver_profiles_updated_at ON public.kr_caregiver_profiles;
CREATE TRIGGER kr_caregiver_profiles_updated_at
BEFORE UPDATE ON public.kr_caregiver_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_clients_updated_at ON public.kr_clients;
CREATE TRIGGER kr_clients_updated_at
BEFORE UPDATE ON public.kr_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_care_circles_updated_at ON public.kr_care_circles;
CREATE TRIGGER kr_care_circles_updated_at
BEFORE UPDATE ON public.kr_care_circles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_care_assignments_updated_at ON public.kr_care_assignments;
CREATE TRIGGER kr_care_assignments_updated_at
BEFORE UPDATE ON public.kr_care_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_tasks_updated_at ON public.kr_tasks;
CREATE TRIGGER kr_tasks_updated_at
BEFORE UPDATE ON public.kr_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_medications_updated_at ON public.kr_medications;
CREATE TRIGGER kr_medications_updated_at
BEFORE UPDATE ON public.kr_medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_activities_updated_at ON public.kr_activities;
CREATE TRIGGER kr_activities_updated_at
BEFORE UPDATE ON public.kr_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_incidents_updated_at ON public.kr_incidents;
CREATE TRIGGER kr_incidents_updated_at
BEFORE UPDATE ON public.kr_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS kr_reviews_updated_at ON public.kr_reviews;
CREATE TRIGGER kr_reviews_updated_at
BEFORE UPDATE ON public.kr_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE VIEW public.care_recipients AS
SELECT
  c.id,
  COALESCE(c.display_name, c.full_name) AS display_name,
  c.full_name,
  c.family_member_id,
  c.circle_id,
  c.birth_year,
  c.date_of_birth,
  c.primary_language,
  c.address_line1,
  c.address_line2,
  c.city,
  c.region,
  c.postal_code,
  c.country_code,
  c.latitude,
  c.longitude,
  c.geocoded_at
FROM public.kr_clients c;

CREATE OR REPLACE VIEW public.actor_locations AS
SELECT
  p.id AS actor_id,
  'carer'::text AS actor_type,
  COALESCE(p.full_name, p.email, p.id::text) AS name,
  p.city,
  p.region,
  p.country_code,
  p.latitude,
  p.longitude,
  p.geocoded_at
FROM public.profiles p
WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
UNION ALL
SELECT
  r.id AS actor_id,
  'patient'::text AS actor_type,
  r.display_name AS name,
  r.city,
  r.region,
  r.country_code,
  r.latitude,
  r.longitude,
  r.geocoded_at
FROM public.care_recipients r
WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL;

GRANT SELECT ON public.care_recipients TO authenticated;
GRANT SELECT ON public.actor_locations TO authenticated;

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'kr_caregiver_profiles',
    'kr_clients',
    'kr_care_circles',
    'kr_circle_members',
    'kr_care_assignments',
    'kr_care_categories',
    'kr_care_subcategories',
    'kr_tasks',
    'kr_medications',
    'kr_activities',
    'kr_medication_administrations',
    'kr_incidents',
    'kr_behavior_patterns',
    'kr_sleep_patterns',
    'kr_activity_logs',
    'kr_reviews',
    'kr_messages',
    'kr_ref_medications'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_select_authenticated', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
      tbl || '_select_authenticated',
      tbl
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_insert_authenticated', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (true)',
      tbl || '_insert_authenticated',
      tbl
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_update_authenticated', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
      tbl || '_update_authenticated',
      tbl
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_delete_authenticated', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (true)',
      tbl || '_delete_authenticated',
      tbl
    );
  END LOOP;
END $$;
