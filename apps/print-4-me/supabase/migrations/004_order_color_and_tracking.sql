-- Add color selection and public tracking link support to legacy flow

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT 'White';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT 'White',
  ADD COLUMN IF NOT EXISTS tracking_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex');

UPDATE orders
SET color = COALESCE(quotes.color, orders.color, 'White')
FROM quotes
WHERE orders.quote_id = quotes.id;

UPDATE orders
SET tracking_token = encode(gen_random_bytes(16), 'hex')
WHERE tracking_token IS NULL OR tracking_token = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);
