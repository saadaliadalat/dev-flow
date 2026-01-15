-- DevFlow Phase 3: Seasons & Pro Tiers Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLE: seasons
-- Competitive seasons with leaderboards and rewards
-- ============================================
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Season Info
    name TEXT NOT NULL, -- e.g., "Winter 2026"
    slug TEXT UNIQUE NOT NULL, -- e.g., "winter-2026"
    season_number INTEGER NOT NULL,
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, active, completed
    
    -- Theme
    theme_color TEXT DEFAULT '#8b5cf6',
    badge_icon TEXT DEFAULT '🏆',
    
    -- Rewards
    rewards JSONB DEFAULT '[]', -- [{rank: 1-3, title: "Champion", xp_bonus: 1000, badge: "🥇"}]
    
    -- Stats (updated at end of season)
    total_participants INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_xp_earned INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: season_rankings
-- Per-user rankings for each season
-- ============================================
CREATE TABLE IF NOT EXISTS season_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Performance
    commits INTEGER DEFAULT 0,
    prs_merged INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    days_active INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Ranking
    rank INTEGER,
    previous_rank INTEGER, -- For tracking movement
    rank_change INTEGER GENERATED ALWAYS AS (COALESCE(previous_rank, 0) - COALESCE(rank, 0)) STORED,
    
    -- Rewards claimed
    reward_tier TEXT, -- gold, silver, bronze, participant
    xp_bonus_claimed INTEGER DEFAULT 0,
    
    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(season_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_season_rankings_season ON season_rankings(season_id);
CREATE INDEX IF NOT EXISTS idx_season_rankings_user ON season_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_season_rankings_rank ON season_rankings(season_id, rank);

-- ============================================
-- TABLE: user_subscriptions
-- Pro tier subscription tracking
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription Info
    tier TEXT NOT NULL DEFAULT 'free', -- free, pro, team
    status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired, past_due
    
    -- Billing
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    lemon_squeezy_customer_id TEXT,
    lemon_squeezy_subscription_id TEXT,
    
    -- Dates
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage Limits
    ai_coach_queries_used INTEGER DEFAULT 0,
    ai_coach_queries_limit INTEGER DEFAULT 5, -- Pro gets unlimited (NULL)
    proof_cards_generated INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON user_subscriptions(tier);

-- Enable RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seasons (public read)
DROP POLICY IF EXISTS "Seasons are viewable by all" ON seasons;
CREATE POLICY "Seasons are viewable by all" ON seasons FOR SELECT USING (true);

-- RLS Policies for season_rankings
DROP POLICY IF EXISTS "Rankings are viewable by all" ON season_rankings;
CREATE POLICY "Rankings are viewable by all" ON season_rankings FOR SELECT USING (true);

-- RLS Policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get current active season
CREATE OR REPLACE FUNCTION get_current_season()
RETURNS TABLE(
    id UUID,
    name TEXT,
    slug TEXT,
    season_number INTEGER,
    start_date DATE,
    end_date DATE,
    days_remaining INTEGER,
    theme_color TEXT,
    badge_icon TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.slug,
        s.season_number,
        s.start_date,
        s.end_date,
        (s.end_date - CURRENT_DATE)::INTEGER as days_remaining,
        s.theme_color,
        s.badge_icon
    FROM seasons s
    WHERE s.status = 'active'
    AND CURRENT_DATE BETWEEN s.start_date AND s.end_date
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update season rankings
CREATE OR REPLACE FUNCTION update_season_rankings(p_season_id UUID)
RETURNS void AS $$
BEGIN
    -- Update commit counts from daily_stats
    UPDATE season_rankings sr
    SET 
        commits = (
            SELECT COALESCE(SUM(ds.total_commits), 0)
            FROM daily_stats ds
            JOIN seasons s ON s.id = p_season_id
            WHERE ds.user_id = sr.user_id
            AND ds.date >= s.start_date
            AND ds.date <= LEAST(s.end_date, CURRENT_DATE)
        ),
        updated_at = NOW()
    WHERE sr.season_id = p_season_id;
    
    -- Update ranks
    WITH ranked AS (
        SELECT 
            id,
            rank,
            ROW_NUMBER() OVER (ORDER BY commits DESC, xp_earned DESC) as new_rank
        FROM season_rankings
        WHERE season_id = p_season_id
    )
    UPDATE season_rankings sr
    SET 
        previous_rank = sr.rank,
        rank = r.new_rank
    FROM ranked r
    WHERE sr.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INSERT INITIAL SEASON
-- ============================================
INSERT INTO seasons (name, slug, season_number, start_date, end_date, status, theme_color, badge_icon, rewards)
VALUES (
    'Winter 2026',
    'winter-2026',
    1,
    '2026-01-01',
    '2026-03-31',
    'active',
    '#8b5cf6',
    '❄️',
    '[
        {"rank": 1, "title": "Season Champion", "xp_bonus": 5000, "badge": "🥇"},
        {"rank": 2, "title": "Runner Up", "xp_bonus": 2500, "badge": "🥈"},
        {"rank": 3, "title": "Third Place", "xp_bonus": 1000, "badge": "🥉"},
        {"rank_range": [4, 10], "title": "Top 10", "xp_bonus": 500, "badge": "⭐"},
        {"rank_range": [11, 50], "title": "Top 50", "xp_bonus": 100, "badge": "✨"}
    ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
