-- GlamCall Database Schema
-- Supabase PostgreSQL Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONSULTANTS TABLE
-- Remote beauty consultants who take video calls
-- ============================================
CREATE TABLE consultants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  photo_url TEXT,
  bio TEXT,
  languages TEXT[] DEFAULT '{"English"}',
  experience_years INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  hourly_rate DECIMAL(10, 2) DEFAULT 25.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_consultants_status ON consultants(status);
CREATE INDEX idx_consultants_user_id ON consultants(user_id);
CREATE INDEX idx_consultants_email ON consultants(email);

-- ============================================
-- STORES TABLE
-- Retail stores that use GlamCall
-- ============================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'Germany',
  qr_code_url TEXT,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_stores_active ON stores(is_active);
CREATE INDEX idx_stores_city ON stores(city);

-- ============================================
-- AVAILABILITY TABLE
-- Weekly availability schedule for consultants
-- ============================================
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_consultant_day_time UNIQUE (consultant_id, day_of_week, start_time)
);

-- Index for faster lookups
CREATE INDEX idx_availability_consultant ON availability(consultant_id);
CREATE INDEX idx_availability_day ON availability(day_of_week);

-- ============================================
-- ASSIGNMENTS TABLE
-- Which consultants are assigned to which stores
-- ============================================
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(10, 2), -- Override default rate (null = use consultant's default)
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT unique_consultant_store UNIQUE (consultant_id, store_id)
);

-- Index for faster lookups
CREATE INDEX idx_assignments_consultant ON assignments(consultant_id);
CREATE INDEX idx_assignments_store ON assignments(store_id);
CREATE INDEX idx_assignments_active ON assignments(is_active);

-- ============================================
-- BOOKINGS TABLE
-- Scheduled consultations
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_bookings_consultant ON bookings(consultant_id);
CREATE INDEX idx_bookings_store ON bookings(store_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);

-- ============================================
-- CALLS TABLE
-- Video call history and tracking
-- ============================================
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  room_name VARCHAR(255) NOT NULL UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'missed', 'dropped')),
  customer_feedback INTEGER CHECK (customer_feedback >= 1 AND customer_feedback <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_calls_consultant ON calls(consultant_id);
CREATE INDEX idx_calls_store ON calls(store_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_started_at ON calls(started_at);
CREATE INDEX idx_calls_room_name ON calls(room_name);

-- ============================================
-- PRODUCT_RECOMMENDATIONS TABLE
-- Products recommended during calls
-- ============================================
CREATE TABLE product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  product_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_recommendations_call ON product_recommendations(call_id);

-- ============================================
-- PROFILES TABLE
-- User profiles with roles
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'consultant', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_consultants_updated_at
  BEFORE UPDATE ON consultants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Consultants policies
CREATE POLICY "Anyone can view approved consultants"
  ON consultants FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Consultants can view their own profile"
  ON consultants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Consultants can update their own profile"
  ON consultants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can apply as consultant"
  ON consultants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all consultants"
  ON consultants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any consultant"
  ON consultants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Stores policies
CREATE POLICY "Anyone can view active stores"
  ON stores FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage stores"
  ON stores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Availability policies
CREATE POLICY "Anyone can view consultant availability"
  ON availability FOR SELECT
  USING (true);

CREATE POLICY "Consultants can manage their own availability"
  ON availability FOR ALL
  USING (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all availability"
  ON availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Assignments policies
CREATE POLICY "Anyone can view active assignments"
  ON assignments FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Consultants can update their bookings"
  ON bookings FOR UPDATE
  USING (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Calls policies
CREATE POLICY "Anyone can start a call"
  ON calls FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view calls"
  ON calls FOR SELECT
  USING (true);

CREATE POLICY "Call participants can update"
  ON calls FOR UPDATE
  USING (true);

CREATE POLICY "Admins can manage all calls"
  ON calls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Product recommendations policies
CREATE POLICY "Anyone can view recommendations"
  ON product_recommendations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add recommendations"
  ON product_recommendations FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get available consultants for a store
CREATE OR REPLACE FUNCTION get_available_consultants_for_store(store_uuid UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  photo_url TEXT,
  bio TEXT,
  languages TEXT[],
  experience_years INTEGER,
  is_available_now BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.photo_url,
    c.bio,
    c.languages,
    c.experience_years,
    EXISTS (
      SELECT 1 FROM availability a
      WHERE a.consultant_id = c.id
        AND a.day_of_week = EXTRACT(DOW FROM NOW())
        AND a.is_available = true
        AND CURRENT_TIME BETWEEN a.start_time AND a.end_time
    ) AS is_available_now
  FROM consultants c
  JOIN assignments ass ON c.id = ass.consultant_id
  WHERE ass.store_id = store_uuid
    AND ass.is_active = true
    AND c.status = 'approved'
  ORDER BY is_available_now DESC, c.name;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate consultant earnings
CREATE OR REPLACE FUNCTION get_consultant_earnings(
  consultant_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_calls BIGINT,
  total_minutes BIGINT,
  total_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_calls,
    COALESCE(SUM(c.duration_minutes), 0)::BIGINT AS total_minutes,
    COALESCE(
      SUM(c.duration_minutes::DECIMAL / 60 * COALESCE(a.hourly_rate, cons.hourly_rate)),
      0
    ) AS total_earnings
  FROM calls c
  JOIN consultants cons ON c.consultant_id = cons.id
  LEFT JOIN assignments a ON c.consultant_id = a.consultant_id AND c.store_id = a.store_id
  WHERE c.consultant_id = consultant_uuid
    AND c.status = 'completed'
    AND c.started_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (for development)
-- ============================================

-- Insert sample stores
INSERT INTO stores (name, address, city, country, contact_email, is_active) VALUES
('BeautyMax Berlin Mitte', 'Friedrichstraße 123', 'Berlin', 'Germany', 'berlin.mitte@beautymax.de', true),
('BeautyMax Hamburg', 'Mönckebergstraße 45', 'Hamburg', 'Germany', 'hamburg@beautymax.de', true),
('BeautyMax Munich', 'Kaufingerstraße 12', 'Munich', 'Germany', 'munich@beautymax.de', true),
('Luxe Cosmetics Düsseldorf', 'Königsallee 88', 'Düsseldorf', 'Germany', 'info@luxe-duesseldorf.de', true),
('Beauty Palace Frankfurt', 'Zeil 55', 'Frankfurt', 'Germany', 'contact@beautypalace-ffm.de', true);

-- Insert sample consultants
INSERT INTO consultants (name, email, phone, bio, languages, experience_years, status, hourly_rate) VALUES
('Elena Rodriguez', 'elena@glamcall.io', '+49 151 1234567', 'Certified makeup artist with 8 years of experience in luxury cosmetics. Specialized in bridal and evening looks.', ARRAY['English', 'Spanish', 'German'], 8, 'approved', 35.00),
('Sophie Chen', 'sophie@glamcall.io', '+49 152 2345678', 'Skincare specialist and licensed esthetician. Expert in Korean beauty routines and anti-aging treatments.', ARRAY['English', 'Mandarin', 'German'], 5, 'approved', 30.00),
('Amélie Dubois', 'amelie@glamcall.io', '+49 153 3456789', 'French beauty consultant with background in high-end perfumery. Expert color matching and fragrance pairing.', ARRAY['English', 'French', 'German'], 6, 'approved', 32.00),
('Maria Santos', 'maria@glamcall.io', '+49 154 4567890', 'Natural beauty advocate specializing in organic and vegan cosmetics. Holistic approach to skincare.', ARRAY['English', 'Portuguese', 'German'], 4, 'approved', 28.00),
('Lisa Müller', 'lisa@glamcall.io', '+49 155 5678901', 'Award-winning hair and makeup artist. Specializes in everyday beauty looks and quick tutorials.', ARRAY['German', 'English'], 7, 'approved', 33.00),
('Anna Kowalski', 'anna.k@glamcall.io', '+49 156 6789012', 'New to GlamCall, experienced in retail beauty consulting.', ARRAY['English', 'Polish', 'German'], 3, 'pending', 25.00);

-- Create assignments (link consultants to stores)
INSERT INTO assignments (consultant_id, store_id, is_active)
SELECT c.id, s.id, true
FROM consultants c
CROSS JOIN stores s
WHERE c.status = 'approved'
  AND c.name IN ('Elena Rodriguez', 'Sophie Chen', 'Amélie Dubois')
  AND s.name LIKE 'BeautyMax%';

INSERT INTO assignments (consultant_id, store_id, is_active)
SELECT c.id, s.id, true
FROM consultants c
CROSS JOIN stores s
WHERE c.status = 'approved'
  AND c.name IN ('Maria Santos', 'Lisa Müller')
  AND s.name IN ('Luxe Cosmetics Düsseldorf', 'Beauty Palace Frankfurt');

-- Create sample availability for approved consultants
INSERT INTO availability (consultant_id, day_of_week, start_time, end_time, is_available)
SELECT c.id, d.day, '09:00'::TIME, '17:00'::TIME, true
FROM consultants c
CROSS JOIN generate_series(1, 5) AS d(day) -- Monday to Friday
WHERE c.status = 'approved';
