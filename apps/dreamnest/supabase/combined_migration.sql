-- ============================================================
-- DreamNest Library - Migration 00001: Enum Types
-- ============================================================
-- Run this migration first to create all enum types used by tables

-- User roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('parent', 'author', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Book publication status
DO $$ BEGIN
  CREATE TYPE book_status AS ENUM ('draft', 'in_review', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Page layout mode
DO $$ BEGIN
  CREATE TYPE page_layout_mode AS ENUM ('canvas', 'flow');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Block types
DO $$ BEGIN
  CREATE TYPE block_type AS ENUM ('text', 'image', 'video', 'animation', 'hotspot');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Asset types  
DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('image', 'audio', 'video', 'animation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Category types
DO $$ BEGIN
  CREATE TYPE category_type AS ENUM ('theme', 'mood', 'skill');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Narration mode
DO $$ BEGIN
  CREATE TYPE narration_mode AS ENUM ('recorded', 'tts');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Reading session mode
DO $$ BEGIN
  CREATE TYPE reading_mode AS ENUM ('manual', 'auto');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Subscription status (mirrors Stripe)
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'active', 
    'trialing', 
    'past_due', 
    'canceled', 
    'unpaid', 
    'incomplete', 
    'incomplete_expired',
    'paused'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
-- ============================================================
-- DreamNest Library - Migration 00002: Tables
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- Extends Supabase auth.users with application-specific data
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'parent',
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist (for pre-existing tables)
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'parent';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- 2. AUTHORS
-- Author profile extension for users with author role
-- ============================================================
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  website_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authors_user_id ON authors(user_id);
CREATE INDEX IF NOT EXISTS idx_authors_verified ON authors(is_verified) WHERE is_verified = TRUE;

-- ============================================================
-- 3. KIDS
-- Child profiles for parent accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kids_parent_id ON kids(parent_id);

-- ============================================================
-- 4. SUBSCRIPTIONS
-- Stripe subscription data synced via webhooks
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================================
-- 5. ASSETS
-- Media files stored in Supabase Storage
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_author_id ON assets(author_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- ============================================================
-- 6. CATEGORIES
-- Book categories for filtering
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type category_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================================
-- 7. BOOKS
-- Main book entity
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  status book_status NOT NULL DEFAULT 'draft',
  
  -- Cover image
  cover_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  
  -- Design canvas size
  design_width INTEGER NOT NULL DEFAULT 1024,
  design_height INTEGER NOT NULL DEFAULT 768,
  
  -- Age targeting
  age_min INTEGER NOT NULL DEFAULT 2,
  age_max INTEGER NOT NULL DEFAULT 8,
  
  -- Reading estimates
  estimated_read_time_minutes INTEGER,
  page_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  language TEXT NOT NULL DEFAULT 'en',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Review workflow
  submitted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(status, published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_books_age_range ON books(age_min, age_max);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured) WHERE is_featured = TRUE;

-- ============================================================
-- 8. BOOK_CATEGORIES
-- Many-to-many relationship between books and categories
-- ============================================================
CREATE TABLE IF NOT EXISTS book_categories (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_book_categories_category_id ON book_categories(category_id);

-- ============================================================
-- 9. BOOK_PAGES
-- Pages within a book
-- ============================================================
CREATE TABLE IF NOT EXISTS book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL,
  layout_mode page_layout_mode NOT NULL DEFAULT 'canvas',
  
  -- Page background
  background_color TEXT DEFAULT '#FFFFFF',
  background_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  
  -- Page-level timing for auto mode (if no narration)
  auto_advance_delay_ms INTEGER DEFAULT 5000,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (book_id, page_index)
);

CREATE INDEX IF NOT EXISTS idx_book_pages_book_id ON book_pages(book_id);
CREATE INDEX IF NOT EXISTS idx_book_pages_order ON book_pages(book_id, page_index);

-- ============================================================
-- 10. PAGE_BLOCKS
-- Content blocks within a page
-- ============================================================
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES book_pages(id) ON DELETE CASCADE,
  type block_type NOT NULL,
  block_index INTEGER NOT NULL,
  
  -- Separated concerns: WHAT, WHERE, HOW IT LOOKS
  content JSONB NOT NULL DEFAULT '{}',
  layout JSONB NOT NULL DEFAULT '{}',
  style JSONB NOT NULL DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON page_blocks(page_id, block_index);
CREATE INDEX IF NOT EXISTS idx_page_blocks_type ON page_blocks(type);
CREATE INDEX IF NOT EXISTS idx_page_blocks_content ON page_blocks USING GIN (content);

-- ============================================================
-- 11. PAGE_NARRATIONS
-- Narration audio for pages
-- ============================================================
CREATE TABLE IF NOT EXISTS page_narrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL UNIQUE REFERENCES book_pages(id) ON DELETE CASCADE,
  mode narration_mode NOT NULL,
  
  -- For recorded audio
  audio_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  
  -- For TTS
  tts_text TEXT,
  tts_voice TEXT,
  
  -- Timing
  duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_narrations_page_id ON page_narrations(page_id);

-- ============================================================
-- 12. READING_SESSIONS
-- Track user reading progress
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  kid_id UUID REFERENCES kids(id) ON DELETE SET NULL,
  
  current_page_index INTEGER NOT NULL DEFAULT 0,
  mode reading_mode NOT NULL DEFAULT 'manual',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Stats
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, book_id, kid_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_kid_id ON reading_sessions(kid_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_last_read ON reading_sessions(user_id, last_read_at DESC);

-- ============================================================
-- 13. BOOKMARKS
-- User bookmarks within books
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, book_id, page_index)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_book_id ON bookmarks(book_id);

-- ============================================================
-- 14. VIEWS - Flattened data to avoid PostgREST join issues
-- ============================================================

-- Books with author info flattened (avoids nested join ambiguity)
-- Drop first to avoid column-name conflicts from previous versions
DROP VIEW IF EXISTS books_with_author;
CREATE VIEW books_with_author AS
SELECT 
  b.*,
  a.user_id AS author_user_id,
  a.bio AS author_bio,
  a.is_verified AS author_is_verified,
  p.display_name AS author_display_name,
  p.avatar_url AS author_avatar_url,
  cover.file_path AS cover_file_path
FROM books b
JOIN authors a ON a.id = b.author_id
JOIN profiles p ON p.id = a.user_id
LEFT JOIN assets cover ON cover.id = b.cover_asset_id;

-- ============================================================
-- Create author records for existing profiles that don't have one
-- ============================================================
INSERT INTO authors (user_id, is_verified)
SELECT id, FALSE FROM profiles
WHERE id NOT IN (SELECT user_id FROM authors)
ON CONFLICT (user_id) DO NOTHING;

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
-- Handle new user signup - auto-create profile AND author record
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_profile_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Also create author record so user can create books
  INSERT INTO public.authors (user_id, is_verified)
  VALUES (NEW.id, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  
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
-- ============================================================
-- DreamNest Library - Migration 00004: Triggers
-- ============================================================

-- ============================================================
-- Trigger: Auto-create profile on user signup
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Triggers: Auto-update updated_at column
-- ============================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_authors_updated_at ON authors;
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kids_updated_at ON kids;
CREATE TRIGGER update_kids_updated_at
  BEFORE UPDATE ON kids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_book_pages_updated_at ON book_pages;
CREATE TRIGGER update_book_pages_updated_at
  BEFORE UPDATE ON book_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_blocks_updated_at ON page_blocks;
CREATE TRIGGER update_page_blocks_updated_at
  BEFORE UPDATE ON page_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_narrations_updated_at ON page_narrations;
CREATE TRIGGER update_page_narrations_updated_at
  BEFORE UPDATE ON page_narrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reading_sessions_updated_at ON reading_sessions;
CREATE TRIGGER update_reading_sessions_updated_at
  BEFORE UPDATE ON reading_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Trigger: Auto-update book page_count
-- ============================================================
DROP TRIGGER IF EXISTS update_book_page_count_trigger ON book_pages;
CREATE TRIGGER update_book_page_count_trigger
  AFTER INSERT OR DELETE ON book_pages
  FOR EACH ROW EXECUTE FUNCTION update_book_page_count();
-- ============================================================
-- DreamNest Library - Migration 00005: RLS Policies
-- ============================================================

-- ============================================================
-- Drop existing policies (to allow re-running migration)
-- ============================================================
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

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
-- ============================================================
-- DreamNest Library - Migration 00006: Storage Buckets & Policies
-- ============================================================

-- ============================================================
-- Create storage buckets (ignore if already exists)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('book-assets', 'book-assets', false),
  ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Drop existing storage policies
-- ============================================================
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

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

-- Page-level text field for DreamNest pages (idempotent)
ALTER TABLE IF EXISTS book_pages
  ADD COLUMN IF NOT EXISTS page_text TEXT DEFAULT 'Add text';

-- Decorative border identifier per page (idempotent)
ALTER TABLE IF EXISTS book_pages
  ADD COLUMN IF NOT EXISTS border_frame_id TEXT;
