-- ============================================================
-- DreamNest Library - Migration 00003: Functions
-- ============================================================

-- ============================================================
-- Helper: Check if user has active subscription
-- ============================================================
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Helper: Check if user is author of a book
-- ============================================================
CREATE OR REPLACE FUNCTION is_book_author(user_uuid UUID, book_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM books b
    JOIN authors a ON a.id = b.author_id
    WHERE b.id = book_uuid
    AND a.user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Helper: Check if user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Helper: Get user's author ID
-- ============================================================
CREATE OR REPLACE FUNCTION get_author_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT id FROM authors WHERE user_id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- Helper: Check if user can read a specific page
-- Used for RLS policies to implement preview gating
-- ============================================================
CREATE OR REPLACE FUNCTION can_read_page(page_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_book_id UUID;
  v_book_status book_status;
  v_author_id UUID;
  v_page_index INTEGER;
BEGIN
  -- Get book info for this page
  SELECT bp.book_id, b.status, b.author_id, bp.page_index
  INTO v_book_id, v_book_status, v_author_id, v_page_index
  FROM book_pages bp
  JOIN books b ON b.id = bp.book_id
  WHERE bp.id = page_uuid;
  
  -- Not found
  IF v_book_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Admin can read all
  IF is_admin(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Author can read own book's pages
  IF v_author_id = get_author_id(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Book must be published for others
  IF v_book_status != 'published' THEN
    RETURN FALSE;
  END IF;
  
  -- Subscriber can read all pages
  IF has_active_subscription(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Non-subscriber can read preview pages (first 3: index 0,1,2)
  IF v_page_index < 3 THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Handle new user signup - auto-create profile
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Update updated_at column automatically
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Update book page_count when pages change
-- ============================================================
CREATE OR REPLACE FUNCTION update_book_page_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE books SET page_count = (
      SELECT COUNT(*) FROM book_pages WHERE book_id = OLD.book_id
    ) WHERE id = OLD.book_id;
    RETURN OLD;
  ELSE
    UPDATE books SET page_count = (
      SELECT COUNT(*) FROM book_pages WHERE book_id = NEW.book_id
    ) WHERE id = NEW.book_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;
