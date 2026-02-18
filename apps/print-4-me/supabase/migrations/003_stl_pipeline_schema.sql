-- ============================================================
-- Migration 003: STL → Slice → Quote → Pay → G-code pipeline
-- Full order lifecycle with slicer-based pricing
-- ============================================================

-- 1. Extended order status enum
DO $$ BEGIN
  -- Drop old enum and recreate with full lifecycle
  -- We can't ALTER TYPE to remove values, so we create a new one
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_v2') THEN
    DROP TYPE order_status_v2;
  END IF;

  CREATE TYPE order_status_v2 AS ENUM (
    'NEW',
    'QUOTED',
    'PAID',
    'SLICING',
    'READY_TO_PRINT',
    'PRINTING',
    'PRINT_DONE',
    'WAITING_DELIVERY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED',
    'REFUNDED'
  );
END $$;

-- 2. Printer profiles table
CREATE TABLE IF NOT EXISTS printer_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  prusa_ini_storage_key text,          -- path in object storage to the printer .ini
  machine_eur_per_hour numeric(8,4) NOT NULL DEFAULT 4.00,
  avg_kw numeric(6,4) NOT NULL DEFAULT 0.12,
  build_volume_x_mm numeric(8,2) DEFAULT 220,
  build_volume_y_mm numeric(8,2) DEFAULT 220,
  build_volume_z_mm numeric(8,2) DEFAULT 250,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Material profiles table
CREATE TABLE IF NOT EXISTS material_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,                  -- e.g. "PLA", "PETG", "ABS"
  description text,
  color text DEFAULT 'Generic',
  filament_eur_per_kg numeric(8,4) NOT NULL DEFAULT 9.83,
  filament_ini_storage_key text,       -- path in object storage to filament .ini
  waste_multiplier numeric(5,4) NOT NULL DEFAULT 0.15,
  density_g_per_cm3 numeric(6,4) DEFAULT 1.24,
  nozzle_temp_c integer DEFAULT 210,
  bed_temp_c integer DEFAULT 60,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Pipeline orders table (new table alongside old orders for migration safety)
CREATE TABLE IF NOT EXISTS pipeline_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'NEW'
    CHECK (status IN (
      'NEW','QUOTED','PAID','SLICING','READY_TO_PRINT','PRINTING',
      'PRINT_DONE','WAITING_DELIVERY','OUT_FOR_DELIVERY','DELIVERED',
      'FAILED','REFUNDED'
    )),

  -- Print settings
  printer_profile_id uuid REFERENCES printer_profiles(id),
  material_profile_id uuid REFERENCES material_profiles(id),
  layer_height numeric(5,3) DEFAULT 0.20,
  infill_percent integer DEFAULT 20 CHECK (infill_percent BETWEEN 0 AND 100),
  supports boolean DEFAULT false,
  notes text,
  quantity integer NOT NULL DEFAULT 1,

  -- Quote / pricing
  quote_currency text DEFAULT 'EUR',
  quote_total_cents integer,                    -- total in cents
  quote_breakdown_json jsonb,                   -- full price breakdown
  slicer_estimate_json jsonb,                   -- { grams_used, print_time_seconds, ... }
  pricing_constants_json jsonb,                 -- snapshot of pricing constants used

  -- Stripe
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,

  -- Storage keys (paths in Supabase Storage / S3)
  stl_storage_key text,
  stl_filename text,
  stl_file_size_bytes bigint,
  gcode_storage_key text,
  gcode_ready_at timestamptz,

  -- Shipping
  shipping_address jsonb,
  tracking_number text,
  label_url text,

  -- Failure
  failure_reason text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Order events (audit log for every status transition)
CREATE TABLE IF NOT EXISTS order_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES pipeline_orders(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  message text,
  actor_user_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_orders_user_id ON pipeline_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_orders_status ON pipeline_orders(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_orders_created_at ON pipeline_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events(created_at);

-- 7. Seed default printer and material profiles
INSERT INTO printer_profiles (name, description, machine_eur_per_hour, avg_kw, build_volume_x_mm, build_volume_y_mm, build_volume_z_mm)
VALUES
  ('Ender 3 V2', 'Creality Ender 3 V2 – reliable FDM printer', 4.00, 0.12, 220, 220, 250),
  ('Prusa i3 MK3S+', 'Prusa i3 MK3S+ – high quality FDM', 5.00, 0.14, 250, 210, 210),
  ('Bambu Lab X1C', 'Bambu Lab X1 Carbon – fast multi-material', 6.00, 0.18, 256, 256, 256)
ON CONFLICT DO NOTHING;

INSERT INTO material_profiles (name, description, color, filament_eur_per_kg, waste_multiplier, density_g_per_cm3, nozzle_temp_c, bed_temp_c)
VALUES
  ('PLA',  'Standard PLA filament – biodegradable', 'Generic', 9.83, 0.15, 1.24, 210, 60),
  ('PETG', 'PETG filament – strong and heat-resistant', 'Generic', 14.50, 0.15, 1.27, 230, 80),
  ('ABS',  'ABS filament – durable, requires enclosure', 'Generic', 12.00, 0.20, 1.04, 240, 100),
  ('TPU',  'Flexible TPU filament', 'Generic', 22.00, 0.20, 1.21, 220, 50)
ON CONFLICT DO NOTHING;

-- 8. RLS Policies
ALTER TABLE pipeline_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "Users can view own pipeline orders"
  ON pipeline_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can create own pipeline orders"
  ON pipeline_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all orders (via service role, bypasses RLS)
-- Users can view events for their orders
CREATE POLICY "Users can view own order events"
  ON order_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pipeline_orders
      WHERE pipeline_orders.id = order_events.order_id
        AND pipeline_orders.user_id = auth.uid()
    )
  );

-- Public read on profiles (printer/material)
CREATE POLICY "Anyone can view printer profiles"
  ON printer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view material profiles"
  ON material_profiles FOR SELECT
  USING (true);

-- 9. Storage buckets (run via Supabase dashboard or CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('stl-files', 'stl-files', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gcode-files', 'gcode-files', false);

-- 10. Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pipeline_orders_updated_at ON pipeline_orders;
CREATE TRIGGER pipeline_orders_updated_at
  BEFORE UPDATE ON pipeline_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
