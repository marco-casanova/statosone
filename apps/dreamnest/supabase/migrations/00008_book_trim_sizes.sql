-- ============================================================
-- DreamNest Library - Migration 00008: Book Trim Sizes
-- ============================================================
-- Adds trim_size column to books table for storing selected book dimensions

-- Add trim_size column to books table
-- Stores the book size ID from the canonical BOOK_SIZES dataset
ALTER TABLE books ADD COLUMN IF NOT EXISTS trim_size TEXT;

-- Add index for querying by trim size
CREATE INDEX IF NOT EXISTS idx_books_trim_size ON books(trim_size) WHERE trim_size IS NOT NULL;

-- Add custom dimensions columns for future "custom size" feature
ALTER TABLE books ADD COLUMN IF NOT EXISTS custom_width_cm DECIMAL(5,2);
ALTER TABLE books ADD COLUMN IF NOT EXISTS custom_height_cm DECIMAL(5,2);

-- Comment on columns for documentation
COMMENT ON COLUMN books.trim_size IS 'Book size ID from canonical sizes (e.g., picture_book_8x8, trade_pb_5x8)';
COMMENT ON COLUMN books.custom_width_cm IS 'Custom book width in centimeters (for non-standard sizes)';
COMMENT ON COLUMN books.custom_height_cm IS 'Custom book height in centimeters (for non-standard sizes)';

-- Update the books_with_author view to include trim_size
DROP VIEW IF EXISTS books_with_author;
CREATE VIEW books_with_author AS
SELECT 
  b.*,
  a.id AS author_record_id,
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
