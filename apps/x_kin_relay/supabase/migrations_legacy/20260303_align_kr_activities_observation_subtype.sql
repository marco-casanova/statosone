-- Align kr_activities with the app payloads that use subtype_observation.
-- Older variants created subtype_health instead, which causes PostgREST schema-cache
-- errors when the client inserts subtype_observation.

ALTER TABLE IF EXISTS kr_activities
  ADD COLUMN IF NOT EXISTS subtype_observation TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'kr_activities'
      AND column_name = 'subtype_health'
  ) THEN
    UPDATE kr_activities
    SET subtype_observation = COALESCE(subtype_observation, subtype_health)
    WHERE subtype_observation IS NULL
      AND subtype_health IS NOT NULL;
  END IF;
END $$;
