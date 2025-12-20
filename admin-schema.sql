-- DevFlow Admin Panel Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- Add is_admin column to users table
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Index for admin users
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin) WHERE is_admin = true;

-- ============================================
-- TABLE: admin_settings
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO admin_settings (key, value, category, description) VALUES
  ('maintenance_mode', 'false', 'system', 'Enable maintenance mode'),
  ('allow_signups', 'true', 'auth', 'Allow new user registrations'),
  ('max_sync_frequency', '"hourly"', 'sync', 'Minimum time between syncs'),
  ('ai_insights_enabled', 'true', 'features', 'Enable AI insights generation'),
  ('leaderboard_enabled', 'true', 'features', 'Show public leaderboard')
ON CONFLICT (key) DO NOTHING;

-- RLS for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;
CREATE POLICY "Admins can manage settings" ON admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- TABLE: announcements
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, warning, success, error
  is_active BOOLEAN DEFAULT true,
  show_on_dashboard BOOLEAN DEFAULT true,
  show_on_landing BOOLEAN DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, starts_at, ends_at);

-- RLS for announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW()));

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- TABLE: admin_logs (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  admin_username TEXT,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'setting', 'announcement', 'system'
  target_id UUID,
  target_name TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);

-- RLS for admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view logs" ON admin_logs;
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "System can insert logs" ON admin_logs;
CREATE POLICY "System can insert logs" ON admin_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- TABLE: system_metrics
-- ============================================
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'dau', 'mau', 'signups', 'syncs', 'api_calls', 'errors'
  value INTEGER NOT NULL,
  date DATE NOT NULL,
  hour INTEGER, -- Optional: for hourly metrics
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_type, date, hour)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_type_date ON system_metrics(metric_type, date DESC);

-- RLS for system_metrics
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view metrics" ON system_metrics;
CREATE POLICY "Admins can view metrics" ON system_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "System can insert metrics" ON system_metrics;
CREATE POLICY "System can insert metrics" ON system_metrics
  FOR INSERT WITH CHECK (true);

-- ============================================
-- TABLE: feature_flags
-- ============================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Insert default feature flags
INSERT INTO feature_flags (name, description, is_enabled) VALUES
  ('dark_mode', 'Enable dark mode toggle', true),
  ('ai_insights', 'Enable AI-powered insights', true),
  ('team_features', 'Enable team collaboration', false),
  ('export_data', 'Allow data export to CSV/PDF', true),
  ('github_actions', 'Track GitHub Actions workflows', false),
  ('notifications', 'Enable push notifications', false),
  ('advanced_analytics', 'Show advanced analytics', true)
ON CONFLICT (name) DO NOTHING;

-- RLS for feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read flags" ON feature_flags;
CREATE POLICY "Anyone can read flags" ON feature_flags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage flags" ON feature_flags;
CREATE POLICY "Admins can manage flags" ON feature_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL),
    'active_users', (SELECT COUNT(*) FROM users WHERE last_synced > NOW() - INTERVAL '7 days'),
    'suspended_users', (SELECT COUNT(*) FROM users WHERE is_suspended = true),
    'total_commits', (SELECT COALESCE(SUM(total_commits), 0) FROM users),
    'total_prs', (SELECT COALESCE(SUM(total_prs), 0) FROM users),
    'signups_today', (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE),
    'signups_week', (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'),
    'signups_month', (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- IMPORTANT: Set yourself as admin!
-- ============================================
-- Replace 'your-github-username' with your actual GitHub username
-- UPDATE users SET is_admin = true WHERE username = 'your-github-username';

-- ============================================
-- COMPLETE!
-- ============================================
