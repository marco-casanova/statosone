-- ============================================================
-- DreamNest Library - Migration 00006: Storage Buckets & Policies
-- ============================================================

-- ============================================================
-- Create storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('book-assets', 'book-assets', false),
  ('covers', 'covers', true);

-- ============================================================
-- AVATARS BUCKET (public read, owner write)
-- ============================================================
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- BOOK-ASSETS BUCKET (private, author + subscriber access)
-- ============================================================

-- Helper function to check asset access
CREATE OR REPLACE FUNCTION can_access_book_asset(asset_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_author_id TEXT;
BEGIN
  -- Extract author_id from path (first folder)
  v_author_id := (storage.foldername(asset_path))[1];
  
  -- Admin can access all
  IF is_admin(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Author can access own assets
  IF v_author_id = get_author_id(auth.uid())::text THEN
    RETURN TRUE;
  END IF;
  
  -- Subscriber can access assets from published books
  IF has_active_subscription(auth.uid()) THEN
    RETURN EXISTS (
      SELECT 1 FROM authors a
      JOIN books b ON b.author_id = a.id
      WHERE a.id::text = v_author_id
      AND b.status = 'published'
    );
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Authorized users can read book assets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'book-assets' 
    AND can_access_book_asset(name)
  );

CREATE POLICY "Authors can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'book-assets' 
    AND (storage.foldername(name))[1] = get_author_id(auth.uid())::text
  );

CREATE POLICY "Authors can update own assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'book-assets' 
    AND (storage.foldername(name))[1] = get_author_id(auth.uid())::text
  );

CREATE POLICY "Authors can delete own assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'book-assets' 
    AND (storage.foldername(name))[1] = get_author_id(auth.uid())::text
  );

-- ============================================================
-- COVERS BUCKET (public read, author + admin write)
-- ============================================================
CREATE POLICY "Book covers are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'covers');

CREATE POLICY "Authors can upload covers for own books"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'covers' 
    AND EXISTS (
      SELECT 1 FROM books b
      WHERE b.id::text = (storage.foldername(name))[1]
      AND b.author_id = get_author_id(auth.uid())
    )
  );

CREATE POLICY "Authors can update covers for own books"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'covers' 
    AND EXISTS (
      SELECT 1 FROM books b
      WHERE b.id::text = (storage.foldername(name))[1]
      AND b.author_id = get_author_id(auth.uid())
    )
  );

CREATE POLICY "Admins can manage all covers"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'covers' 
    AND is_admin(auth.uid())
  );
