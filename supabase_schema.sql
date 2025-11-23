-- One Single View - Supabase Database Schema
-- Run this SQL in Supabase SQL Editor after creating your project

-- ============================================
-- 1. USERS TABLE (replaces Firebase users collection)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('individual', 'corporate', 'admin', 'rm')),
  rm_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data, admins can read all
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. USER AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_changed TEXT NOT NULL CHECK (field_changed IN ('email', 'mobile')),
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit log"
  ON user_audit_log FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================
-- 3. MOTOR POLICIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS motor_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('Car', 'Bike', 'Bus', 'GCV', 'Misc')),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  manufacturing_year INTEGER NOT NULL,
  number_plate_type TEXT NOT NULL CHECK (number_plate_type IN ('White', 'Yellow', 'EV')),
  insurer_name TEXT NOT NULL,
  premium_amount DECIMAL(10,2) NOT NULL,
  policy_start_date DATE NOT NULL,
  policy_end_date DATE NOT NULL,
  rc_docs TEXT[] DEFAULT '{}',
  previous_policy_docs TEXT[] DEFAULT '{}',
  dl_docs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE motor_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own policies, admins can view all"
  ON motor_policies FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own policies"
  ON motor_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own policies"
  ON motor_policies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own policies"
  ON motor_policies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. GMC POLICIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gmc_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT,
  policy_number TEXT NOT NULL,
  insurer_name TEXT NOT NULL,
  sum_insured DECIMAL(12,2),
  premium_amount DECIMAL(10,2) NOT NULL,
  expiry_date DATE NOT NULL,
  policy_docs TEXT[] DEFAULT '{}',
  no_of_lives INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gmc_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own GMC policies"
  ON gmc_policies FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own GMC policies"
  ON gmc_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GMC policies"
  ON gmc_policies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GMC policies"
  ON gmc_policies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. COMMERCIAL POLICIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS commercial_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lob_type TEXT NOT NULL CHECK (lob_type IN ('GPA', 'Fire', 'Other')),
  company_name TEXT,
  policy_holder_name TEXT,
  policy_number TEXT NOT NULL,
  insurer_name TEXT NOT NULL,
  premium_amount DECIMAL(10,2) NOT NULL,
  sum_insured DECIMAL(12,2),
  expiry_date DATE NOT NULL,
  policy_docs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE commercial_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commercial policies"
  ON commercial_policies FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own commercial policies"
  ON commercial_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commercial policies"
  ON commercial_policies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own commercial policies"
  ON commercial_policies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CLAIMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL,
  lob_type TEXT NOT NULL CHECK (lob_type IN ('Motor', 'GMC', 'GPA', 'Fire', 'Other')),
  claim_type TEXT NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT NOT NULL,
  supporting_docs TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('New', 'In Progress', 'Settled', 'Rejected')) DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own claims"
  ON claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own claims"
  ON claims FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. QUOTE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lob_type TEXT NOT NULL CHECK (lob_type IN ('Motor', 'Health', 'Life', 'Others')),
  details TEXT NOT NULL,
  uploaded_quote TEXT,
  has_better_quote BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('New', 'Contacted', 'Closed')) DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quote requests"
  ON quote_requests FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. REFERRALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  friend_mobile TEXT NOT NULL,
  friend_email TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 9. GARAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  insurer TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE garages ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read garages
CREATE POLICY "Authenticated users can view garages"
  ON garages FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can modify garages
CREATE POLICY "Only admins can modify garages"
  ON garages FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================
-- 10. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify settings"
  ON settings FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('expiry_threshold_days', '20'::jsonb),
  ('client_logos', '[]'::jsonb),
  ('ad_banners', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- INDEXES for better query performance
-- ============================================
CREATE INDEX idx_motor_policies_user_id ON motor_policies(user_id);
CREATE INDEX idx_motor_policies_end_date ON motor_policies(policy_end_date);
CREATE INDEX idx_gmc_policies_user_id ON gmc_policies(user_id);
CREATE INDEX idx_gmc_policies_expiry ON gmc_policies(expiry_date);
CREATE INDEX idx_commercial_policies_user_id ON commercial_policies(user_id);
CREATE INDEX idx_commercial_policies_lob ON commercial_policies(lob_type);
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_status ON claims(status);

-- ============================================
-- FUNCTIONS for auto-updating updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motor_policies_updated_at BEFORE UPDATE ON motor_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmc_policies_updated_at BEFORE UPDATE ON gmc_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commercial_policies_updated_at BEFORE UPDATE ON commercial_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- All tables, policies, and indexes created successfully!
-- You can now use the One Single View application with Supabase.
