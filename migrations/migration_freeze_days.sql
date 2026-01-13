-- DevFlow Freeze Days Migration
-- Allows users to protect their streaks during breaks

-- Add freeze_days columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS freeze_days INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS freeze_days_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_freeze_earned_at TIMESTAMPTZ;

-- Trigger to award freeze days on 7-day streak completion
-- This should be called from the application layer for now

-- Create a freeze_day_events table to track usage
CREATE TABLE IF NOT EXISTS freeze_day_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL, -- 'earned' or 'used'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    streak_at_event INTEGER,
    notes TEXT
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_freeze_events_user ON freeze_day_events(user_id);

COMMENT ON COLUMN users.freeze_days IS 'Number of freeze days available (max 3)';
COMMENT ON COLUMN users.freeze_days_used IS 'Total freeze days used historically';
COMMENT ON COLUMN users.last_freeze_earned_at IS 'When the last freeze day was earned (prevents double-earning)';
