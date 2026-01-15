-- DevFlow Phase 2: Challenges & Public Profiles Migration
-- Run this in your Supabase SQL Editor
-- 
-- NOTE: If you get errors, run each section separately:
-- 1. First run the HELPER FUNCTION section
-- 2. Then run the TABLES section  
-- 3. Then run the RLS POLICIES section
-- 4. Finally run the FUNCTIONS and TRIGGERS section

-- ============================================
-- STEP 1: HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: DROP EXISTING TABLES (if re-running)
-- ============================================
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS public_profiles CASCADE;
DROP TABLE IF EXISTS weekly_leaderboard_snapshots CASCADE;

-- ============================================
-- STEP 3: CREATE challenges TABLE
-- ============================================
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    challenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenged_id UUID REFERENCES users(id) ON DELETE SET NULL,
    challenged_email TEXT,
    
    -- Challenge Details
    challenge_type TEXT NOT NULL DEFAULT 'commits',
    duration_days INTEGER NOT NULL DEFAULT 7,
    start_date DATE,
    end_date DATE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending',
    
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

-- Indexes
CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_invite ON challenges(invite_code);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE public_profiles TABLE
-- ============================================
CREATE TABLE public_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    is_public BOOLEAN DEFAULT true,
    custom_slug TEXT UNIQUE,
    
    show_streak BOOLEAN DEFAULT true,
    show_level BOOLEAN DEFAULT true,
    show_achievements BOOLEAN DEFAULT true,
    show_activity_graph BOOLEAN DEFAULT true,
    show_languages BOOLEAN DEFAULT true,
    
    open_to_work BOOLEAN DEFAULT false,
    open_to_freelance BOOLEAN DEFAULT false,
    preferred_contact TEXT,
    
    twitter_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    
    cached_stats JSONB DEFAULT '{}',
    stats_updated_at TIMESTAMP WITH TIME ZONE,
    
    view_count INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_public_profiles_user ON public_profiles(user_id);
CREATE INDEX idx_public_profiles_slug ON public_profiles(custom_slug);

-- Enable RLS
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE weekly_leaderboard_snapshots TABLE
-- ============================================
CREATE TABLE weekly_leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    rankings JSONB NOT NULL,
    total_participants INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_prs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(week_start)
);

CREATE INDEX idx_weekly_snapshots_week ON weekly_leaderboard_snapshots(week_start DESC);

-- ============================================
-- STEP 6: RLS POLICIES
-- ============================================

-- Challenges policies
CREATE POLICY "challenges_select_own" ON challenges
    FOR SELECT USING (
        challenger_id::text = auth.uid()::text OR 
        challenged_id::text = auth.uid()::text OR
        invite_code IS NOT NULL
    );

CREATE POLICY "challenges_insert_own" ON challenges
    FOR INSERT WITH CHECK (challenger_id::text = auth.uid()::text);

CREATE POLICY "challenges_update_own" ON challenges
    FOR UPDATE USING (
        challenger_id::text = auth.uid()::text OR 
        challenged_id::text = auth.uid()::text
    );

-- Public profiles policies
CREATE POLICY "profiles_select_public" ON public_profiles
    FOR SELECT USING (is_public = true OR user_id::text = auth.uid()::text);

CREATE POLICY "profiles_manage_own" ON public_profiles
    FOR ALL USING (user_id::text = auth.uid()::text);

-- ============================================
-- STEP 7: FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

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

-- ============================================
-- STEP 8: TRIGGERS
-- ============================================

CREATE TRIGGER trigger_set_invite_code
    BEFORE INSERT ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION set_challenge_invite_code();

CREATE TRIGGER update_challenges_updated_at 
    BEFORE UPDATE ON challenges
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_profiles_updated_at 
    BEFORE UPDATE ON public_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
