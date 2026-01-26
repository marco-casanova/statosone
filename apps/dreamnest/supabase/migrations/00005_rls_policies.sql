-- ============================================================
-- DreamNest Library - Migration 00005: RLS Policies
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_narrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- AUTHORS
-- ============================================================
CREATE POLICY "Public can read verified authors"
  ON authors FOR SELECT
  TO anon, authenticated
  USING (is_verified = TRUE);

CREATE POLICY "Users can read own author record"
  ON authors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own author record"
  ON authors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own author record"
  ON authors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all authors"
  ON authors FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- KIDS
-- ============================================================
CREATE POLICY "Parents can read own kids"
  ON kids FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can create own kids"
  ON kids FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own kids"
  ON kids FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can delete own kids"
  ON kids FOR DELETE
  TO authenticated
  USING (parent_id = auth.uid());

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Note: INSERT/UPDATE handled by service role via webhooks

-- ============================================================
-- ASSETS
-- ============================================================
CREATE POLICY "Authors can read own assets"
  ON assets FOR SELECT
  TO authenticated
  USING (author_id = get_author_id(auth.uid()));

CREATE POLICY "Authors can create own assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (author_id = get_author_id(auth.uid()));

CREATE POLICY "Authors can update own assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (author_id = get_author_id(auth.uid()))
  WITH CHECK (author_id = get_author_id(auth.uid()));

CREATE POLICY "Authors can delete own assets"
  ON assets FOR DELETE
  TO authenticated
  USING (author_id = get_author_id(auth.uid()));

CREATE POLICY "Admins can manage all assets"
  ON assets FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- BOOKS
-- ============================================================
CREATE POLICY "Public can read published books"
  ON books FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authors can read own books"
  ON books FOR SELECT
  TO authenticated
  USING (author_id = get_author_id(auth.uid()));

CREATE POLICY "Admins can read all books"
  ON books FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Authors can create books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = get_author_id(auth.uid()) 
    AND status = 'draft'
  );

CREATE POLICY "Authors can update own draft books"
  ON books FOR UPDATE
  TO authenticated
  USING (
    author_id = get_author_id(auth.uid()) 
    AND status IN ('draft', 'in_review')
  )
  WITH CHECK (
    author_id = get_author_id(auth.uid())
    AND status IN ('draft', 'in_review')
  );

CREATE POLICY "Admins can update any book"
  ON books FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Authors can delete own draft books"
  ON books FOR DELETE
  TO authenticated
  USING (
    author_id = get_author_id(auth.uid()) 
    AND status = 'draft'
  );

CREATE POLICY "Admins can delete any book"
  ON books FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- BOOK_CATEGORIES
-- ============================================================
CREATE POLICY "Public can read published book categories"
  ON book_categories FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_categories.book_id 
      AND books.status = 'published'
    )
  );

CREATE POLICY "Authors can manage own book categories"
  ON book_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_categories.book_id 
      AND books.author_id = get_author_id(auth.uid())
    )
  );

CREATE POLICY "Admins can manage all book categories"
  ON book_categories FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- BOOK_PAGES
-- ============================================================
CREATE POLICY "Users can read accessible pages"
  ON book_pages FOR SELECT
  TO authenticated
  USING (can_read_page(id));

CREATE POLICY "Public can read preview pages"
  ON book_pages FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_pages.book_id 
      AND books.status = 'published'
    )
    AND page_index < 3
  );

CREATE POLICY "Authors can manage own book pages"
  ON book_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_pages.book_id 
      AND books.author_id = get_author_id(auth.uid())
      AND books.status IN ('draft', 'in_review')
    )
  );

CREATE POLICY "Admins can manage all pages"
  ON book_pages FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- PAGE_BLOCKS
-- ============================================================
CREATE POLICY "Users can read accessible page blocks"
  ON page_blocks FOR SELECT
  TO authenticated
  USING (can_read_page(page_id));

CREATE POLICY "Public can read preview page blocks"
  ON page_blocks FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM book_pages bp
      JOIN books b ON b.id = bp.book_id
      WHERE bp.id = page_blocks.page_id
      AND b.status = 'published'
      AND bp.page_index < 3
    )
  );

CREATE POLICY "Authors can manage own page blocks"
  ON page_blocks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_pages bp
      JOIN books b ON b.id = bp.book_id
      WHERE bp.id = page_blocks.page_id
      AND b.author_id = get_author_id(auth.uid())
      AND b.status IN ('draft', 'in_review')
    )
  );

CREATE POLICY "Admins can manage all blocks"
  ON page_blocks FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- PAGE_NARRATIONS
-- ============================================================
CREATE POLICY "Users can read accessible narrations"
  ON page_narrations FOR SELECT
  TO authenticated
  USING (can_read_page(page_id));

CREATE POLICY "Authors can manage own narrations"
  ON page_narrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_pages bp
      JOIN books b ON b.id = bp.book_id
      WHERE bp.id = page_narrations.page_id
      AND b.author_id = get_author_id(auth.uid())
      AND b.status IN ('draft', 'in_review')
    )
  );

CREATE POLICY "Admins can manage all narrations"
  ON page_narrations FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- READING_SESSIONS
-- ============================================================
CREATE POLICY "Users can read own sessions"
  ON reading_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON reading_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON reading_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON reading_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE POLICY "Users can read own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
