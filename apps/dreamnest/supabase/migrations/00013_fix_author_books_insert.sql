-- Ensure authors can insert into author_books (used by trigger on books)
-- Existing policy only had USING, so INSERT lacked a WITH CHECK and failed RLS.

DROP POLICY IF EXISTS "Authors can manage own book collaborators" ON author_books;

-- Recreate with explicit WITH CHECK for inserts/updates and USING for read/delete.
CREATE POLICY "Authors can manage own book collaborators"
  ON author_books
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = author_books.book_id 
        AND books.author_id = get_author_id(auth.uid())
    )
  )
  WITH CHECK (
    author_id = get_author_id(auth.uid())
  );

-- Keep admin policy as-is (already allows all).
