-- DevFlow Database Migration
-- Run these in Supabase SQL Editor to add new contribution tracking columns

-- Add new contribution tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_contributions INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_prs INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_issues INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_repos INTEGER DEFAULT 0;

-- Update RLS policies for leaderboard
DROP POLICY IF EXISTS "Leaderboard users viewable" ON users;
CREATE POLICY "Leaderboard users viewable" ON users
  FOR SELECT USING (
    show_on_leaderboard = true OR
    auth.uid()::text = id::text
  );

-- Add index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_productivity_score ON users(productivity_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_total_commits ON users(total_commits DESC);

-- Ensure show_on_leaderboard defaults to true for visibility
ALTER TABLE users ALTER COLUMN show_on_leaderboard SET DEFAULT true;

-- Update existing users to show on leaderboard if not set
UPDATE users SET show_on_leaderboard = true WHERE show_on_leaderboard IS NULL;

COMMENT ON COLUMN users.total_contributions IS 'Total contributions (commits + PRs + issues + reviews) this year';
COMMENT ON COLUMN users.total_prs IS 'Total pull requests opened this year';
COMMENT ON COLUMN users.total_issues IS 'Total issues opened this year';
COMMENT ON COLUMN users.total_reviews IS 'Total code reviews this year';
