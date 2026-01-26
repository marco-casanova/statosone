-- Migration: expand ADL subtypes & add assistance_level
-- Safe additive changes only.

-- 1. Assistance level enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assistance_level_enum') THEN
    CREATE TYPE assistance_level_enum AS ENUM ('independent','supervision','partial','full');
  END IF;
END $$;

-- 2. Add new ADL subtype values (existing enum name assumed: adl_subtype_enum)
-- NOTE: Adding enum values is irreversible; ensure names correct.
ALTER TYPE adl_subtype_enum ADD VALUE IF NOT EXISTS 'transfer';
ALTER TYPE adl_subtype_enum ADD VALUE IF NOT EXISTS 'ambulation_walk';
ALTER TYPE adl_subtype_enum ADD VALUE IF NOT EXISTS 'bathing_hygiene';
ALTER TYPE adl_subtype_enum ADD VALUE IF NOT EXISTS 'dressing_grooming';
ALTER TYPE adl_subtype_enum ADD VALUE IF NOT EXISTS 'feeding';
ALTER TYPE adl_subtype_enum ADD VALUE IF NOT EXISTS 'continence_bladder';
ALTER TYPE adl_subtype_enum ADD VALUE IF NOT EXISTS 'continence_bowel';

-- 3. Add assistance_level column to activities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='activities' AND column_name='assistance_level'
  ) THEN
    ALTER TABLE public.activities ADD COLUMN assistance_level assistance_level_enum NULL;
  END IF;
END $$;

-- 4. (Optional) Future: consider moving 'vital_sign' and 'weight_entry' out of ADL to observation.
-- Leave data intact for now.

-- 5. (Optional data normalization) Map legacy mobility_transfer -> transfer
-- UPDATE public.activities SET subtype_adl='transfer' WHERE subtype_adl='mobility_transfer';

-- 6. Verify
-- SELECT distinct subtype_adl FROM public.activities ORDER BY 1;

-- 7. Engagement category (add new enum value to incident_category_enum if exists) & new subtype column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_category_enum') THEN
    ALTER TYPE incident_category_enum ADD VALUE IF NOT EXISTS 'engagement';
  END IF;
END $$;

-- Add engagement subtype enum if desired (separate) else reuse generic text; here we add dedicated enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'engagement_subtype_enum') THEN
    CREATE TYPE engagement_subtype_enum AS ENUM (
      'reading','video_game','tv_viewing','music_listening','social_visit','puzzle_brain','exercise_light','exercise_moderate','outdoor_walk','art_craft'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='activities' AND column_name='subtype_engagement'
  ) THEN
    ALTER TABLE public.activities ADD COLUMN subtype_engagement engagement_subtype_enum NULL;
  END IF;
END $$;
