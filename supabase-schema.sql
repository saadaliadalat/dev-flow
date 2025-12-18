-- DevFlow Database Schema
-- PostgreSQL 15 (Supabase)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  
  -- Profile Info
  bio TEXT,
  location TEXT,
  company TEXT,
  website TEXT,
  twitter_username TEXT,
  
  -- GitHub Stats
  public_repos INTEGER DEFAULT 0,
  private_repos INTEGER DEFAULT 0,
  total_repos INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  
  -- Account Status
  is_premium BOOLEAN DEFAULT false,
  is_team_member BOOLEAN DEFAULT false,
  team_id UUID,
  
  -- Privacy Settings
  profile_public BOOLEAN DEFAULT false,
  show_on_leaderboard BOOLEAN DEFAULT true,
  allow_comparisons BOOLEAN DEFAULT true,
  
  -- Sync Status
  last_synced TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'daily',
  auto_sync BOOLEAN DEFAULT true,
  
  -- Access Tokens (ENCRYPTED)
  github_access_token TEXT,
  github_refresh_token TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Computed Fields
  total_commits INTEGER DEFAULT 0,
  total_prs INTEGER DEFAULT 0,
  total_issues INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  
  -- AI Profile
  developer_dna JSONB DEFAULT '{}',
  skill_tags TEXT[] DEFAULT '{}',
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_leaderboard ON users(productivity_score DESC) WHERE show_on_leaderboard = true;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles viewable by all" ON users;
CREATE POLICY "Public profiles viewable by all" ON users
  FOR SELECT USING (profile_public = true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TABLE 2: daily_stats
-- ============================================
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  
  -- Commit Stats
  total_commits INTEGER DEFAULT 0,
  commits_by_hour JSONB DEFAULT '{}',
  active_hours INTEGER DEFAULT 0,
  
  -- Pull Request Stats
  prs_opened INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  prs_closed INTEGER DEFAULT 0,
  prs_reviewed INTEGER DEFAULT 0,
  avg_pr_merge_time INTEGER DEFAULT 0,
  
  -- Issue Stats
  issues_opened INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  issues_commented INTEGER DEFAULT 0,
  
  -- Code Volume
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  net_lines INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  
  -- Repository Activity
  repos_contributed JSONB DEFAULT '[]',
  unique_repos INTEGER DEFAULT 0,
  
  -- Language Breakdown
  languages JSONB DEFAULT '{}',
  primary_language TEXT,
  
  -- Collaboration
  collaborators_interacted INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  code_reviews_given INTEGER DEFAULT 0,
  
  -- Time Analysis
  first_commit_time TIME,
  last_commit_time TIME,
  coding_duration_minutes INTEGER DEFAULT 0,
  
  -- Quality Metrics
  commit_message_quality_score DECIMAL(3,2) DEFAULT 0.00,
  avg_commit_size INTEGER DEFAULT 0,
  
  -- Productivity Score
  productivity_score INTEGER DEFAULT 0,
  
  -- Flags
  is_weekend BOOLEAN DEFAULT false,
  is_holiday BOOLEAN DEFAULT false,
  is_rest_day BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Add foreign key after users table exists
ALTER TABLE daily_stats 
  DROP CONSTRAINT IF EXISTS daily_stats_user_id_fkey,
  ADD CONSTRAINT daily_stats_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes for daily_stats
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_score ON daily_stats(productivity_score DESC);

-- Enable RLS
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own stats" ON daily_stats;
CREATE POLICY "Users can view own stats" ON daily_stats
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users WHERE id = daily_stats.user_id AND profile_public = true)
  );

-- ============================================
-- TABLE 3: repositories
-- ============================================
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- GitHub Info
  github_repo_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  homepage TEXT,
  
  -- Metrics
  language TEXT,
  languages JSONB DEFAULT '{}',
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  
  -- User Activity
  user_commits INTEGER DEFAULT 0,
  user_prs INTEGER DEFAULT 0,
  user_issues INTEGER DEFAULT 0,
  last_commit_date TIMESTAMP WITH TIME ZONE,
  first_commit_date TIMESTAMP WITH TIME ZONE,
  
  -- Repo Status
  is_fork BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_tracked BOOLEAN DEFAULT true,
  
  -- Collaboration
  contributors_count INTEGER DEFAULT 0,
  collaborators JSONB DEFAULT '[]',
  
  -- Metadata
  github_created_at TIMESTAMP WITH TIME ZONE,
  github_updated_at TIMESTAMP WITH TIME ZONE,
  github_pushed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key
ALTER TABLE repositories 
  DROP CONSTRAINT IF EXISTS repositories_user_id_fkey,
  ADD CONSTRAINT repositories_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_repositories_user ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_repositories_github_id ON repositories(github_repo_id);
CREATE INDEX IF NOT EXISTS idx_repositories_tracked ON repositories(user_id, is_tracked);

-- Enable RLS
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own repos" ON repositories;
CREATE POLICY "Users can view own repos" ON repositories
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TABLE 4: achievements
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Achievement Info
  achievement_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL,
  icon TEXT NOT NULL,
  
  -- Progress
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  
  -- Metadata
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Sharing
  shared_count INTEGER DEFAULT 0,
  
  UNIQUE(user_id, achievement_key)
);

-- Add foreign key
ALTER TABLE achievements 
  DROP CONSTRAINT IF EXISTS achievements_user_id_fkey,
  ADD CONSTRAINT achievements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON achievements(user_id, unlocked_at DESC) WHERE is_unlocked = true;
CREATE INDEX IF NOT EXISTS idx_achievements_progress ON achievements(user_id, is_unlocked, current_progress);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TABLE 5: insights
-- ============================================
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Insight Info
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  
  -- AI Context
  generated_by TEXT DEFAULT 'gpt-4',
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  based_on_data JSONB DEFAULT '{}',
  
  -- Actions
  action_items JSONB DEFAULT '[]',
  is_actionable BOOLEAN DEFAULT false,
  
  -- User Interaction
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  is_helpful BOOLEAN,
  user_feedback TEXT,
  
  -- Metadata
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key
ALTER TABLE insights 
  DROP CONSTRAINT IF EXISTS insights_user_id_fkey,
  ADD CONSTRAINT insights_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_unread ON insights(user_id) WHERE is_read = false AND is_dismissed = false;

-- Enable RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own insights" ON insights;
CREATE POLICY "Users can view own insights" ON insights
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TABLE 6: teams
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  -- Owner
  owner_id UUID NOT NULL,
  
  -- Settings
  is_public BOOLEAN DEFAULT false,
  allow_join_requests BOOLEAN DEFAULT true,
  
  -- Stats
  member_count INTEGER DEFAULT 0,
  total_commits INTEGER DEFAULT 0,
  total_prs INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key
ALTER TABLE teams 
  DROP CONSTRAINT IF EXISTS teams_owner_id_fkey,
  ADD CONSTRAINT teams_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES users(id);

-- Now add the team_id foreign key to users
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_team_id_fkey,
  ADD CONSTRAINT users_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Team members can view team" ON teams;
CREATE POLICY "Team members can view team" ON teams
  FOR SELECT USING (
    is_public = true OR
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM users WHERE users.team_id = teams.id AND users.id = auth.uid())
  );

-- ============================================
-- TABLE 7: social_connections
-- ============================================
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connected_user_id UUID NOT NULL,
  
  -- Connection Type
  connection_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

-- Add foreign keys
ALTER TABLE social_connections 
  DROP CONSTRAINT IF EXISTS social_connections_user_id_fkey,
  ADD CONSTRAINT social_connections_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE social_connections 
  DROP CONSTRAINT IF EXISTS social_connections_connected_user_id_fkey,
  ADD CONSTRAINT social_connections_connected_user_id_fkey 
  FOREIGN KEY (connected_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connections_user ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_accepted ON social_connections(user_id, accepted_at) WHERE status = 'accepted';

-- Enable RLS
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own connections" ON social_connections;
CREATE POLICY "Users can view own connections" ON social_connections
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- ============================================
-- TABLE 8: leaderboards
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Leaderboard Type
  leaderboard_type TEXT NOT NULL,
  scope TEXT,
  time_period TEXT NOT NULL,
  
  -- Rankings
  rankings JSONB NOT NULL,
  
  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(leaderboard_type, scope, time_period)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_period ON leaderboards(leaderboard_type, time_period);

-- ============================================
-- TABLE 9: sharing_cards
-- ============================================
CREATE TABLE IF NOT EXISTS sharing_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Card Type
  card_type TEXT NOT NULL,
  card_data JSONB NOT NULL,
  
  -- Generated Image
  image_url TEXT,
  share_url TEXT UNIQUE,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key
ALTER TABLE sharing_cards 
  DROP CONSTRAINT IF EXISTS sharing_cards_user_id_fkey,
  ADD CONSTRAINT sharing_cards_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sharing_cards_user ON sharing_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_cards_url ON sharing_cards(share_url);

-- ============================================
-- TABLE 10: burnout_predictions
-- ============================================
CREATE TABLE IF NOT EXISTS burnout_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Prediction
  burnout_risk_score DECIMAL(3,2) NOT NULL,
  risk_level TEXT NOT NULL,
  
  -- Contributing Factors
  factors JSONB NOT NULL,
  
  -- Recommendations
  recommendations JSONB NOT NULL,
  
  -- Model Info
  model_version TEXT DEFAULT 'v1.0',
  confidence DECIMAL(3,2),
  
  -- Metadata
  predicted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key
ALTER TABLE burnout_predictions 
  DROP CONSTRAINT IF EXISTS burnout_predictions_user_id_fkey,
  ADD CONSTRAINT burnout_predictions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_burnout_user_latest ON burnout_predictions(user_id, predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_burnout_high_risk ON burnout_predictions(user_id) WHERE risk_level IN ('high', 'critical');

-- Enable RLS
ALTER TABLE burnout_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own predictions" ON burnout_predictions;
CREATE POLICY "Users can view own predictions" ON burnout_predictions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON daily_stats;
CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_repositories_updated_at ON repositories;
CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETE!
-- ============================================
-- All tables, indexes, RLS policies, and triggers have been created.
-- Next steps:
-- 1. Set up authentication in Supabase dashboard
-- 2. Configure GitHub OAuth app
-- 3. Add environment variables to your .env file
-- 4. Start building the API routes!
