-- ============================================================
-- DreamNest Library - Migration 00002: Tables
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- Extends Supabase auth.users with application-specific data
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'parent',
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- 2. AUTHORS
-- Author profile extension for users with author role
-- ============================================================
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  website_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_authors_user_id ON authors(user_id);
CREATE INDEX idx_authors_verified ON authors(is_verified) WHERE is_verified = TRUE;

-- ============================================================
-- 3. KIDS
-- Child profiles for parent accounts
-- ============================================================
CREATE TABLE kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kids_parent_id ON kids(parent_id);

-- ============================================================
-- 4. SUBSCRIPTIONS
-- Stripe subscription data synced via webhooks
-- ============================================================
CREATE TABLE subscriptions (
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

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================
-- 5. ASSETS
-- Media files stored in Supabase Storage
-- ============================================================
CREATE TABLE assets (
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

CREATE INDEX idx_assets_author_id ON assets(author_id);
CREATE INDEX idx_assets_type ON assets(type);

-- ============================================================
-- 6. CATEGORIES
-- Book categories for filtering
-- ============================================================
CREATE TABLE categories (
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

CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================================
-- 7. BOOKS
-- Main book entity
-- ============================================================
CREATE TABLE books (
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

CREATE INDEX idx_books_author_id ON books(author_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_published ON books(status, published_at) WHERE status = 'published';
CREATE INDEX idx_books_age_range ON books(age_min, age_max);
CREATE INDEX idx_books_featured ON books(is_featured) WHERE is_featured = TRUE;

-- ============================================================
-- 8. BOOK_CATEGORIES
-- Many-to-many relationship between books and categories
-- ============================================================
CREATE TABLE book_categories (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

CREATE INDEX idx_book_categories_category_id ON book_categories(category_id);

-- ============================================================
-- 9. BOOK_PAGES
-- Pages within a book
-- ============================================================
CREATE TABLE book_pages (
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

CREATE INDEX idx_book_pages_book_id ON book_pages(book_id);
CREATE INDEX idx_book_pages_order ON book_pages(book_id, page_index);

-- ============================================================
-- 10. PAGE_BLOCKS
-- Content blocks within a page
-- ============================================================
CREATE TABLE page_blocks (
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

CREATE INDEX idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX idx_page_blocks_order ON page_blocks(page_id, block_index);
CREATE INDEX idx_page_blocks_type ON page_blocks(type);
CREATE INDEX idx_page_blocks_content ON page_blocks USING GIN (content);

-- ============================================================
-- 11. PAGE_NARRATIONS
-- Narration audio for pages
-- ============================================================
CREATE TABLE page_narrations (
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

CREATE INDEX idx_page_narrations_page_id ON page_narrations(page_id);

-- ============================================================
-- 12. READING_SESSIONS
-- Track user reading progress
-- ============================================================
CREATE TABLE reading_sessions (
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

CREATE INDEX idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_kid_id ON reading_sessions(kid_id);
CREATE INDEX idx_reading_sessions_last_read ON reading_sessions(user_id, last_read_at DESC);

-- ============================================================
-- 13. BOOKMARKS
-- User bookmarks within books
-- ============================================================
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, book_id, page_index)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_book_id ON bookmarks(book_id);
