-- ============================================================
-- DreamNest Library - Migration 00007: Payout System
-- ============================================================
-- Implements Netflix-like subscription payout model with:
-- - Platform-owned content (100% to platform)
-- - Third-party authors (PPV + subscription pool payouts)
-- - Co-author support with royalty splits
-- - Engagement-based pool distribution

-- ============================================================
-- 1. NEW ENUM TYPES
-- ============================================================

-- Author type (platform owner vs third-party creator)
DO $$ BEGIN
  CREATE TYPE author_type AS ENUM ('platform_owner', 'third_party');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payout model for authors
DO $$ BEGIN
  CREATE TYPE payout_model AS ENUM ('none', 'ppv_only', 'subscription_pool', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Book ownership type
DO $$ BEGIN
  CREATE TYPE book_owner_type AS ENUM ('platform', 'third_party');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Author role in a book (for co-authors)
DO $$ BEGIN
  CREATE TYPE author_role AS ENUM ('author', 'coauthor', 'illustrator', 'narrator', 'editor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payout type
DO $$ BEGIN
  CREATE TYPE payout_type AS ENUM ('ppv', 'subscription_pool', 'bonus', 'advance', 'advance_recoup');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payout status
DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'processing', 'paid', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. MODIFY AUTHORS TABLE
-- ============================================================

-- Add new columns to authors
ALTER TABLE authors ADD COLUMN IF NOT EXISTS author_type author_type NOT NULL DEFAULT 'third_party';
ALTER TABLE authors ADD COLUMN IF NOT EXISTS payout_model payout_model NOT NULL DEFAULT 'hybrid';
ALTER TABLE authors ADD COLUMN IF NOT EXISTS payout_account_type TEXT; -- 'stripe_connect', 'paypal', 'bank_transfer'
ALTER TABLE authors ADD COLUMN IF NOT EXISTS payout_account_ref TEXT; -- encrypted/tokenized account reference
ALTER TABLE authors ADD COLUMN IF NOT EXISTS payout_email TEXT; -- PayPal email or notification email
ALTER TABLE authors ADD COLUMN IF NOT EXISTS minimum_payout_amount DECIMAL(10,2) DEFAULT 50.00;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS tax_info_provided BOOLEAN DEFAULT FALSE;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS tax_country TEXT;

-- Index for payout queries
CREATE INDEX IF NOT EXISTS idx_authors_payout_model ON authors(payout_model) WHERE payout_model != 'none';
CREATE INDEX IF NOT EXISTS idx_authors_type ON authors(author_type);
CREATE INDEX IF NOT EXISTS idx_authors_pending_balance ON authors(pending_balance) WHERE pending_balance > 0;

-- ============================================================
-- 3. MODIFY BOOKS TABLE
-- ============================================================

-- Add owner_type to books
ALTER TABLE books ADD COLUMN IF NOT EXISTS owner_type book_owner_type NOT NULL DEFAULT 'third_party';
ALTER TABLE books ADD COLUMN IF NOT EXISTS ppv_price DECIMAL(10,2); -- null = not for individual sale
ALTER TABLE books ADD COLUMN IF NOT EXISTS ppv_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE books ADD COLUMN IF NOT EXISTS subscription_included BOOLEAN DEFAULT TRUE;

-- Index for ownership queries
CREATE INDEX IF NOT EXISTS idx_books_owner_type ON books(owner_type);
CREATE INDEX IF NOT EXISTS idx_books_ppv ON books(ppv_enabled) WHERE ppv_enabled = TRUE;

-- ============================================================
-- 4. AUTHOR_BOOKS (Co-authorship with royalty splits)
-- ============================================================

CREATE TABLE IF NOT EXISTS author_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  role author_role NOT NULL DEFAULT 'author',
  royalty_split_percent DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each author can only have one role per book
  UNIQUE (author_id, book_id),
  
  -- Royalty split must be between 0 and 100
  CONSTRAINT valid_royalty_split CHECK (royalty_split_percent >= 0 AND royalty_split_percent <= 100)
);

CREATE INDEX IF NOT EXISTS idx_author_books_author_id ON author_books(author_id);
CREATE INDEX IF NOT EXISTS idx_author_books_book_id ON author_books(book_id);
CREATE INDEX IF NOT EXISTS idx_author_books_primary ON author_books(book_id) WHERE is_primary = TRUE;

-- ============================================================
-- 5. CONTENT_EVENTS (Engagement tracking for pool distribution)
-- ============================================================

CREATE TABLE IF NOT EXISTS content_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  kid_id UUID REFERENCES kids(id) ON DELETE SET NULL,
  
  -- Engagement metrics
  minutes_read INTEGER NOT NULL DEFAULT 0,
  pages_read INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  
  -- Session info
  session_id TEXT, -- to track unique reading sessions
  device_type TEXT,
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- For aggregation (stored, not generated - set by trigger)
  event_month TEXT,
  event_date DATE
);

-- Function to set event_month and event_date on insert
CREATE OR REPLACE FUNCTION set_content_event_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.event_month := to_char(NEW.started_at AT TIME ZONE 'UTC', 'YYYY-MM');
  NEW.event_date := (NEW.started_at AT TIME ZONE 'UTC')::date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_content_event_fields_trigger ON content_events;
CREATE TRIGGER set_content_event_fields_trigger
  BEFORE INSERT ON content_events
  FOR EACH ROW EXECUTE FUNCTION set_content_event_fields();

CREATE INDEX IF NOT EXISTS idx_content_events_user_id ON content_events(user_id);
CREATE INDEX IF NOT EXISTS idx_content_events_book_id ON content_events(book_id);
CREATE INDEX IF NOT EXISTS idx_content_events_month ON content_events(event_month);
CREATE INDEX IF NOT EXISTS idx_content_events_started_at ON content_events(started_at);
CREATE INDEX IF NOT EXISTS idx_content_events_user_book_day ON content_events(user_id, book_id, event_date);
CREATE INDEX IF NOT EXISTS idx_content_events_event_date ON content_events(event_date);

-- ============================================================
-- 6. REVENUE_PERIODS (Monthly revenue tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS revenue_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month TEXT NOT NULL UNIQUE, -- 'YYYY-MM' format
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Revenue breakdown
  subscription_gross_revenue DECIMAL(12,2) DEFAULT 0.00,
  subscription_refunds DECIMAL(12,2) DEFAULT 0.00,
  subscription_fees DECIMAL(12,2) DEFAULT 0.00, -- Stripe/processor fees
  subscription_net_revenue DECIMAL(12,2) DEFAULT 0.00,
  
  ppv_gross_revenue DECIMAL(12,2) DEFAULT 0.00,
  ppv_refunds DECIMAL(12,2) DEFAULT 0.00,
  ppv_fees DECIMAL(12,2) DEFAULT 0.00,
  ppv_net_revenue DECIMAL(12,2) DEFAULT 0.00,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed', 'finalized'
  finalized_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_periods_month ON revenue_periods(period_month);
CREATE INDEX IF NOT EXISTS idx_revenue_periods_status ON revenue_periods(status);

-- ============================================================
-- 7. CREATOR_POOLS (Subscription pool per period)
-- ============================================================

CREATE TABLE IF NOT EXISTS creator_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL UNIQUE REFERENCES revenue_periods(id) ON DELETE CASCADE,
  
  -- Pool configuration
  pool_percent DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- % of net subscription revenue
  pool_amount_gross DECIMAL(12,2) DEFAULT 0.00,
  pool_amount_net DECIMAL(12,2) DEFAULT 0.00, -- after platform reserve
  
  -- Engagement totals for the period
  total_eligible_units DECIMAL(15,2) DEFAULT 0.00,
  total_books_with_engagement INTEGER DEFAULT 0,
  total_authors_eligible INTEGER DEFAULT 0,
  
  -- Bonus pool (optional)
  bonus_pool_amount DECIMAL(12,2) DEFAULT 0.00,
  completion_bonus_rate DECIMAL(5,2) DEFAULT 5.00, -- units bonus for completion
  
  -- Status
  calculated_at TIMESTAMPTZ,
  distributed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. PURCHASES (Pay-Per-View / Individual book purchases)
-- ============================================================

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  
  -- Transaction details
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  
  -- Amounts
  price_gross DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL, -- our cut
  processor_fee DECIMAL(10,2) NOT NULL, -- Stripe fee
  net_amount DECIMAL(10,2) NOT NULL, -- amount for author(s)
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Royalty split at time of purchase (snapshot)
  royalty_split_snapshot JSONB, -- stores the split at purchase time
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'refunded', 'failed'
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  -- Timestamps
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_book_id ON purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchased_at);

-- Prevent duplicate purchases
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_user_book ON purchases(user_id, book_id) WHERE status = 'completed';

-- ============================================================
-- 9. PAYOUTS (Author payments)
-- ============================================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES revenue_periods(id) ON DELETE SET NULL, -- null for instant PPV payouts
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  
  -- Payout details
  type payout_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- For PPV payouts
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  
  -- For pool payouts
  engagement_units DECIMAL(15,2),
  pool_share_percent DECIMAL(8,4),
  books_contributed INTEGER,
  
  -- Payment processing
  payout_method TEXT, -- 'stripe_connect', 'paypal', 'bank_transfer'
  payout_reference TEXT, -- external transaction ID
  
  -- Status lifecycle
  status payout_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  failed_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_author_id ON payouts(author_id);
CREATE INDEX IF NOT EXISTS idx_payouts_period_id ON payouts(period_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_type ON payouts(type);
CREATE INDEX IF NOT EXISTS idx_payouts_pending ON payouts(author_id, status) WHERE status = 'pending';

-- ============================================================
-- 10. BOOK_ENGAGEMENT_SUMMARY (Materialized view for fast queries)
-- ============================================================

CREATE TABLE IF NOT EXISTS book_engagement_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month TEXT NOT NULL,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  
  -- Aggregated metrics
  total_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  
  -- Calculated units (for pool distribution)
  eligible_minutes INTEGER DEFAULT 0, -- after caps and filters
  engagement_units DECIMAL(15,2) DEFAULT 0.00, -- minutes + completion bonus
  
  -- Calculated at
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (period_month, book_id)
);

CREATE INDEX IF NOT EXISTS idx_book_engagement_month ON book_engagement_monthly(period_month);
CREATE INDEX IF NOT EXISTS idx_book_engagement_book ON book_engagement_monthly(book_id);

-- ============================================================
-- 11. HELPER FUNCTIONS
-- ============================================================

-- Check if user has purchased a book
CREATE OR REPLACE FUNCTION has_purchased_book(user_uuid UUID, book_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM purchases
    WHERE user_id = user_uuid
    AND book_id = book_uuid
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment author pending balance (for PPV payouts)
CREATE OR REPLACE FUNCTION increment_author_balance(p_author_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE authors
  SET pending_balance = COALESCE(pending_balance, 0) + p_amount
  WHERE id = p_author_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement author pending balance (when paid out)
CREATE OR REPLACE FUNCTION decrement_author_balance(p_author_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE authors
  SET 
    pending_balance = GREATEST(0, COALESCE(pending_balance, 0) - p_amount),
    total_earned = COALESCE(total_earned, 0) + p_amount
  WHERE id = p_author_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access book content
CREATE OR REPLACE FUNCTION can_access_book_content(user_uuid UUID, book_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_book RECORD;
BEGIN
  SELECT owner_type, subscription_included, ppv_enabled, status
  INTO v_book
  FROM books WHERE id = book_uuid;
  
  IF v_book IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Book must be published
  IF v_book.status != 'published' THEN
    -- Check if user is the author
    IF is_book_author(user_uuid, book_uuid) THEN
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END IF;
  
  -- Admin always has access
  IF is_admin(user_uuid) THEN
    RETURN TRUE;
  END IF;
  
  -- Author always has access to own book
  IF is_book_author(user_uuid, book_uuid) THEN
    RETURN TRUE;
  END IF;
  
  -- If book is subscription-included and user has subscription
  IF v_book.subscription_included AND has_active_subscription(user_uuid) THEN
    RETURN TRUE;
  END IF;
  
  -- If user has purchased the book
  IF v_book.ppv_enabled AND has_purchased_book(user_uuid, book_uuid) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate eligible engagement units for a book in a period
CREATE OR REPLACE FUNCTION calculate_book_engagement_units(
  p_book_id UUID,
  p_period_month TEXT,
  p_min_minutes INTEGER DEFAULT 2,
  p_min_pages INTEGER DEFAULT 5,
  p_daily_cap_minutes INTEGER DEFAULT 60,
  p_completion_bonus DECIMAL DEFAULT 5.0
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_units DECIMAL := 0;
  v_record RECORD;
BEGIN
  -- Sum eligible engagement per user per day, applying caps
  FOR v_record IN
    SELECT 
      user_id,
      event_date as the_date,
      LEAST(SUM(minutes_read), p_daily_cap_minutes) as capped_minutes,
      BOOL_OR(completed) as any_completed
    FROM content_events
    WHERE book_id = p_book_id
      AND event_month = p_period_month
      AND (minutes_read >= p_min_minutes OR pages_read >= p_min_pages)
    GROUP BY user_id, event_date
  LOOP
    v_total_units := v_total_units + v_record.capped_minutes;
    IF v_record.any_completed THEN
      v_total_units := v_total_units + p_completion_bonus;
    END IF;
  END LOOP;
  
  RETURN v_total_units;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 12. TRIGGERS
-- ============================================================

-- Auto-create author_books entry when book is created
CREATE OR REPLACE FUNCTION auto_create_author_book()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO author_books (author_id, book_id, role, royalty_split_percent, is_primary)
  VALUES (NEW.author_id, NEW.id, 'author', 100.00, TRUE)
  ON CONFLICT (author_id, book_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_book_created_add_author ON books;
CREATE TRIGGER on_book_created_add_author
  AFTER INSERT ON books
  FOR EACH ROW EXECUTE FUNCTION auto_create_author_book();

-- Update updated_at for new tables
DROP TRIGGER IF EXISTS update_author_books_updated_at ON author_books;
CREATE TRIGGER update_author_books_updated_at
  BEFORE UPDATE ON author_books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_revenue_periods_updated_at ON revenue_periods;
CREATE TRIGGER update_revenue_periods_updated_at
  BEFORE UPDATE ON revenue_periods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creator_pools_updated_at ON creator_pools;
CREATE TRIGGER update_creator_pools_updated_at
  BEFORE UPDATE ON creator_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payouts_updated_at ON payouts;
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 13. RLS POLICIES FOR NEW TABLES
-- ============================================================

ALTER TABLE author_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_engagement_monthly ENABLE ROW LEVEL SECURITY;

-- AUTHOR_BOOKS
DROP POLICY IF EXISTS "Public can read author_books for published books" ON author_books;
CREATE POLICY "Public can read author_books for published books"
  ON author_books FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = author_books.book_id AND books.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Authors can manage own book collaborators" ON author_books;
CREATE POLICY "Authors can manage own book collaborators"
  ON author_books FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = author_books.book_id 
      AND books.author_id = get_author_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage all author_books" ON author_books;
CREATE POLICY "Admins can manage all author_books"
  ON author_books FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- CONTENT_EVENTS
DROP POLICY IF EXISTS "Users can read own content events" ON content_events;
CREATE POLICY "Users can read own content events"
  ON content_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own content events" ON content_events;
CREATE POLICY "Users can create own content events"
  ON content_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own content events" ON content_events;
CREATE POLICY "Users can update own content events"
  ON content_events FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all content events" ON content_events;
CREATE POLICY "Admins can read all content events"
  ON content_events FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- REVENUE_PERIODS (admin only)
DROP POLICY IF EXISTS "Admins can manage revenue periods" ON revenue_periods;
CREATE POLICY "Admins can manage revenue periods"
  ON revenue_periods FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- CREATOR_POOLS (admin only for write, authors can read)
DROP POLICY IF EXISTS "Authors can read creator pools" ON creator_pools;
CREATE POLICY "Authors can read creator pools"
  ON creator_pools FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage creator pools" ON creator_pools;
CREATE POLICY "Admins can manage creator pools"
  ON creator_pools FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- PURCHASES
DROP POLICY IF EXISTS "Users can read own purchases" ON purchases;
CREATE POLICY "Users can read own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own purchases" ON purchases;
CREATE POLICY "Users can create own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Authors can read purchases of own books" ON purchases;
CREATE POLICY "Authors can read purchases of own books"
  ON purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = purchases.book_id 
      AND books.author_id = get_author_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage all purchases" ON purchases;
CREATE POLICY "Admins can manage all purchases"
  ON purchases FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- PAYOUTS
DROP POLICY IF EXISTS "Authors can read own payouts" ON payouts;
CREATE POLICY "Authors can read own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (author_id = get_author_id(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all payouts" ON payouts;
CREATE POLICY "Admins can manage all payouts"
  ON payouts FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- BOOK_ENGAGEMENT_MONTHLY
DROP POLICY IF EXISTS "Authors can read engagement for own books" ON book_engagement_monthly;
CREATE POLICY "Authors can read engagement for own books"
  ON book_engagement_monthly FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_engagement_monthly.book_id 
      AND books.author_id = get_author_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage all engagement data" ON book_engagement_monthly;
CREATE POLICY "Admins can manage all engagement data"
  ON book_engagement_monthly FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- 14. MIGRATE EXISTING DATA
-- ============================================================

-- Create author_books entries for existing books
INSERT INTO author_books (author_id, book_id, role, royalty_split_percent, is_primary)
SELECT author_id, id, 'author', 100.00, TRUE
FROM books
WHERE NOT EXISTS (
  SELECT 1 FROM author_books WHERE author_books.book_id = books.id
)
ON CONFLICT (author_id, book_id) DO NOTHING;

-- Set default owner_type for existing books (all are third_party unless by platform author)
UPDATE books SET owner_type = 'platform'
WHERE author_id IN (
  SELECT id FROM authors WHERE author_type = 'platform_owner'
);
