-- DevFlow XP & Level System Migration
-- Run this in your Supabase SQL Editor

-- Add XP and Level columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS level_title TEXT DEFAULT 'Newcomer',
ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_freeze_last_earned DATE,
ADD COLUMN IF NOT EXISTS xp_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for leaderboards
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);

-- Create XP transactions log table for auditing
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    amount INTEGER NOT NULL,
    source TEXT NOT NULL, -- 'daily_commit', 'streak_bonus', 'pr_merged', 'week_shipped', 'challenge_won'
    description TEXT,
    
    -- Context
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user XP history
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Users can view own XP transactions" ON xp_transactions;
CREATE POLICY "Users can view own XP transactions" ON xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(total_xp INTEGER)
RETURNS TABLE(level INTEGER, title TEXT, xp_for_current INTEGER, xp_for_next INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE
            WHEN total_xp >= 500000 THEN 100
            WHEN total_xp >= 100000 THEN 50
            WHEN total_xp >= 25000 THEN 30
            WHEN total_xp >= 10000 THEN 20
            WHEN total_xp >= 2000 THEN 10
            WHEN total_xp >= 500 THEN 5
            ELSE 1
        END AS level,
        CASE
            WHEN total_xp >= 500000 THEN 'Immortal'
            WHEN total_xp >= 100000 THEN 'Legend'
            WHEN total_xp >= 25000 THEN 'Architect'
            WHEN total_xp >= 10000 THEN 'Builder'
            WHEN total_xp >= 2000 THEN 'Shipper'
            WHEN total_xp >= 500 THEN 'Contributor'
            ELSE 'Newcomer'
        END AS title,
        CASE
            WHEN total_xp >= 500000 THEN 500000
            WHEN total_xp >= 100000 THEN 100000
            WHEN total_xp >= 25000 THEN 25000
            WHEN total_xp >= 10000 THEN 10000
            WHEN total_xp >= 2000 THEN 2000
            WHEN total_xp >= 500 THEN 500
            ELSE 0
        END AS xp_for_current,
        CASE
            WHEN total_xp >= 500000 THEN 999999
            WHEN total_xp >= 100000 THEN 500000
            WHEN total_xp >= 25000 THEN 100000
            WHEN total_xp >= 10000 THEN 25000
            WHEN total_xp >= 2000 THEN 10000
            WHEN total_xp >= 500 THEN 2000
            ELSE 500
        END AS xp_for_next;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update level when XP changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
    level_info RECORD;
BEGIN
    SELECT * INTO level_info FROM calculate_level(NEW.xp);
    NEW.level := level_info.level;
    NEW.level_title := level_info.title;
    NEW.xp_last_updated := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_level ON users;
CREATE TRIGGER trigger_update_level
    BEFORE UPDATE OF xp ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
