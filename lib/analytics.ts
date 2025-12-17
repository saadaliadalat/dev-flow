import type { DailyStats, ProductivityTrend, CommitHeatmapData } from '@/types'

/**
 * Calculate productivity score based on various metrics
 */
export function calculateProductivityScore(stats: {
  total_commits: number
  prs_merged: number
  prs_opened: number
  issues_closed: number
  code_reviews: number
  lines_added: number
  lines_deleted: number
  active_days?: number
}): number {
  const {
    total_commits,
    prs_merged,
    prs_opened,
    issues_closed,
    code_reviews,
    lines_added,
    lines_deleted,
    active_days = 1,
  } = stats

  // Base scores for different activities
  const commitScore = total_commits * 10
  const prScore = prs_merged * 25 + prs_opened * 10
  const issueScore = issues_closed * 15
  const reviewScore = code_reviews * 20
  const volumeScore = Math.log10(lines_added + lines_deleted + 1) * 5

  // Consistency multiplier (rewards regular activity)
  const consistencyMultiplier = Math.min(active_days / 7, 1.5)

  // Calculate total raw score
  const rawScore =
    (commitScore + prScore + issueScore + reviewScore + volumeScore) *
    consistencyMultiplier

  // Normalize to 0-100 scale
  const normalized = Math.min(Math.round(rawScore / 50), 100)

  return Math.max(0, normalized)
}

/**
 * Generate productivity trend data
 */
export function generateProductivityTrend(
  dailyStats: DailyStats[]
): ProductivityTrend[] {
  return dailyStats.map((stats) => ({
    date: stats.date,
    score: stats.productivity_score,
    commits: stats.total_commits,
    prs: stats.prs_merged,
    issues: stats.issues_closed,
    reviews: stats.code_reviews,
  }))
}

/**
 * Generate commit heatmap data (GitHub-style contribution graph)
 */
export function generateCommitHeatmap(
  dailyStats: DailyStats[],
  days: number = 365
): CommitHeatmapData[] {
  const heatmapData: CommitHeatmapData[] = []
  const today = new Date()

  // Create a map of dates to commit counts
  const statsMap = new Map<string, number>()
  dailyStats.forEach((stat) => {
    statsMap.set(stat.date, stat.total_commits)
  })

  // Generate data for the last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const count = statsMap.get(dateStr) || 0

    // Determine level (0-4) based on commit count
    let level: 0 | 1 | 2 | 3 | 4 = 0
    if (count > 0 && count < 3) level = 1
    else if (count >= 3 && count < 6) level = 2
    else if (count >= 6 && count < 9) level = 3
    else if (count >= 9) level = 4

    heatmapData.push({
      date: dateStr,
      count,
      level,
    })
  }

  return heatmapData
}

/**
 * Calculate time-based statistics (hour of day analysis)
 */
export function analyzeCommitTimes(
  activeHours: number[][]
): Array<{ hour: number; count: number; label: string }> {
  const hourCounts = new Array(24).fill(0)

  activeHours.forEach((hours) => {
    hours.forEach((hour) => {
      if (hour >= 0 && hour < 24) {
        hourCounts[hour]++
      }
    })
  })

  return hourCounts.map((count, hour) => ({
    hour,
    count,
    label: formatHour(hour),
  }))
}

/**
 * Calculate day of week statistics
 */
export function analyzeDayOfWeek(
  dailyStats: DailyStats[]
): Array<{ day: string; count: number; dayIndex: number }> {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayCounts = new Array(7).fill(0)

  dailyStats.forEach((stat) => {
    const date = new Date(stat.date)
    const dayIndex = date.getDay()
    dayCounts[dayIndex] += stat.total_commits
  })

  return dayCounts.map((count, index) => ({
    day: dayNames[index],
    count,
    dayIndex: index,
  }))
}

/**
 * Calculate language distribution
 */
export function calculateLanguageDistribution(
  dailyStats: DailyStats[]
): Array<{ language: string; count: number; percentage: number }> {
  const languageCounts = new Map<string, number>()

  dailyStats.forEach((stat) => {
    stat.top_languages?.forEach((lang) => {
      const current = languageCounts.get(lang.language) || 0
      languageCounts.set(lang.language, current + lang.count)
    })
  })

  const total = Array.from(languageCounts.values()).reduce((sum, count) => sum + count, 0)

  const distribution = Array.from(languageCounts.entries())
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  return distribution
}

/**
 * Calculate streak information
 */
export function calculateStreakInfo(dailyStats: DailyStats[]): {
  current: number
  longest: number
  lastCommitDate: string | null
} {
  if (dailyStats.length === 0) {
    return { current: 0, longest: 0, lastCommitDate: null }
  }

  // Sort by date descending
  const sorted = [...dailyStats]
    .filter((s) => s.total_commits > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sorted.length === 0) {
    return { current: 0, longest: 0, lastCommitDate: null }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Calculate current streak
  const lastCommit = new Date(sorted[0].date)
  lastCommit.setHours(0, 0, 0, 0)

  // Check if streak is still active (committed today or yesterday)
  if (lastCommit.getTime() === today.getTime() || lastCommit.getTime() === yesterday.getTime()) {
    currentStreak = 1
    let expectedDate = new Date(lastCommit)

    for (let i = 1; i < sorted.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1)
      const currentDate = new Date(sorted[i].date)
      currentDate.setHours(0, 0, 0, 0)

      if (currentDate.getTime() === expectedDate.getTime()) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1
  let expectedDate = new Date(sorted[0].date)
  expectedDate.setHours(0, 0, 0, 0)

  for (let i = 1; i < sorted.length; i++) {
    expectedDate.setDate(expectedDate.getDate() - 1)
    const currentDate = new Date(sorted[i].date)
    currentDate.setHours(0, 0, 0, 0)

    if (currentDate.getTime() === expectedDate.getTime()) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
      expectedDate = new Date(currentDate)
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return {
    current: currentStreak,
    longest: longestStreak,
    lastCommitDate: sorted[0].date,
  }
}

/**
 * Format hour to 12-hour format
 */
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

/**
 * Calculate average productivity score
 */
export function calculateAverageScore(dailyStats: DailyStats[]): number {
  if (dailyStats.length === 0) return 0

  const total = dailyStats.reduce((sum, stat) => sum + stat.productivity_score, 0)
  return Math.round(total / dailyStats.length)
}

/**
 * Get top repositories by commit count
 */
export function getTopRepositories(
  dailyStats: DailyStats[],
  limit: number = 5
): Array<{ repo: string; commits: number }> {
  const repoCounts = new Map<string, number>()

  dailyStats.forEach((stat) => {
    stat.repos_contributed?.forEach((repo) => {
      const current = repoCounts.get(repo) || 0
      repoCounts.set(repo, current + 1)
    })
  })

  return Array.from(repoCounts.entries())
    .map(([repo, commits]) => ({ repo, commits }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, limit)
}

/**
 * Calculate code volume statistics
 */
export function calculateCodeVolume(dailyStats: DailyStats[]): {
  totalLines: number
  linesAdded: number
  linesDeleted: number
  netChange: number
} {
  const stats = dailyStats.reduce(
    (acc, stat) => ({
      linesAdded: acc.linesAdded + stat.lines_added,
      linesDeleted: acc.linesDeleted + stat.lines_deleted,
    }),
    { linesAdded: 0, linesDeleted: 0 }
  )

  return {
    totalLines: stats.linesAdded + stats.linesDeleted,
    linesAdded: stats.linesAdded,
    linesDeleted: stats.linesDeleted,
    netChange: stats.linesAdded - stats.linesDeleted,
  }
}
