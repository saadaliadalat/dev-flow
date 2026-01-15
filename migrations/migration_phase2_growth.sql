-- DevFlow Phase 2: Challenges & Public Profiles Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLE: challenges
-- 1v1 developer duels and challenge tracking
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    challenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenged_id UUID REFERENCES users(id) ON DELETE SET NULL,
    challenged_email TEXT, -- For inviting non-users
    
    -- Challenge Details
    challenge_type TEXT NOT NULL DEFAULT 'commits', -- commits, streak, prs
    duration_days INTEGER NOT NULL DEFAULT 7,
    start_date DATE,
    end_date DATE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, completed, expired, declined
    
    -- Scores
    challenger_score INTEGER DEFAULT 0,
    challenged_score INTEGER DEFAULT 0,
    
    -- Winner
    winner_id UUID REFERENCES users(id),
    tie BOOLEAN DEFAULT false,
    
    -- XP rewards
    xp_reward INTEGER DEFAULT 100,
    xp_awarded BOOLEAN DEFAULT false,
    
    -- Invite
    invite_code TEXT UNIQUE,
    invite_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for challenges
CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_invite ON challenges(invite_code);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(status, end_date) WHERE status = 'active';

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own challenges" ON challenges;
CREATE POLICY "Users can view own challenges" ON challenges
    FOR SELECT USING (
        auth.uid() = challenger_id OR 
        auth.uid() = challenged_id
    );

DROP POLICY IF EXISTS "Public can view by invite code" ON challenges;
CREATE POLICY "Public can view by invite code" ON challenges
    FOR SELECT USING (invite_code IS NOT NULL);

-- ============================================
-- TABLE: public_profiles 
-- Enhanced public profile data
-- ============================================
CREATE TABLE IF NOT EXISTS public_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Profile Settings
    is_public BOOLEAN DEFAULT true,
    custom_slug TEXT UNIQUE, -- for custom URLs like devflow.io/u/customname
    
    -- Display Options
    show_streak BOOLEAN DEFAULT true,
    show_level BOOLEAN DEFAULT true,
    show_achievements BOOLEAN DEFAULT true,
    show_activity_graph BOOLEAN DEFAULT true,
    show_languages BOOLEAN DEFAULT true,
    
    -- Career
    open_to_work BOOLEAN DEFAULT false,
    open_to_freelance BOOLEAN DEFAULT false,
    preferred_contact TEXT, -- email, twitter, linkedin
    
    -- Social Links
    twitter_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    
    -- Stats Cache (updated periodically)
    cached_stats JSONB DEFAULT '{}',
    stats_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Views
    view_count INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_public_profiles_user ON public_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_public_profiles_slug ON public_profiles(custom_slug);
CREATE INDEX IF NOT EXISTS idx_public_profiles_public ON public_profiles(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public profiles are viewable by all" ON public_profiles;
CREATE POLICY "Public profiles are viewable by all" ON public_profiles
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can manage own profile" ON public_profiles;
CREATE POLICY "Users can manage own profile" ON public_profiles
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLE: weekly_leaderboard_snapshots
-- Historical weekly rankings
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Week identifier
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- Rankings (stored as JSON array)
    rankings JSONB NOT NULL, -- [{user_id, rank, commits, prs, xp, change}]
    
    -- Stats
    total_participants INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_prs INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(week_start)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_weekly_snapshots_week ON weekly_leaderboard_snapshots(week_start DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to update challenge scores
CREATE OR REPLACE FUNCTION update_challenge_scores()
RETURNS void AS $$
DECLARE
    challenge RECORD;
    challenger_commits INTEGER;
    challenged_commits INTEGER;
BEGIN
    FOR challenge IN 
        SELECT * FROM challenges 
        WHERE status = 'active' AND end_date >= CURRENT_DATE
    LOOP
        -- Get commit counts for the challenge period
        SELECT COALESCE(SUM(total_commits), 0) INTO challenger_commits
        FROM daily_stats
        WHERE user_id = challenge.challenger_id
        AND date >= challenge.start_date
        AND date <= CURRENT_DATE;
        
        SELECT COALESCE(SUM(total_commits), 0) INTO challenged_commits
        FROM daily_stats
        WHERE user_id = challenge.challenged_id
        AND date >= challenge.start_date
        AND date <= CURRENT_DATE;
        
        UPDATE challenges
        SET challenger_score = challenger_commits,
            challenged_score = challenged_commits,
            updated_at = NOW()
        WHERE id = challenge.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-generate invite code on challenge creation
CREATE OR REPLACE FUNCTION set_challenge_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_invite_code();
        NEW.invite_expires_at := NOW() + INTERVAL '7 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invite_code ON challenges;
CREATE TRIGGER trigger_set_invite_code
    BEFORE INSERT ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION set_challenge_invite_code();

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at 
    BEFORE UPDATE ON challenges
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_public_profiles_updated_at ON public_profiles;
CREATE TRIGGER update_public_profiles_updated_at 
    BEFORE UPDATE ON public_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
