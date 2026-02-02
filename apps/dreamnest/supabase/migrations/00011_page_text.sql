-- Add simple page-level text field for quick editing
ALTER TABLE book_pages
  ADD COLUMN IF NOT EXISTS page_text TEXT DEFAULT 'Add text';
