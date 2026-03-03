-- Normalize kr_activities RLS so client inserts can pass with recorded_by,
-- while still supporting deployments that use created_by/caregiver_id.

ALTER TABLE IF EXISTS kr_activities ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    has_recorded_by BOOLEAN;
    has_created_by BOOLEAN;
    has_caregiver_id BOOLEAN;
    owner_expr TEXT := 'false';
BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'kr_activities'
        AND column_name = 'recorded_by'
    ) INTO has_recorded_by;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'kr_activities'
        AND column_name = 'created_by'
    ) INTO has_created_by;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'kr_activities'
        AND column_name = 'caregiver_id'
    ) INTO has_caregiver_id;

    IF has_recorded_by THEN
      owner_expr := owner_expr || ' OR recorded_by = auth.uid()';
    END IF;
    IF has_created_by THEN
      owner_expr := owner_expr || ' OR created_by = auth.uid()';
    END IF;
    IF has_caregiver_id THEN
      owner_expr := owner_expr || ' OR caregiver_id = auth.uid()';
    END IF;

    -- Drop common historical policy names.
    EXECUTE 'DROP POLICY IF EXISTS "Users can view activities they created or are assigned to" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert activities" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own activities" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all select on kr_activities" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all insert on kr_activities" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all update on kr_activities" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all delete on kr_activities" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "kr_activities_select_owner" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "kr_activities_insert_owner" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "kr_activities_update_owner" ON kr_activities';
    EXECUTE 'DROP POLICY IF EXISTS "kr_activities_delete_owner" ON kr_activities';

    EXECUTE format(
      'CREATE POLICY "kr_activities_select_owner" ON kr_activities FOR SELECT USING (%s)',
      owner_expr
    );
    EXECUTE format(
      'CREATE POLICY "kr_activities_insert_owner" ON kr_activities FOR INSERT WITH CHECK (%s)',
      owner_expr
    );
    EXECUTE format(
      'CREATE POLICY "kr_activities_update_owner" ON kr_activities FOR UPDATE USING (%s)',
      owner_expr
    );
    EXECUTE format(
      'CREATE POLICY "kr_activities_delete_owner" ON kr_activities FOR DELETE USING (%s)',
      owner_expr
    );
END $$;
