-- Optional decorative border for each page
ALTER TABLE book_pages
  ADD COLUMN IF NOT EXISTS border_frame_id TEXT;
