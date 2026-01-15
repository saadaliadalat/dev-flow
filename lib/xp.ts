/**
 * DevFlow XP & Level System
 * 
 * XP Sources:
 * - Daily commit: 10 XP
 * - Streak maintained: 5 XP × streak length
 * - PR merged: 50 XP
 * - Week shipped (7/7 days): 200 XP bonus
 * - Challenge won: 100 XP
 * 
 * Level Progression:
 * Level 1  (Newcomer):     0 XP
 * Level 5  (Contributor):  500 XP
 * Level 10 (Shipper):      2,000 XP
 * Level 20 (Builder):      10,000 XP
 * Level 30 (Architect):    25,000 XP
 * Level 50 (Legend):       100,000 XP
 * Level 100 (Immortal):    500,000 XP
 */

// XP reward amounts
export const XP_REWARDS = {
    DAILY_COMMIT: 10,
    STREAK_MULTIPLIER: 5, // per day of current streak
    PR_MERGED: 50,
    WEEK_SHIPPED: 200,
    CHALLENGE_WON: 100,
    ACHIEVEMENT_UNLOCKED: 25,
} as const

// Level thresholds and titles
export const LEVELS = [
    { level: 1, title: 'Newcomer', xpRequired: 0, color: '#71717a' },
    { level: 5, title: 'Contributor', xpRequired: 500, color: '#3b82f6' },
    { level: 10, title: 'Shipper', xpRequired: 2000, color: '#10b981' },
    { level: 20, title: 'Builder', xpRequired: 10000, color: '#8b5cf6' },
    { level: 30, title: 'Architect', xpRequired: 25000, color: '#f59e0b' },
    { level: 50, title: 'Legend', xpRequired: 100000, color: '#ef4444' },
    { level: 100, title: 'Immortal', xpRequired: 500000, color: '#ec4899' },
] as const

export type LevelTitle = typeof LEVELS[number]['title']

export interface LevelInfo {
    level: number
    title: LevelTitle
    xp: number
    xpForCurrentLevel: number
    xpForNextLevel: number
    progress: number // 0-100
    color: string
}

/**
 * Calculate level info from total XP
 */
export function calculateLevel(totalXp: number): LevelInfo {
    // Type for level data
    type LevelData = typeof LEVELS[number]

    // Find the highest level the user has achieved
    let currentLevelData: LevelData = LEVELS[0]
    let nextLevelData: LevelData = LEVELS[1]

    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalXp >= LEVELS[i].xpRequired) {
            currentLevelData = LEVELS[i]
            nextLevelData = LEVELS[i + 1] || LEVELS[i]
            break
        }
    }

    // Calculate progress to next level
    const xpInCurrentLevel = totalXp - currentLevelData.xpRequired
    const xpNeededForNext = nextLevelData.xpRequired - currentLevelData.xpRequired
    const progress = nextLevelData === currentLevelData
        ? 100
        : Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100))

    return {
        level: currentLevelData.level,
        title: currentLevelData.title,
        xp: totalXp,
        xpForCurrentLevel: currentLevelData.xpRequired,
        xpForNextLevel: nextLevelData.xpRequired,
        progress,
        color: currentLevelData.color,
    }
}

/**
 * Calculate XP earned from a sync
 */
export function calculateSyncXp(data: {
    newCommitsToday: number
    currentStreak: number
    newPrsMerged: number
    daysActiveThisWeek: number
    previousDaysActiveThisWeek: number
}): { total: number; breakdown: { source: string; amount: number; description: string }[] } {
    const breakdown: { source: string; amount: number; description: string }[] = []

    // Daily commits XP
    if (data.newCommitsToday > 0) {
        const commitXp = XP_REWARDS.DAILY_COMMIT * Math.min(data.newCommitsToday, 10) // Cap at 10 commits
        breakdown.push({
            source: 'daily_commit',
            amount: commitXp,
            description: `${data.newCommitsToday} commit${data.newCommitsToday > 1 ? 's' : ''} today`,
        })
    }

    // Streak bonus XP
    if (data.currentStreak > 0) {
        const streakXp = XP_REWARDS.STREAK_MULTIPLIER * data.currentStreak
        breakdown.push({
            source: 'streak_bonus',
            amount: streakXp,
            description: `${data.currentStreak}-day streak bonus`,
        })
    }

    // PR merged XP
    if (data.newPrsMerged > 0) {
        const prXp = XP_REWARDS.PR_MERGED * data.newPrsMerged
        breakdown.push({
            source: 'pr_merged',
            amount: prXp,
            description: `${data.newPrsMerged} PR${data.newPrsMerged > 1 ? 's' : ''} merged`,
        })
    }

    // Week shipped bonus (7/7 days)
    if (data.daysActiveThisWeek === 7 && data.previousDaysActiveThisWeek < 7) {
        breakdown.push({
            source: 'week_shipped',
            amount: XP_REWARDS.WEEK_SHIPPED,
            description: 'Perfect week! 7/7 days shipped',
        })
    }

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0)

    return { total, breakdown }
}

/**
 * Format XP for display (e.g., 12500 -> "12.5K")
 */
export function formatXp(xp: number): string {
    if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(1)}M`
    }
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)}K`
    }
    return xp.toString()
}

/**
 * Get the next level milestone
 */
export function getNextMilestone(currentXp: number): {
    level: number
    title: string
    xpRequired: number
    xpRemaining: number
} | null {
    for (const level of LEVELS) {
        if (currentXp < level.xpRequired) {
            return {
                level: level.level,
                title: level.title,
                xpRequired: level.xpRequired,
                xpRemaining: level.xpRequired - currentXp,
            }
        }
    }
    return null // Already at max level
}
