-- Print-4-Me Full Schema (Safe/Idempotent)
-- Run this once in Supabase SQL Editor

-- =====================================================
-- CUSTOM TYPES (SAFE)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'material') THEN
    CREATE TYPE material AS ENUM ('PLA', 'PETG', 'RESIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quality') THEN
    CREATE TYPE quality AS ENUM ('draft', 'standard', 'fine');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_type') THEN
    CREATE TYPE file_type AS ENUM ('stl', 'obj');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('created', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'custom_request_status') THEN
    CREATE TYPE custom_request_status AS ENUM ('submitted', 'reviewing', 'quoted', 'accepted', 'rejected');
  END IF;
END $$;

-- =====================================================
-- PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- =====================================================
-- MODELS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);

-- =====================================================
-- QUOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material material NOT NULL,
  quality quality NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  base_price_cents INT NOT NULL DEFAULT 0,
  quality_addon_cents INT NOT NULL DEFAULT 0,
  quantity_price_cents INT NOT NULL DEFAULT 0,
  shipping_cents INT NOT NULL DEFAULT 0,
  total_cents INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  shipping_address JSONB,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_model_id ON quotes(model_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotes_total_cents_check'
  ) THEN
    ALTER TABLE quotes
      ADD CONSTRAINT quotes_total_cents_check CHECK (total_cents >= 0);
  END IF;
END $$;

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  status order_status NOT NULL DEFAULT 'created',
  material material NOT NULL DEFAULT 'PLA',
  quality quality NOT NULL DEFAULT 'standard',
  quantity INT NOT NULL DEFAULT 1,
  total_cents INT NOT NULL DEFAULT 0,
  shipping_address JSONB NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  tracking_number TEXT,
  label_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_quantity_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_quantity_check CHECK (quantity > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_cents_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_total_cents_check CHECK (total_cents >= 0);
  END IF;
END $$;

-- =====================================================
-- CUSTOM REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  reference_paths TEXT[] NOT NULL DEFAULT '{}',
  status custom_request_status NOT NULL DEFAULT 'submitted',
  admin_quote_cents INT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_requests_user_id ON custom_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);

-- =====================================================
-- UPDATED_AT TRIGGERS (ASSUMES SHARED FUNCTION EXISTS)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_custom_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_custom_requests_updated_at
      BEFORE UPDATE ON custom_requests
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
DO $$
BEGIN
  IF to_regprocedure('public.is_admin(uuid)') IS NULL THEN
    CREATE FUNCTION is_admin(user_id UUID)
    RETURNS BOOLEAN AS $fn$
      SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
      );
    $fn$ LANGUAGE sql SECURITY DEFINER STABLE;
  END IF;
END $$;

-- PROFILES POLICIES
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON profiles FOR SELECT
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- MODELS POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own models') THEN
    CREATE POLICY "Users can view own models"
      ON models FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own models') THEN
    CREATE POLICY "Users can insert own models"
      ON models FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own models') THEN
    CREATE POLICY "Users can update own models"
      ON models FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own models') THEN
    CREATE POLICY "Users can delete own models"
      ON models FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all models') THEN
    CREATE POLICY "Admins can view all models"
      ON models FOR SELECT
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- QUOTES POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own quotes') THEN
    CREATE POLICY "Users can view own quotes"
      ON quotes FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own quotes') THEN
    CREATE POLICY "Users can insert own quotes"
      ON quotes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all quotes') THEN
    CREATE POLICY "Admins can view all quotes"
      ON quotes FOR SELECT
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- ORDERS POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own orders') THEN
    CREATE POLICY "Users can view own orders"
      ON orders FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own orders') THEN
    CREATE POLICY "Users can insert own orders"
      ON orders FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own orders with limited fields') THEN
    CREATE POLICY "Users can update own orders with limited fields"
      ON orders FOR UPDATE
      USING (auth.uid() = user_id AND status = 'created');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all orders') THEN
    CREATE POLICY "Admins can view all orders"
      ON orders FOR SELECT
      USING (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update all orders') THEN
    CREATE POLICY "Admins can update all orders"
      ON orders FOR UPDATE
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- CUSTOM REQUESTS POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own custom requests') THEN
    CREATE POLICY "Users can view own custom requests"
      ON custom_requests FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own custom requests') THEN
    CREATE POLICY "Users can insert own custom requests"
      ON custom_requests FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all custom requests') THEN
    CREATE POLICY "Admins can view all custom requests"
      ON custom_requests FOR SELECT
      USING (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update all custom requests') THEN
    CREATE POLICY "Admins can update all custom requests"
      ON custom_requests FOR UPDATE
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- =====================================================
-- STORAGE BUCKETS + POLICIES
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('models', 'models', false, 104857600, ARRAY['model/stl', 'application/sla', 'model/obj', 'application/octet-stream', 'text/plain']),
  ('references', 'references', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'model/stl', 'model/obj', 'application/octet-stream'])
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload models') THEN
    CREATE POLICY "Users can upload models"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'models' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own models') THEN
    CREATE POLICY "Users can view own models"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'models' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own models') THEN
    CREATE POLICY "Users can delete own models"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'models' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload references') THEN
    CREATE POLICY "Users can upload references"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'references' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own references') THEN
    CREATE POLICY "Users can view own references"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'references' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own references') THEN
    CREATE POLICY "Users can delete own references"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'references' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all models storage') THEN
    CREATE POLICY "Admins can view all models storage"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'models' AND is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all references storage') THEN
    CREATE POLICY "Admins can view all references storage"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'references' AND is_admin(auth.uid()));
  END IF;
END $$;
