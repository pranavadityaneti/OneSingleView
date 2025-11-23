-- Migration: Admin Dashboard Expansion (Phase 1)
-- Description: Adds tables for Garages, Banners, App Settings, Audit Logs, and RM Profiles.

-- 1. Garages Table
CREATE TABLE IF NOT EXISTS garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    insurer_name TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT,
    address TEXT,
    contact_number TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Banners Table (for Dashboard Ads)
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    active_from TIMESTAMPTZ DEFAULT NOW(),
    active_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. App Settings Table (Key-Value Store)
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- e.g., 'POLICY_CREATED', 'USER_DISABLED'
    entity_type TEXT NOT NULL, -- e.g., 'motor_policy', 'user'
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RM Profiles Table (Extension of Users table for RMs)
CREATE TABLE IF NOT EXISTS rm_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    employee_id TEXT,
    department TEXT,
    leads_assigned INTEGER DEFAULT 0,
    leads_closed INTEGER DEFAULT 0,
    claims_handled INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Garages: Public read, Admin write
CREATE POLICY "Garages are viewable by everyone" ON garages FOR SELECT USING (true);
CREATE POLICY "Admins can insert garages" ON garages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update garages" ON garages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete garages" ON garages FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Banners: Public read, Admin write
CREATE POLICY "Banners are viewable by everyone" ON banners FOR SELECT USING (true);
CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- App Settings: Authenticated read, Admin write
CREATE POLICY "Settings viewable by authenticated users" ON app_settings FOR SELECT USING (
    auth.role() = 'authenticated'
);
CREATE POLICY "Admins can manage settings" ON app_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Audit Logs: Admin read only (Users can't see logs)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- RM Profiles: Public read (for assigning), Admin write
CREATE POLICY "RM profiles viewable by authenticated users" ON rm_profiles FOR SELECT USING (
    auth.role() = 'authenticated'
);
CREATE POLICY "Admins can manage RM profiles" ON rm_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert Default Settings
INSERT INTO app_settings (key, value, description) VALUES
('expiry_threshold_days', '20', 'Number of days before expiry to show alert'),
('max_file_size_mb', '5', 'Maximum allowed file size for uploads in MB'),
('allowed_file_types', '["pdf", "jpg", "jpeg", "png"]', 'Allowed file extensions')
ON CONFLICT (key) DO NOTHING;
