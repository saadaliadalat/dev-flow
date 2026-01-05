/**
 * DevFlow - Core Type Definitions
 * Centralized TypeScript interfaces for all data models
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
    id: string
    github_id: string
    username: string
    email?: string | null
    name?: string | null
    avatar_url?: string | null
    bio?: string | null
    location?: string | null
    company?: string | null
    website?: string | null
    twitter_username?: string | null
    public_repos: number
    private_repos: number
    total_repos: number
    followers: number
    following: number
    is_premium: boolean
    is_team_member: boolean
    team_id?: string | null
    profile_public: boolean
    show_on_leaderboard: boolean
    allow_comparisons: boolean
    last_synced?: string | null
    sync_frequency: string
    auto_sync: boolean
    total_commits: number
    total_prs: number
    total_issues: number
    total_reviews?: number
    total_contributions?: number
    current_streak: number
    longest_streak: number
    productivity_score: number
    developer_dna?: DeveloperDNA | null
    skill_tags: string[]
    created_at: string
    updated_at: string
}

export interface DeveloperDNA {
    consistency: number
    intensity: number
    variety: number
    collaboration: number
    nightOwl: number
}

// ============================================
// DAILY STATS TYPES
// ============================================

export interface DailyStats {
    id: string
    user_id: string
    date: string
    total_commits: number
    commits_by_hour: Record<string, number>
    active_hours: number
    prs_opened: number
    prs_merged: number
    prs_closed: number
    prs_reviewed: number
    avg_pr_merge_time: number
    issues_opened: number
    issues_closed: number
    issues_commented: number
    lines_added: number
    lines_deleted: number
    net_lines: number
    files_changed: number
    repos_contributed: RepoContribution[]
    unique_repos: number
    languages: Record<string, number>
    primary_language?: string | null
    collaborators_interacted: number
    comments_made: number
    code_reviews_given: number
    first_commit_time?: string | null
    last_commit_time?: string | null
    coding_duration_minutes: number
    commit_message_quality_score: number
    avg_commit_size: number
    productivity_score: number
    is_weekend: boolean
    is_holiday: boolean
    is_rest_day: boolean
    created_at: string
    updated_at: string
}

export interface RepoContribution {
    name: string
    commits: number
}

// ============================================
// REPOSITORY TYPES
// ============================================

export interface Repository {
    id: string
    user_id: string
    github_repo_id: number
    name: string
    full_name: string
    description?: string | null
    homepage?: string | null
    language?: string | null
    languages: Record<string, number>
    stars: number
    forks: number
    watchers: number
    open_issues: number
    user_commits: number
    user_prs: number
    user_issues: number
    last_commit_date?: string | null
    first_commit_date?: string | null
    is_fork: boolean
    is_private: boolean
    is_archived: boolean
    is_tracked: boolean
    contributors_count: number
    github_created_at?: string | null
    github_updated_at?: string | null
    github_pushed_at?: string | null
    created_at: string
    updated_at: string
}

// ============================================
// ACHIEVEMENT TYPES
// ============================================

export interface Achievement {
    id: string
    user_id: string
    achievement_key: string
    title: string
    description: string
    category: AchievementCategory
    tier: AchievementTier
    icon: string
    current_progress: number
    target_progress: number
    is_unlocked: boolean
    unlocked_at?: string | null
    created_at: string
    shared_count: number
}

export type AchievementCategory =
    | 'commits'
    | 'streaks'
    | 'prs'
    | 'reviews'
    | 'social'
    | 'special'

export type AchievementTier =
    | 'bronze'
    | 'silver'
    | 'gold'
    | 'platinum'
    | 'diamond'

// ============================================
// INSIGHT TYPES
// ============================================

export interface Insight {
    id: string
    user_id: string
    insight_type: InsightType
    title: string
    message: string
    severity: InsightSeverity
    generated_by: string
    confidence_score: number
    based_on_data: Record<string, unknown>
    action_items: ActionItem[]
    is_actionable: boolean
    is_read: boolean
    is_dismissed: boolean
    is_helpful?: boolean | null
    user_feedback?: string | null
    valid_until?: string | null
    created_at: string
    read_at?: string | null
    dismissed_at?: string | null
}

export type InsightType =
    | 'productivity'
    | 'burnout'
    | 'achievement'
    | 'trend'
    | 'recommendation'

export type InsightSeverity =
    | 'info'
    | 'success'
    | 'warning'
    | 'critical'

export interface ActionItem {
    id: string
    text: string
    completed: boolean
}

// ============================================
// BURNOUT PREDICTION TYPES
// ============================================

export interface BurnoutPrediction {
    id: string
    user_id: string
    burnout_risk_score: number
    risk_level: RiskLevel
    factors: BurnoutFactor[]
    recommendations: string[]
    model_version: string
    confidence: number
    predicted_at: string
    acknowledged: boolean
    acknowledged_at?: string | null
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface BurnoutFactor {
    name: string
    weight: number
    score: number
    description: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface ApiError {
    error: string
    message?: string
    details?: string
    status: number
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface NavLinkProps {
    href: string
    children: React.ReactNode
    isActive?: boolean
    onClick?: () => void
}

export interface MobileNavLinkProps {
    href: string
    children: React.ReactNode
    onClick?: () => void
}

export interface ChartDataPoint {
    name: string
    date: string
    commits: number
}

export interface StatCardProps {
    label: string
    value: number | string
    icon: React.ComponentType<{ size?: number; className?: string }>
    trend?: number
    color?: 'purple' | 'cyan' | 'green' | 'orange' | 'yellow'
}

// ============================================
// SESSION TYPES (NextAuth Extension)
// ============================================

export interface ExtendedUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string
    githubId?: string
}

export interface ExtendedSession {
    user: ExtendedUser
    expires: string
}

// ============================================
// GITHUB ACTIVITY TYPES
// ============================================

export interface GitHubEvent {
    id: string
    type: GitHubEventType
    title: string
    repo: string
    created_at: string
    url?: string
}

export type GitHubEventType =
    | 'PushEvent'
    | 'PullRequestEvent'
    | 'IssuesEvent'
    | 'CreateEvent'
    | 'DeleteEvent'
    | 'ForkEvent'
    | 'WatchEvent'
    | 'PullRequestReviewEvent'
    | 'IssueCommentEvent'

// ============================================
// SHARING TYPES
// ============================================

export interface SharingCard {
    id: string
    user_id: string
    card_type: CardType
    card_data: YearReviewData | AchievementCardData
    image_url?: string | null
    share_url?: string | null
    view_count: number
    share_count: number
    created_at: string
    expires_at?: string | null
}

export type CardType = 'year-review' | 'achievement' | 'stats'

export interface YearReviewData {
    totalCommits: number
    totalPRs: number
    totalIssues: number
    longestStreak: number
    topLanguages: LanguageStat[]
    busiestMonth: string
    busiestDay: string
    lateNightCommits: number
    uniqueRepos: number
    mostProductiveHour: number
    developerDNA: DeveloperDNA
}

export interface LanguageStat {
    name: string
    percentage: number
    color: string
}

export interface AchievementCardData {
    achievement: Achievement
    unlockedAt: string
}

// ============================================
// DEV FLOW V2: BEHAVIOR-CHANGING SYSTEM
// ============================================

// Dev Flow Score (0-100)
export interface DevFlowScore {
    id: string
    user_id: string
    date: string

    // Component Scores (0-100 each)
    building_ratio_score: number   // 30% weight
    consistency_score: number      // 25% weight
    shipping_score: number         // 20% weight
    focus_score: number            // 15% weight
    recovery_score: number         // 10% weight

    // Final Score
    total_score: number
    score_change: number           // vs yesterday

    // Anti-Gaming
    gaming_detected: boolean
    gaming_penalty: number
    gaming_reason?: string | null

    // Comparisons
    weekly_avg?: number | null
    global_avg?: number | null
    percentile?: number | null

    computed_at: string
}

// Verdict Severity
export type VerdictSeverity = 'praise' | 'warning' | 'neutral' | 'critical'

// Daily Verdict
export interface DailyVerdict {
    id: string
    user_id: string
    date: string

    verdict_key: string
    verdict_text: string
    verdict_subtext?: string | null
    severity: VerdictSeverity

    dev_flow_score?: number | null
    score_change?: number | null
    primary_factor?: string | null

    share_url?: string | null
    shared_count: number

    computed_at: string
}

// Developer Archetypes
export type ArchetypeKey =
    | 'tutorial_addict'
    | 'chaos_coder'
    | 'burnout_sprinter'
    | 'silent_builder'
    | 'momentum_machine'
    | 'consistent_operator'
    | 'overnight_architect'
    | 'weekend_warrior'

export interface Archetype {
    id: string
    user_id: string

    archetype: ArchetypeKey
    archetype_name: string
    strengths: string[]
    weaknesses: string[]
    description: string

    trigger_metrics: Record<string, number>
    confidence_score: number

    assigned_at: string
    valid_until?: string | null
    superseded_by?: string | null

    share_url?: string | null
    shared_count: number
}

// Archetype Definitions (static data)
export interface ArchetypeDefinition {
    key: ArchetypeKey
    name: string
    emoji: string
    description: string
    strengths: string[]
    weaknesses: string[]
    color: string
    triggerConditions: string
}

// Level/Title System
export type LevelTitle =
    | 'Apprentice'
    | 'Contributor'
    | 'Builder'
    | 'Operator'
    | 'Architect'
    | 'Machine'

export interface UserLevel {
    level: number
    title: LevelTitle
    xp: number
    xp_to_next: number
    progress_percent: number
}

export interface LevelUpEvent {
    id: string
    user_id: string
    level: number
    title: LevelTitle
    xp_earned: number
    xp_required: number
    leveled_up_at: string
    trigger_action?: string | null
    share_url?: string | null
    shared_count: number
}

// Challenges
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'abandoned'

export interface Challenge {
    id: string
    challenge_key: string
    title: string
    description: string
    difficulty: ChallengeDifficulty

    duration_days: number
    target_metric: string
    target_value: number

    badge_name: string
    badge_icon: string
    xp_reward: number

    is_active: boolean
}

export interface UserChallenge {
    id: string
    user_id: string
    challenge_id: string
    challenge?: Challenge

    status: ChallengeStatus
    current_progress: number
    started_at: string
    ends_at: string
    completed_at?: string | null

    badge_earned: boolean
    xp_awarded: number

    share_url?: string | null
    shared_count: number
}

// Enhanced Leaderboard
export type LeaderboardType =
    | 'global'
    | 'weekly'
    | 'friends'
    | 'archetype'
    | 'climbers'

export interface LeaderboardEntry {
    rank: number
    rank_change: number       // +12, -4, or 0 for new
    is_new: boolean

    user: {
        id: string
        username: string
        name?: string | null
        avatar_url?: string | null
        archetype?: ArchetypeKey | null
        level: number
        title: LevelTitle
    }

    dev_flow_score: number
    weekly_change: number
    streak: number

    // For climbers leaderboard
    positions_climbed?: number
}

export interface WeeklyLeaderboard {
    id: string
    week_start: string
    week_end: string
    leaderboard_type: LeaderboardType
    rankings: LeaderboardEntry[]
    total_participants: number
    avg_score?: number | null
    computed_at: string
}

// Streak Types
export type StreakType =
    | 'shipping'
    | 'deep_work'
    | 'no_tutorial'
    | 'consistency'

export interface StreakData {
    type: StreakType
    current: number
    longest: number
    last_active_date: string
    is_at_risk: boolean    // Will break tomorrow if no activity
}

// Share Card Types
export type ShareCardType =
    | 'verdict'
    | 'archetype'
    | 'rank_up'
    | 'leaderboard'
    | 'challenge'
    | 'streak_milestone'

export interface ShareCardData {
    type: ShareCardType
    title: string
    subtitle?: string
    value?: string | number
    change?: number
    username: string
    generated_at: string
}

// Extended User with V2 fields
export interface UserV2 extends User {
    archetype?: ArchetypeKey | null
    archetype_assigned_at?: string | null
    level: number
    xp: number
    title: LevelTitle
    dev_flow_score: number
}
