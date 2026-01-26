-- ============================================
-- DREAMNEST - APP-SPECIFIC SCHEMA
-- ============================================
-- Run AFTER the shared auth schema (schema.sql)
-- Purpose: Digital library for parents and kids
-- ============================================

-- ============================================
-- 1. DIGITAL BOOKS
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Book info
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    cover_url TEXT,
    
    -- Age targeting
    age_min INTEGER DEFAULT 0,
    age_max INTEGER DEFAULT 99,
    
    -- Categories (stored as JSONB array)
    categories JSONB DEFAULT '[]'::JSONB,
    
    -- Content type
    has_text BOOLEAN DEFAULT TRUE,
    has_images BOOLEAN DEFAULT FALSE,
    has_video BOOLEAN DEFAULT FALSE,
    has_narration BOOLEAN DEFAULT FALSE,
    
    -- Publishing
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);
CREATE INDEX IF NOT EXISTS idx_books_categories ON books USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_books_age ON books(age_min, age_max);

-- ============================================
-- 2. BOOK PAGES/CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS book_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    
    -- Page content
    page_number INTEGER NOT NULL,
    text_content TEXT,
    image_url TEXT,
    video_url TEXT,
    audio_url TEXT, -- narration
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(book_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_pages_book ON book_pages(book_id);

-- ============================================
-- 3. USER LIBRARY (favorites, progress)
-- ============================================
CREATE TABLE IF NOT EXISTS user_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    
    -- Reading progress
    current_page INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- User preferences
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_library_user ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_library_favorites ON user_library(user_id, is_favorite);

-- ============================================
-- 4. RLS POLICIES
-- ============================================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- Books: Anyone can view published books
CREATE POLICY "Anyone can view published books"
    ON books FOR SELECT
    USING (published = TRUE);

-- Book pages: Anyone can view pages of published books
CREATE POLICY "Anyone can view published book pages"
    ON book_pages FOR SELECT
    USING (book_id IN (SELECT id FROM books WHERE published = TRUE));

-- User library: Users can manage their own library
CREATE POLICY "Users can manage own library"
    ON user_library FOR ALL
    USING (user_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can manage all books"
    ON books FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all pages"
    ON book_pages FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all libraries"
    ON user_library FOR SELECT USING (is_admin());
