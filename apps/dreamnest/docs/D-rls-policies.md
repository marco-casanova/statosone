# D) RLS Policies + Storage Strategy

## Overview

Row Level Security (RLS) is the primary access control mechanism. All tables have RLS enabled. Policies are defined per-table based on the access matrix defined in the IA document.

---

## RLS Policy Summary Matrix

| Table            | Public Read       | Authenticated Read  | Owner Write       | Author Write     | Admin Write |
| ---------------- | ----------------- | ------------------- | ----------------- | ---------------- | ----------- |
| profiles         | ❌                | Own only            | Own only          | ❌               | All         |
| authors          | Public (verified) | Own only            | Own only          | ❌               | All         |
| kids             | ❌                | Own only            | Own only          | ❌               | ❌          |
| subscriptions    | ❌                | Own only            | ❌ (webhook only) | ❌               | Read only   |
| assets           | ❌                | ❌                  | ❌                | Own only         | All         |
| categories       | ✅                | ✅                  | ❌                | ❌               | All         |
| books            | Published only    | Published + own     | ❌                | Own draft/review | All         |
| book_categories  | Published only    | Published + own     | ❌                | Own books        | All         |
| book_pages       | ❌                | Subscribed + author | ❌                | Own books        | All         |
| page_blocks      | ❌                | Subscribed + author | ❌                | Own books        | All         |
| page_narrations  | ❌                | Subscribed + author | ❌                | Own books        | All         |
| reading_sessions | ❌                | Own only            | Own only          | ❌               | ❌          |
| bookmarks        | ❌                | Own only            | Own only          | ❌               | ❌          |

---

## Detailed RLS Policies

### Enable RLS on All Tables

```sql
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
```

---

### profiles

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update all profiles (for role changes)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Profile is created via trigger, no INSERT policy needed for users
```

---

### authors

```sql
-- Public can read verified authors (for author pages)
CREATE POLICY "Public can read verified authors"
  ON authors FOR SELECT
  TO anon, authenticated
  USING (is_verified = TRUE);

-- Users can read their own author record
CREATE POLICY "Users can read own author record"
  ON authors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own author record (when becoming author)
CREATE POLICY "Users can create own author record"
  ON authors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own author record
CREATE POLICY "Users can update own author record"
  ON authors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all author records
CREATE POLICY "Admins can manage all authors"
  ON authors FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));
```

---

### kids

```sql
-- Parents can read their own kids
CREATE POLICY "Parents can read own kids"
  ON kids FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

-- Parents can create kids for themselves
CREATE POLICY "Parents can create own kids"
  ON kids FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

-- Parents can update their own kids
CREATE POLICY "Parents can update own kids"
  ON kids FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Parents can delete their own kids
CREATE POLICY "Parents can delete own kids"
  ON kids FOR DELETE
  TO authenticated
  USING (parent_id = auth.uid());
```

---

### subscriptions

```sql
-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- No direct INSERT/UPDATE - handled by service role via webhooks
-- Service role bypasses RLS
```

---

### assets

```sql
-- Authors can read their own assets
CREATE POLICY "Authors can read own assets"
  ON assets FOR SELECT
  TO authenticated
  USING (author_id = get_author_id(auth.uid()));

-- Authors can create their own assets
CREATE POLICY "Authors can create own assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (author_id = get_author_id(auth.uid()));

-- Authors can update their own assets
CREATE POLICY "Authors can update own assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (author_id = get_author_id(auth.uid()))
  WITH CHECK (author_id = get_author_id(auth.uid()));

-- Authors can delete their own assets
CREATE POLICY "Authors can delete own assets"
  ON assets FOR DELETE
  TO authenticated
  USING (author_id = get_author_id(auth.uid()));

-- Admins can manage all assets
CREATE POLICY "Admins can manage all assets"
  ON assets FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Subscribers can read assets from published books (via page_blocks content)
-- This is handled at query level, not RLS, since assets table doesn't have book_id
```

---

### categories

```sql
-- Anyone can read categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));
```

---

### books

```sql
-- Public can read published books (metadata only)
CREATE POLICY "Public can read published books"
  ON books FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Authors can read their own books (any status)
CREATE POLICY "Authors can read own books"
  ON books FOR SELECT
  TO authenticated
  USING (author_id = get_author_id(auth.uid()));

-- Admins can read all books
CREATE POLICY "Admins can read all books"
  ON books FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Authors can create books
CREATE POLICY "Authors can create books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = get_author_id(auth.uid())
    AND status = 'draft'
  );

-- Authors can update their own draft/in_review books
CREATE POLICY "Authors can update own draft books"
  ON books FOR UPDATE
  TO authenticated
  USING (
    author_id = get_author_id(auth.uid())
    AND status IN ('draft', 'in_review')
  )
  WITH CHECK (
    author_id = get_author_id(auth.uid())
    -- Can't self-publish; can only move to in_review
    AND status IN ('draft', 'in_review')
  );

-- Admins can update any book (for publishing)
CREATE POLICY "Admins can update any book"
  ON books FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Authors can delete their own draft books
CREATE POLICY "Authors can delete own draft books"
  ON books FOR DELETE
  TO authenticated
  USING (
    author_id = get_author_id(auth.uid())
    AND status = 'draft'
  );

-- Admins can delete any book
CREATE POLICY "Admins can delete any book"
  ON books FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
```

---

### book_categories

```sql
-- Anyone can read categories for published books
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

-- Authors can read/manage categories for their own books
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

-- Admins can manage all
CREATE POLICY "Admins can manage all book categories"
  ON book_categories FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));
```

---

### book_pages

**Content Gating Logic:** Subscribers see all pages, non-subscribers see only preview pages (first 3).

```sql
-- Helper function to check page access
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

-- Pages: Read access
CREATE POLICY "Users can read accessible pages"
  ON book_pages FOR SELECT
  TO authenticated
  USING (can_read_page(id));

-- Public preview (first 3 pages of published books)
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

-- Authors can manage their own book pages
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

-- Admins can manage all pages
CREATE POLICY "Admins can manage all pages"
  ON book_pages FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));
```

---

### page_blocks

```sql
-- Blocks inherit access from their page
CREATE POLICY "Users can read accessible page blocks"
  ON page_blocks FOR SELECT
  TO authenticated
  USING (can_read_page(page_id));

-- Public preview
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

-- Authors can manage blocks in their own books
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

-- Admins can manage all blocks
CREATE POLICY "Admins can manage all blocks"
  ON page_blocks FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));
```

---

### page_narrations

```sql
-- Narrations inherit access from their page
CREATE POLICY "Users can read accessible narrations"
  ON page_narrations FOR SELECT
  TO authenticated
  USING (can_read_page(page_id));

-- No public access to narrations (always gated)

-- Authors can manage narrations in their own books
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

-- Admins can manage all narrations
CREATE POLICY "Admins can manage all narrations"
  ON page_narrations FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));
```

---

### reading_sessions

```sql
-- Users can read their own sessions
CREATE POLICY "Users can read own sessions"
  ON reading_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions"
  ON reading_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON reading_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON reading_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

---

### bookmarks

```sql
-- Users can read their own bookmarks
CREATE POLICY "Users can read own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own bookmarks
CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

---

## Storage Bucket Strategy

### Bucket Structure

```
supabase-storage/
├── avatars/                    # User profile images
│   └── {user_id}/
│       └── avatar.{ext}
│
├── book-assets/                # Author uploaded assets
│   └── {author_id}/
│       ├── images/
│       │   └── {asset_id}.{ext}
│       ├── audio/
│       │   └── {asset_id}.{ext}
│       ├── video/
│       │   └── {asset_id}.{ext}
│       └── animations/
│           └── {asset_id}.{ext}
│
└── covers/                     # Book cover images (public)
    └── {book_id}/
        └── cover.{ext}
```

### Storage Policies

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('book-assets', 'book-assets', false),
  ('covers', 'covers', true);

-- AVATARS BUCKET (public read, owner write)

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

-- BOOK-ASSETS BUCKET (private, author + subscriber access)

-- Helper to check if user can access asset
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
    -- Asset is accessible if it belongs to a published book
    -- This is a simplified check; in production you might want a more specific check
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

-- COVERS BUCKET (public read, author + admin write)

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
```

---

## Content Gating Implementation

### Query-Level Gating (Recommended Approach)

Rather than relying solely on RLS for preview vs. full access, implement at the query level:

```typescript
// In your API/server action
async function getBookPages(bookId: string, userId: string | null) {
  const supabase = createServerClient();

  // Check subscription status
  const hasSubscription = userId ? await checkSubscription(userId) : false;

  // Check if user is author or admin
  const isAuthorOrAdmin = userId
    ? await checkAuthorOrAdmin(userId, bookId)
    : false;

  // Determine page limit
  const canAccessAll = hasSubscription || isAuthorOrAdmin;

  let query = supabase
    .from("book_pages")
    .select(
      `
      *,
      page_blocks (*),
      page_narrations (*)
    `
    )
    .eq("book_id", bookId)
    .order("page_index");

  // Non-subscribers get preview only
  if (!canAccessAll) {
    query = query.lt("page_index", 3);
  }

  const { data, error } = await query;

  return {
    pages: data,
    isPreviewOnly: !canAccessAll,
    totalPages: await getBookPageCount(bookId),
  };
}
```

### Signed URLs for Private Assets

For book-assets bucket, generate signed URLs with expiration:

```typescript
async function getAssetUrl(assetId: string, userId: string) {
  const supabase = createServerClient();

  // Verify user can access this asset
  const { data: asset } = await supabase
    .from("assets")
    .select("file_path")
    .eq("id", assetId)
    .single();

  if (!asset) throw new Error("Asset not found");

  // Generate signed URL (expires in 1 hour)
  const { data: signedUrl } = await supabase.storage
    .from("book-assets")
    .createSignedUrl(asset.file_path, 3600);

  return signedUrl?.signedUrl;
}
```
