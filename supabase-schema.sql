-- DevFlow Database Schema for Supabase
-- Run this SQL in your Supabase project SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  company TEXT,
  website TEXT,
  twitter_username TEXT,
  public_repos INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- TABLE: daily_stats
-- ============================================
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_commits INTEGER DEFAULT 0,
  prs_opened INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  prs_closed INTEGER DEFAULT 0,
  issues_opened INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  code_reviews INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  active_hours JSONB DEFAULT '[]',
  top_languages JSONB DEFAULT '[]',
  repos_contributed JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- Enable Row Level Security
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own stats" ON daily_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TABLE: repositories
-- ============================================
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  is_fork BOOLEAN DEFAULT false,
  commit_count INTEGER DEFAULT 0,
  last_commit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_repositories_user ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_repositories_github_id ON repositories(github_repo_id);
CREATE INDEX IF NOT EXISTS idx_repositories_language ON repositories(language);

-- Enable Row Level Security
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own repos" ON repositories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repos" ON repositories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repos" ON repositories
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TABLE: achievements
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_type)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON achievements(unlocked_at DESC);

-- Enable Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: commit_activity
-- ============================================
CREATE TABLE IF NOT EXISTS commit_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  commit_message TEXT,
  commit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, commit_sha)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_commit_activity_user ON commit_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_commit_activity_date ON commit_activity(commit_date DESC);
CREATE INDEX IF NOT EXISTS idx_commit_activity_repo ON commit_activity(repo_id);

-- Enable Row Level Security
ALTER TABLE commit_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own commits" ON commit_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commits" ON commit_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for repositories table
CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View: Weekly stats summary
CREATE OR REPLACE VIEW weekly_stats AS
SELECT
  user_id,
  DATE_TRUNC('week', date) as week_start,
  SUM(total_commits) as total_commits,
  SUM(prs_opened) as prs_opened,
  SUM(prs_merged) as prs_merged,
  SUM(issues_closed) as issues_closed,
  SUM(code_reviews) as code_reviews,
  SUM(lines_added) as lines_added,
  SUM(lines_deleted) as lines_deleted,
  AVG(productivity_score) as avg_productivity_score,
  COUNT(*) as active_days
FROM daily_stats
GROUP BY user_id, DATE_TRUNC('week', date);

-- View: Monthly stats summary
CREATE OR REPLACE VIEW monthly_stats AS
SELECT
  user_id,
  DATE_TRUNC('month', date) as month_start,
  SUM(total_commits) as total_commits,
  SUM(prs_opened) as prs_opened,
  SUM(prs_merged) as prs_merged,
  SUM(issues_closed) as issues_closed,
  SUM(code_reviews) as code_reviews,
  SUM(lines_added) as lines_added,
  SUM(lines_deleted) as lines_deleted,
  AVG(productivity_score) as avg_productivity_score,
  COUNT(*) as active_days
FROM daily_stats
GROUP BY user_id, DATE_TRUNC('month', date);

-- ============================================
-- SAMPLE DATA (FOR TESTING - REMOVE IN PRODUCTION)
-- ============================================

-- Uncomment to add sample achievements types
-- INSERT INTO achievements (user_id, achievement_type, title, description, icon) VALUES
-- (auth.uid(), 'streak_7', '7 Day Streak', 'Committed code for 7 days straight', '🔥'),
-- (auth.uid(), 'streak_30', 'Monthly Warrior', '30 day coding streak', '⚡'),
-- (auth.uid(), 'night_owl', 'Night Owl', '50 commits after midnight', '🦉');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores GitHub user profile information';
COMMENT ON TABLE daily_stats IS 'Daily aggregated statistics for each user';
COMMENT ON TABLE repositories IS 'User repositories tracked by DevFlow';
COMMENT ON TABLE achievements IS 'User achievements and badges';
COMMENT ON TABLE commit_activity IS 'Individual commit records for detailed analysis';
