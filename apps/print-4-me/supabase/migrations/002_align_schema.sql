-- Align schema with app expectations (quotes + orders)

-- =====================================================
-- QUOTES TABLE UPDATES
-- =====================================================

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS base_price_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_addon_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantity_price_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cents INT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE quotes
SET total_cents = price_cents
WHERE total_cents IS NULL;

UPDATE quotes
SET expires_at = NOW() + INTERVAL '7 days'
WHERE expires_at IS NULL;

ALTER TABLE quotes
  ALTER COLUMN total_cents SET NOT NULL,
  ALTER COLUMN expires_at SET NOT NULL,
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '7 days');

ALTER TABLE quotes
  ADD CONSTRAINT quotes_total_cents_check CHECK (total_cents >= 0);

-- =====================================================
-- ORDERS TABLE UPDATES
-- =====================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS material material NOT NULL DEFAULT 'PLA',
  ADD COLUMN IF NOT EXISTS quality quality NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_cents INT NOT NULL DEFAULT 0;

UPDATE orders
SET material = quotes.material,
    quality = quotes.quality,
    quantity = quotes.quantity,
    total_cents = COALESCE(quotes.total_cents, quotes.price_cents, orders.total_cents)
FROM quotes
WHERE orders.quote_id = quotes.id;

ALTER TABLE orders
  ALTER COLUMN material DROP DEFAULT,
  ALTER COLUMN quality DROP DEFAULT,
  ALTER COLUMN quantity DROP DEFAULT,
  ALTER COLUMN total_cents DROP DEFAULT;

ALTER TABLE orders
  ADD CONSTRAINT orders_quantity_check CHECK (quantity > 0),
  ADD CONSTRAINT orders_total_cents_check CHECK (total_cents >= 0);
