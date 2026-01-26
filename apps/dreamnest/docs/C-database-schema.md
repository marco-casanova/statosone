# C) Database Schema

## Overview

This document defines the complete Supabase (PostgreSQL) database schema for DreamNest Library, including:

- Enum types
- All tables with columns, types, and constraints
- Foreign key relationships
- Indexes for performance
- Entity relationship diagram (ASCII)

---

## Entity Relationship Diagram

```
                                    ┌─────────────────┐
                                    │     profiles    │
                                    │─────────────────│
                                    │ id (FK auth)    │
                                    │ role            │
                                    │ display_name    │
                                    │ avatar_url      │
                                    └────────┬────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
              ▼                              ▼                              ▼
    ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
    │     authors     │           │      kids       │           │  subscriptions  │
    │─────────────────│           │─────────────────│           │─────────────────│
    │ id              │           │ id              │           │ id              │
    │ user_id (FK)    │           │ parent_id (FK)  │           │ user_id (FK)    │
    │ bio             │           │ name            │           │ stripe_*        │
    │ website_url     │           │ birth_date      │           │ status          │
    └────────┬────────┘           │ avatar_url      │           └─────────────────┘
             │                    └────────┬────────┘
             │                             │
             ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │     assets      │           │reading_sessions │
    │─────────────────│           │─────────────────│
    │ id              │           │ id              │
    │ author_id (FK)  │           │ user_id (FK)    │
    │ file_path       │           │ kid_id (FK)     │
    │ type            │           │ book_id (FK)    │
    │ ...             │           │ current_page    │
    └─────────────────┘           │ mode            │
             │                    └─────────────────┘
             │
             │                    ┌─────────────────┐
             │                    │    bookmarks    │
             │                    │─────────────────│
             │                    │ id              │
             │                    │ user_id (FK)    │
             │                    │ book_id (FK)    │
             │                    │ page_index      │
             │                    └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │      books      │
    │─────────────────│
    │ id              │
    │ author_id (FK)  │◄──────────────────────────────────────────┐
    │ title           │                                           │
    │ status          │                                           │
    │ design_width    │                                           │
    │ design_height   │                                           │
    │ cover_asset_id  │───────────────────────────────────────────┤
    │ age_min/max     │                                           │
    └────────┬────────┘                                           │
             │                                                     │
             │ 1:N                                                 │
             ▼                                                     │
    ┌─────────────────┐     ┌─────────────────┐                   │
    │   book_pages    │     │  page_narrations│                   │
    │─────────────────│     │─────────────────│                   │
    │ id              │◄───►│ id              │                   │
    │ book_id (FK)    │     │ page_id (FK)    │                   │
    │ page_index      │     │ mode            │                   │
    │ layout_mode     │     │ audio_asset_id  │───────────────────┤
    │ bg_color        │     │ tts_text        │                   │
    │ bg_asset_id     │─────│ duration_ms     │                   │
    └────────┬────────┘     └─────────────────┘                   │
             │                                                     │
             │ 1:N                                                 │
             ▼                                                     │
    ┌─────────────────┐                                           │
    │   page_blocks   │                                           │
    │─────────────────│                                           │
    │ id              │                                           │
    │ page_id (FK)    │                                           │
    │ type            │                                           │
    │ block_index     │                                           │
    │ content (JSONB) │───────────────────────────────────────────┘
    │ layout (JSONB)  │    (content.asset_id references assets)
    │ style (JSONB)   │
    └─────────────────┘

    ┌─────────────────┐           ┌─────────────────┐
    │   categories    │           │ book_categories │
    │─────────────────│           │─────────────────│
    │ id              │◄─────────►│ book_id (FK)    │
    │ name            │           │ category_id(FK) │
    │ type            │           └─────────────────┘
    │ slug            │
    │ icon            │
    └─────────────────┘
```

---

## Enum Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('parent', 'author', 'admin');

-- Book publication status
CREATE TYPE book_status AS ENUM ('draft', 'in_review', 'published', 'archived');

-- Page layout mode
CREATE TYPE page_layout_mode AS ENUM ('canvas', 'flow');

-- Block types
CREATE TYPE block_type AS ENUM ('text', 'image', 'video', 'animation', 'hotspot');

-- Asset types
CREATE TYPE asset_type AS ENUM ('image', 'audio', 'video', 'animation');

-- Category types
CREATE TYPE category_type AS ENUM ('theme', 'mood', 'skill');

-- Narration mode
CREATE TYPE narration_mode AS ENUM ('recorded', 'tts');

-- Reading session mode
CREATE TYPE reading_mode AS ENUM ('manual', 'auto');

-- Subscription status (mirrors Stripe)
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
```

---

## Tables

### 1. profiles

Extends Supabase auth.users with application-specific data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'parent',
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Trigger to auto-create profile on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 2. authors

Author profile extension for users with author role.

```sql
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
```

---

### 3. kids

Child profiles for parent accounts.

```sql
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
```

---

### 4. subscriptions

Stripe subscription data synced via webhooks.

```sql
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
```

---

### 5. assets

Media files stored in Supabase Storage.

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage bucket
  file_name TEXT NOT NULL, -- Original filename
  file_size INTEGER, -- Bytes
  mime_type TEXT,
  width INTEGER, -- For images/videos
  height INTEGER, -- For images/videos
  duration_ms INTEGER, -- For audio/video
  alt_text TEXT, -- Accessibility
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_author_id ON assets(author_id);
CREATE INDEX idx_assets_type ON assets(type);
```

---

### 6. categories

Book categories for filtering.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type category_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or emoji
  color TEXT, -- Hex color for UI
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_slug ON categories(slug);
```

---

### 7. books

Main book entity.

```sql
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
```

---

### 8. book_categories

Many-to-many relationship between books and categories.

```sql
CREATE TABLE book_categories (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

CREATE INDEX idx_book_categories_category_id ON book_categories(category_id);
```

---

### 9. book_pages

Pages within a book.

```sql
CREATE TABLE book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL, -- 0-based ordering
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
```

---

### 10. page_blocks

Content blocks within a page.

```sql
CREATE TABLE page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES book_pages(id) ON DELETE CASCADE,
  type block_type NOT NULL,
  block_index INTEGER NOT NULL, -- Ordering for flow mode and z-index default

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

-- GIN index for JSONB queries if needed
CREATE INDEX idx_page_blocks_content ON page_blocks USING GIN (content);
```

#### Block JSONB Schemas

**content (the "what"):**

```jsonc
// Text block
{
  "text": "Once upon a time...",
  "html": "<p>Once upon a time...</p>" // Optional rich text
}

// Image block
{
  "asset_id": "uuid",
  "alt_text": "A friendly dragon"
}

// Video block
{
  "asset_id": "uuid",
  "autoplay": false,
  "loop": false,
  "muted": true
}

// Animation block (Lottie or similar)
{
  "asset_id": "uuid",
  "autoplay": true,
  "loop": true
}

// Hotspot block
{
  "action": "play_sound", // or "show_tooltip", "navigate"
  "target_asset_id": "uuid", // For sound
  "tooltip_text": "Tap me!" // For tooltip
}
```

**layout (the "where") - normalized 0..1 coordinates:**

```jsonc
{
  "x": 0.1, // 10% from left
  "y": 0.2, // 20% from top
  "width": 0.5, // 50% of canvas width
  "height": 0.3, // 30% of canvas height
  "rotation": 0, // Degrees
  "z_index": 1 // Layer order (higher = front)
}
```

**style (the "look"):**

```jsonc
// Text block style
{
  "font_family": "Comic Sans MS",
  "font_size": 24,          // Base size, scaled with canvas
  "font_weight": "bold",
  "font_style": "normal",   // or "italic"
  "text_align": "center",   // left, center, right
  "vertical_align": "top",  // top, middle, bottom
  "color": "#333333",
  "background_color": null,
  "padding": 10,
  "border_radius": 8,
  "line_height": 1.5,
  "letter_spacing": 0
}

// Image block style
{
  "object_fit": "contain",  // contain, cover, fill
  "border_radius": 0,
  "border_width": 0,
  "border_color": null,
  "shadow": null,           // CSS box-shadow value
  "opacity": 1
}

// Hotspot style
{
  "shape": "circle",        // circle, rectangle
  "background_color": "rgba(255,255,0,0.3)",
  "border_color": "#FFD700",
  "border_width": 2,
  "pulse_animation": true
}
```

---

### 11. page_narrations

Narration audio for pages.

```sql
CREATE TABLE page_narrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL UNIQUE REFERENCES book_pages(id) ON DELETE CASCADE,
  mode narration_mode NOT NULL,

  -- For recorded audio
  audio_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,

  -- For TTS
  tts_text TEXT,
  tts_voice TEXT, -- Voice ID for TTS provider

  -- Timing
  duration_ms INTEGER, -- Duration for auto-advance

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_narrations_page_id ON page_narrations(page_id);
```

---

### 12. reading_sessions

Track user reading progress.

```sql
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
```

---

### 13. bookmarks

User bookmarks within books.

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL,
  note TEXT, -- Optional user note
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, book_id, page_index)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_book_id ON bookmarks(book_id);
```

---

## Helper Functions

### Check if user has active subscription

```sql
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
```

### Check if user is author of a book

```sql
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
```

### Check if user is admin

```sql
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
```

### Get user's author ID

```sql
CREATE OR REPLACE FUNCTION get_author_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT id FROM authors WHERE user_id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## Updated_at Trigger

Apply to all tables with updated_at column:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kids_updated_at
  BEFORE UPDATE ON kids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_pages_updated_at
  BEFORE UPDATE ON book_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_blocks_updated_at
  BEFORE UPDATE ON page_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_narrations_updated_at
  BEFORE UPDATE ON page_narrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_sessions_updated_at
  BEFORE UPDATE ON reading_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Book Page Count Trigger

Auto-update page_count when pages are added/removed:

```sql
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

CREATE TRIGGER update_book_page_count_trigger
  AFTER INSERT OR DELETE ON book_pages
  FOR EACH ROW EXECUTE FUNCTION update_book_page_count();
```
