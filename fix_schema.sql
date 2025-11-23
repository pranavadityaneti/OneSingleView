-- Fix Schema: Create missing tables for Settings and Banners

-- 1. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view settings
CREATE POLICY "Authenticated users can view app_settings"
  ON app_settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can modify settings
CREATE POLICY "Only admins can modify app_settings"
  ON app_settings FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Insert default settings if not exist
INSERT INTO app_settings (key, value, description) VALUES
  ('expiry_threshold_days', '30'::jsonb, 'Number of days before expiry to show alert'),
  ('client_logos', '[]'::jsonb, 'List of client logos to display'),
  ('ad_banners', '[]'::jsonb, 'List of ad banners')
ON CONFLICT (key) DO NOTHING;


-- 2. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view active banners
CREATE POLICY "Authenticated users can view banners"
  ON banners FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can modify banners
CREATE POLICY "Only admins can modify banners"
  ON banners FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Trigger to update updated_at
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
