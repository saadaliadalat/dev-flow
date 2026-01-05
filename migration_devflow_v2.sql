-- DevFlow v2 Migration: Behavior-Changing System
-- Run this in your Supabase SQL Editor

-- ============================================
-- EXTEND users TABLE
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS archetype TEXT,
ADD COLUMN IF NOT EXISTS archetype_assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Apprentice',
ADD COLUMN IF NOT EXISTS dev_flow_score INTEGER DEFAULT 50;

-- Index for archetype-specific leaderboards
CREATE INDEX IF NOT EXISTS idx_users_archetype ON users(archetype) WHERE archetype IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);
CREATE INDEX IF NOT EXISTS idx_users_dev_flow_score ON users(dev_flow_score DESC) WHERE show_on_leaderboard = true;

-- ============================================
-- TABLE: dev_flow_scores (Daily Score Snapshots)
-- ============================================

CREATE TABLE IF NOT EXISTS dev_flow_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Score Components (0-100 each, weighted)
  building_ratio_score INTEGER DEFAULT 50,    -- 30% weight
  consistency_score INTEGER DEFAULT 50,        -- 25% weight
  shipping_score INTEGER DEFAULT 50,           -- 20% weight
  focus_score INTEGER DEFAULT 50,              -- 15% weight
  recovery_score INTEGER DEFAULT 50,           -- 10% weight
  
  -- Final Computed Score
  total_score INTEGER NOT NULL DEFAULT 50,
  score_change INTEGER DEFAULT 0,  -- vs yesterday
  
  -- Anti-Gaming Flags
  gaming_detected BOOLEAN DEFAULT false,
  gaming_penalty INTEGER DEFAULT 0,
  gaming_reason TEXT,
  
  -- Comparison Data
  weekly_avg INTEGER,
  global_avg INTEGER,
  percentile INTEGER,  -- What percentile user is in
  
  -- Metadata
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON dev_flow_scores(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_scores_date ON dev_flow_scores(date DESC);

-- Enable RLS
ALTER TABLE dev_flow_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scores" ON dev_flow_scores;
CREATE POLICY "Users can view own scores" ON dev_flow_scores
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TABLE: daily_verdicts
-- ============================================

CREATE TABLE IF NOT EXISTS daily_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Verdict Content
  verdict_key TEXT NOT NULL,
  verdict_text TEXT NOT NULL,
  verdict_subtext TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('praise', 'warning', 'neutral', 'critical')),
  
  -- Context
  dev_flow_score INTEGER,
  score_change INTEGER,
  primary_factor TEXT,  -- What drove this verdict
  
  -- Sharing
  share_url TEXT,
  shared_count INTEGER DEFAULT 0,
  
  -- Metadata
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verdicts_user_date ON daily_verdicts(user_id, date DESC);

-- Enable RLS
ALTER TABLE daily_verdicts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verdicts" ON daily_verdicts;
CREATE POLICY "Users can view own verdicts" ON daily_verdicts
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TABLE: archetype_history
-- ============================================

CREATE TABLE IF NOT EXISTS archetype_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Archetype Data
  archetype TEXT NOT NULL,
  archetype_name TEXT NOT NULL,
  strengths TEXT[] NOT NULL,
  weaknesses TEXT[] NOT NULL,
  description TEXT NOT NULL,
  
  -- Trigger Metrics (what caused this assignment)
  trigger_metrics JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.85,
  
  -- Validity
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,  -- NULL = current
  superseded_by UUID REFERENCES archetype_history(id),
  
  -- Sharing
  share_url TEXT,
  shared_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_archetype_user ON archetype_history(user_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_archetype_current ON archetype_history(user_id) WHERE valid_until IS NULL;

-- Enable RLS
ALTER TABLE archetype_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own archetypes" ON archetype_history;
CREATE POLICY "Users can view own archetypes" ON archetype_history
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TABLE: user_levels
-- ============================================

CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Level Data
  level INTEGER NOT NULL,
  title TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  xp_required INTEGER NOT NULL,
  
  -- Achievement
  leveled_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trigger_action TEXT,  -- What caused level up
  
  -- Sharing
  share_url TEXT,
  shared_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_levels_user ON user_levels(user_id, leveled_up_at DESC);

-- Enable RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own levels" ON user_levels;
CREATE POLICY "Users can view own levels" ON user_levels
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TABLE: challenges (System-defined)
-- ============================================

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Challenge Info
  challenge_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Requirements
  duration_days INTEGER NOT NULL,
  target_metric TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  
  -- Reward
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  starts_on TEXT,  -- 'monday', 'any', etc.
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial challenges
INSERT INTO challenges (challenge_key, title, description, difficulty, duration_days, target_metric, target_value, badge_name, badge_icon, xp_reward) VALUES
('ship_ugly', 'Ship Something Ugly', 'Merge a PR in 7 days. Done > Perfect.', 'easy', 7, 'prs_merged', 1, 'Brave Builder', '🛠️', 200),
('no_tutorials', 'No Tutorials', 'Build without tutorials for 5 straight days.', 'medium', 5, 'building_days', 5, 'Pure Coder', '💪', 250),
('public_daily', 'Daily Public', 'One public commit every day for a week.', 'medium', 7, 'public_commits', 7, 'Open Source Hero', '🌟', 300),
('code_reviews', 'Review Master', 'Review 5 PRs this week.', 'medium', 7, 'prs_reviewed', 5, 'Team Player', '🤝', 250),
('refactor_legacy', 'Legacy Slayer', 'Refactor old code in 3 days.', 'hard', 3, 'refactor_commits', 1, 'Code Cleaner', '🧹', 350)
ON CONFLICT (challenge_key) DO NOTHING;

-- ============================================
-- TABLE: user_challenges
-- ============================================

CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Progress
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  current_progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Reward
  badge_earned BOOLEAN DEFAULT false,
  xp_awarded INTEGER DEFAULT 0,
  
  -- Sharing
  share_url TEXT,
  shared_count INTEGER DEFAULT 0,
  
  UNIQUE(user_id, challenge_id, started_at)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_active ON user_challenges(user_id) WHERE status = 'active';

-- Enable RLS
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own challenges" ON user_challenges;
CREATE POLICY "Users can view own challenges" ON user_challenges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;
CREATE POLICY "Users can update own challenges" ON user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenges" ON user_challenges;
CREATE POLICY "Users can insert own challenges" ON user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: weekly_leaderboards
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Week Info
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  leaderboard_type TEXT NOT NULL,  -- 'global', 'archetype_*', 'climbers'
  
  -- Rankings (JSONB array of user entries)
  rankings JSONB NOT NULL DEFAULT '[]',
  
  -- Computed Stats
  total_participants INTEGER DEFAULT 0,
  avg_score INTEGER,
  
  -- Metadata
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(week_start, leaderboard_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_lb_week ON weekly_leaderboards(week_start DESC, leaderboard_type);

-- ============================================
-- STREAK TYPES (extend daily_stats or add new table)
-- ============================================

ALTER TABLE daily_stats
ADD COLUMN IF NOT EXISTS is_shipping_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deep_work_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_tutorial_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS focus_hours DECIMAL(4,2) DEFAULT 0;

-- ============================================
-- FUNCTIONS: Score Calculation
-- ============================================

CREATE OR REPLACE FUNCTION calculate_dev_flow_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_building_ratio INTEGER;
  v_consistency INTEGER;
  v_shipping INTEGER;
  v_focus INTEGER;
  v_recovery INTEGER;
  v_total INTEGER;
BEGIN
  -- Placeholder: Real implementation calculates from daily_stats
  -- This returns a reasonable default for now
  v_building_ratio := 50;
  v_consistency := 50;
  v_shipping := 50;
  v_focus := 50;
  v_recovery := 50;
  
  -- Weighted sum: 30%, 25%, 20%, 15%, 10%
  v_total := (v_building_ratio * 30 + v_consistency * 25 + v_shipping * 20 + v_focus * 15 + v_recovery * 10) / 100;
  
  RETURN LEAST(100, GREATEST(0, v_total));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETE!
-- ============================================
