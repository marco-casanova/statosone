-- Allow authors to use shared 'assets' bucket without needing user_app_memberships

-- Extra INSERT policy for DreamNest authors
CREATE POLICY "Authors can upload dreamnest assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assets'
    AND storage_get_app_key(name) = 'dreamnest'
    AND storage_get_env(name) IN ('dev', 'staging', 'prod')
    AND storage_get_owner_id(name) IN (
      SELECT id::text FROM authors WHERE user_id = auth.uid()
    )
  );

-- Extra SELECT policy for their own assets (private or public)
CREATE POLICY "Authors can read dreamnest assets they own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND storage_get_app_key(name) = 'dreamnest'
    AND storage_get_owner_id(name) IN (
      SELECT id::text FROM authors WHERE user_id = auth.uid()
    )
  );

-- Extra UPDATE policy for their own assets
CREATE POLICY "Authors can update dreamnest assets they own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND storage_get_app_key(name) = 'dreamnest'
    AND storage_get_owner_id(name) IN (
      SELECT id::text FROM authors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'assets'
    AND storage_get_app_key(name) = 'dreamnest'
    AND storage_get_owner_id(name) IN (
      SELECT id::text FROM authors WHERE user_id = auth.uid()
    )
  );

-- Extra DELETE policy for their own assets
CREATE POLICY "Authors can delete dreamnest assets they own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND storage_get_app_key(name) = 'dreamnest'
    AND storage_get_owner_id(name) IN (
      SELECT id::text FROM authors WHERE user_id = auth.uid()
    )
  );
