-- KellerSharer Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- KELLER PROFILES TABLE
-- =====================
-- Extends the Supabase auth.users with app-specific data
CREATE TABLE IF NOT EXISTS keller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('renter', 'searcher')) DEFAULT 'searcher',
  company_name TEXT,
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_keller_profiles_user_id ON keller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_keller_profiles_user_type ON keller_profiles(user_type);

-- =====================
-- SPACES TABLE
-- =====================
-- Spaces available for rent
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES keller_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('basement', 'garage', 'attic', 'storage_room', 'warehouse', 'parking', 'other')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'active', 'rented', 'inactive')) DEFAULT 'draft',
  size_m2 NUMERIC(10, 2) NOT NULL CHECK (size_m2 > 0),
  price_per_m2 NUMERIC(10, 2) NOT NULL CHECK (price_per_m2 > 0),
  total_price NUMERIC(10, 2) GENERATED ALWAYS AS (size_m2 * price_per_m2) STORED,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Germany',
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  minimum_rental_months INTEGER DEFAULT 1 CHECK (minimum_rental_months >= 1),
  available_from DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spaces_owner_id ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);
CREATE INDEX IF NOT EXISTS idx_spaces_type ON spaces(type);
CREATE INDEX IF NOT EXISTS idx_spaces_city ON spaces(city);
CREATE INDEX IF NOT EXISTS idx_spaces_total_price ON spaces(total_price);

-- =====================
-- SPACE SEARCHES TABLE
-- =====================
-- Search profiles for people looking for space
CREATE TABLE IF NOT EXISTS space_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  searcher_id UUID REFERENCES keller_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  preferred_types TEXT[] DEFAULT '{}',
  min_size_m2 NUMERIC(10, 2) CHECK (min_size_m2 > 0),
  max_size_m2 NUMERIC(10, 2) CHECK (max_size_m2 >= min_size_m2),
  min_budget NUMERIC(10, 2) CHECK (min_budget > 0),
  max_budget NUMERIC(10, 2) CHECK (max_budget >= min_budget),
  preferred_cities TEXT[] DEFAULT '{}',
  required_amenities TEXT[] DEFAULT '{}',
  desired_start_date DATE,
  rental_duration_months INTEGER DEFAULT 3 CHECK (rental_duration_months >= 1),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'found')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_space_searches_searcher_id ON space_searches(searcher_id);
CREATE INDEX IF NOT EXISTS idx_space_searches_status ON space_searches(status);

-- =====================
-- RENTALS TABLE
-- =====================
-- Rental agreements between renters and searchers
CREATE TABLE IF NOT EXISTS rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES keller_profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES keller_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent > 0),
  start_date DATE NOT NULL,
  end_date DATE,
  payment_day INTEGER DEFAULT 1 CHECK (payment_day >= 1 AND payment_day <= 28),
  stripe_subscription_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rentals_space_id ON rentals(space_id);
CREATE INDEX IF NOT EXISTS idx_rentals_renter_id ON rentals(renter_id);
CREATE INDEX IF NOT EXISTS idx_rentals_tenant_id ON rentals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

-- =====================
-- CONTRACTS TABLE
-- =====================
-- Rental contracts (legally binding documents)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE NOT NULL UNIQUE,
  content TEXT NOT NULL,
  renter_signed_at TIMESTAMP WITH TIME ZONE,
  tenant_signed_at TIMESTAMP WITH TIME ZONE,
  renter_signature TEXT,
  tenant_signature TEXT,
  contract_start DATE NOT NULL,
  contract_end DATE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_contracts_rental_id ON contracts(rental_id);

-- =====================
-- PAYMENTS TABLE
-- =====================
-- Payment history
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE keller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Keller Profiles Policies
CREATE POLICY "Users can view their own profile" ON keller_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON keller_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON keller_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON keller_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM keller_profiles WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Spaces Policies
CREATE POLICY "Anyone can view active spaces" ON spaces
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can view their own spaces" ON spaces
  FOR SELECT USING (
    owner_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can insert their own spaces" ON spaces
  FOR INSERT WITH CHECK (
    owner_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can update their own spaces" ON spaces
  FOR UPDATE USING (
    owner_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can delete their own spaces" ON spaces
  FOR DELETE USING (
    owner_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all spaces" ON spaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM keller_profiles WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Space Searches Policies
CREATE POLICY "Renters can view active searches" ON space_searches
  FOR SELECT USING (status = 'active');

CREATE POLICY "Searchers can manage their own searches" ON space_searches
  FOR ALL USING (
    searcher_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
  );

-- Rentals Policies
CREATE POLICY "Users can view their own rentals" ON rentals
  FOR SELECT USING (
    renter_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid()) OR
    tenant_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create rentals" ON rentals
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all rentals" ON rentals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM keller_profiles WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Contracts Policies
CREATE POLICY "Users can view their own contracts" ON contracts
  FOR SELECT USING (
    rental_id IN (
      SELECT id FROM rentals WHERE 
        renter_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid()) OR
        tenant_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own contracts" ON contracts
  FOR UPDATE USING (
    rental_id IN (
      SELECT id FROM rentals WHERE 
        renter_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid()) OR
        tenant_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
    )
  );

-- Payments Policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (
    rental_id IN (
      SELECT id FROM rentals WHERE 
        renter_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid()) OR
        tenant_id IN (SELECT id FROM keller_profiles WHERE user_id = auth.uid())
    )
  );

-- =====================
-- TRIGGERS
-- =====================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_keller_profiles_updated_at
  BEFORE UPDATE ON keller_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_space_searches_updated_at
  BEFORE UPDATE ON space_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- FUNCTIONS
-- =====================

-- Function to get admin stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM keller_profiles),
    'totalSpaces', (SELECT COUNT(*) FROM spaces),
    'activeRentals', (SELECT COUNT(*) FROM rentals WHERE status = 'active'),
    'pendingApprovals', (SELECT COUNT(*) FROM spaces WHERE status = 'pending'),
    'totalRevenue', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'succeeded'),
    'monthlyRevenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments 
      WHERE status = 'succeeded' 
      AND paid_at >= date_trunc('month', CURRENT_DATE)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- SAMPLE DATA (Optional - Remove in production)
-- =====================

-- To test the app, you can uncomment this section to add sample data
-- Make sure to replace the user_id values with actual auth.users IDs

/*
-- Sample renter profile
INSERT INTO keller_profiles (user_id, email, full_name, user_type, company_name)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'renter@example.com', 'Max Mustermann', 'renter', 'Max Storage GmbH');

-- Sample searcher profile
INSERT INTO keller_profiles (user_id, email, full_name, user_type)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'searcher@example.com', 'Anna Schmidt', 'searcher');

-- Sample spaces
INSERT INTO spaces (owner_id, title, description, type, status, size_m2, price_per_m2, address, city, postal_code, amenities, minimum_rental_months)
VALUES 
  (
    (SELECT id FROM keller_profiles WHERE email = 'renter@example.com'),
    'Spacious Basement in Kreuzberg',
    'Clean and dry basement space perfect for storage. Easy access, well-lit.',
    'basement',
    'active',
    25,
    8.50,
    'Oranienstraße 100',
    'Berlin',
    '10999',
    ARRAY['24/7 Access', 'Climate Controlled', 'Security Cameras'],
    3
  ),
  (
    (SELECT id FROM keller_profiles WHERE email = 'renter@example.com'),
    'Garage in Prenzlauer Berg',
    'Secure garage with electric gate. Good for vehicle or storage.',
    'garage',
    'active',
    20,
    12.00,
    'Schönhauser Allee 50',
    'Berlin',
    '10437',
    ARRAY['24/7 Access', 'Security Cameras', 'Power Outlets'],
    6
  );

-- Sample search
INSERT INTO space_searches (searcher_id, title, description, preferred_types, min_size_m2, max_size_m2, min_budget, max_budget, preferred_cities, rental_duration_months)
VALUES 
  (
    (SELECT id FROM keller_profiles WHERE email = 'searcher@example.com'),
    'Looking for basement in Berlin',
    'Need storage space for furniture during apartment renovation.',
    ARRAY['basement', 'storage_room'],
    10,
    30,
    50,
    200,
    ARRAY['Berlin'],
    3
  );
*/
