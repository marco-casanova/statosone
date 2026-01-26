-- Migration: add address + geolocation fields for profiles & recipients
-- Idempotent, additive changes. Adjust enums / policies separately if needed.

-- 1. Address & geo columns on profiles (users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='address_line1'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN address_line1 text,
      ADD COLUMN address_line2 text,
      ADD COLUMN city text,
      ADD COLUMN region text,
      ADD COLUMN postal_code text,
      ADD COLUMN country_code text CHECK (char_length(country_code) = 2),
      ADD COLUMN latitude double precision,
      ADD COLUMN longitude double precision,
      ADD COLUMN geocoded_at timestamptz;
  END IF;
END $$;

-- 2. Address & geo columns on care_recipients (place of care / residence)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='care_recipients' AND column_name='address_line1'
  ) THEN
    ALTER TABLE public.care_recipients
      ADD COLUMN address_line1 text,
      ADD COLUMN address_line2 text,
      ADD COLUMN city text,
      ADD COLUMN region text,
      ADD COLUMN postal_code text,
      ADD COLUMN country_code text CHECK (char_length(country_code) = 2),
      ADD COLUMN latitude double precision,
      ADD COLUMN longitude double precision,
      ADD COLUMN geocoded_at timestamptz;
  END IF;
END $$;

-- 3. Supporting index for geo lookups (simple btree on lat/lng or consider PostGIS later)
CREATE INDEX IF NOT EXISTS profiles_lat_lng_idx ON public.profiles USING btree (latitude, longitude);
CREATE INDEX IF NOT EXISTS care_recipients_lat_lng_idx ON public.care_recipients USING btree (latitude, longitude);

-- 4. Optional composite view to unify actors for map display
CREATE OR REPLACE VIEW public.actor_locations AS
SELECT p.id as actor_id,
       'carer'::text as actor_type,
       p.full_name as name,
       p.city,
       p.region,
       p.country_code,
       p.latitude,
       p.longitude,
       p.geocoded_at
  FROM public.profiles p
  WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
UNION ALL
SELECT r.id as actor_id,
       'patient'::text as actor_type,
       r.display_name as name,
       r.city,
       r.region,
       r.country_code,
       r.latitude,
       r.longitude,
       r.geocoded_at
  FROM public.care_recipients r
  WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL;

-- 5. (Optional) RLS policies must be added separately to allow reading actor_locations.
-- Example (adjust for your model):
-- CREATE POLICY "actor_locations_select" ON public.actor_locations FOR SELECT USING (true);

-- 6. (Optional) Add a trigger / function for auto geocoding (out of scope here).
