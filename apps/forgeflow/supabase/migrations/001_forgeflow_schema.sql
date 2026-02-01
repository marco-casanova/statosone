-- ForgeFlow Complete Database Schema
-- Run this in Supabase SQL Editor

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE material AS ENUM ('PLA', 'PETG', 'RESIN');
CREATE TYPE quality AS ENUM ('draft', 'standard', 'fine');
CREATE TYPE file_type AS ENUM ('stl', 'obj');
CREATE TYPE order_status AS ENUM ('created', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled');
CREATE TYPE custom_request_status AS ENUM ('submitted', 'reviewing', 'quoted', 'accepted', 'rejected');

-- =====================================================
-- PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (
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
  VALUES (NEW.id, NEW.email, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- MODELS TABLE
-- =====================================================

CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_models_user_id ON models(user_id);

-- =====================================================
-- QUOTES TABLE
-- =====================================================

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material material NOT NULL,
  quality quality NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_model_id ON quotes(model_id);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  status order_status NOT NULL DEFAULT 'created',
  shipping_address JSONB NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  tracking_number TEXT,
  label_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);

-- =====================================================
-- CUSTOM REQUESTS TABLE
-- =====================================================

CREATE TABLE custom_requests (
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

CREATE INDEX idx_custom_requests_user_id ON custom_requests(user_id);
CREATE INDEX idx_custom_requests_status ON custom_requests(status);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_requests_updated_at
  BEFORE UPDATE ON custom_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- MODELS POLICIES
CREATE POLICY "Users can view own models"
  ON models FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own models"
  ON models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own models"
  ON models FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own models"
  ON models FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all models"
  ON models FOR SELECT
  USING (is_admin(auth.uid()));

-- QUOTES POLICIES
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
  ON quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quotes"
  ON quotes FOR SELECT
  USING (is_admin(auth.uid()));

-- ORDERS POLICIES
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders with limited fields"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'created');

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- CUSTOM REQUESTS POLICIES
CREATE POLICY "Users can view own custom requests"
  ON custom_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom requests"
  ON custom_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all custom requests"
  ON custom_requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all custom requests"
  ON custom_requests FOR UPDATE
  USING (is_admin(auth.uid()));

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets (run in Supabase Dashboard or via API)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('models', 'models', false, 104857600, ARRAY['model/stl', 'application/sla', 'model/obj', 'application/octet-stream', 'text/plain']),
  ('references', 'references', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'model/stl', 'model/obj', 'application/octet-stream'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for models bucket
CREATE POLICY "Users can upload models"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'models' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own models"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'models' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own models"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'models' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for references bucket
CREATE POLICY "Users can upload references"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'references' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own references"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'references' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own references"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'references' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all storage
CREATE POLICY "Admins can view all models storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'models' AND is_admin(auth.uid()));

CREATE POLICY "Admins can view all references storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'references' AND is_admin(auth.uid()));
