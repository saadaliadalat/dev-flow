-- Migration: Add Gamification Columns
-- Run this in your Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Index for leaderboard
CREATE INDEX IF NOT EXISTS idx_users_streak_count ON users(streak_count DESC);
