export interface DailyStats {
  id: string
  user_id: string
  date: string
  total_commits: number
  prs_opened: number
  prs_merged: number
  prs_closed: number
  issues_opened: number
  issues_closed: number
  code_reviews: number
  lines_added: number
  lines_deleted: number
  productivity_score: number
  active_hours: number[]
  top_languages: LanguageCount[]
  repos_contributed: string[]
  created_at: string
}

export interface LanguageCount {
  language: string
  count: number
}

export interface WeeklyStats {
  user_id: string
  week_start: string
  total_commits: number
  prs_opened: number
  prs_merged: number
  issues_closed: number
  code_reviews: number
  lines_added: number
  lines_deleted: number
  avg_productivity_score: number
  active_days: number
}

export interface MonthlyStats {
  user_id: string
  month_start: string
  total_commits: number
  prs_opened: number
  prs_merged: number
  issues_closed: number
  code_reviews: number
  lines_added: number
  lines_deleted: number
  avg_productivity_score: number
  active_days: number
}

export interface StatsOverview {
  today: DailyStats | null
  thisWeek: WeeklyStats | null
  thisMonth: MonthlyStats | null
  allTime: {
    total_commits: number
    total_prs: number
    total_issues: number
    total_reviews: number
    total_repos: number
    total_languages: number
  }
}

export interface ProductivityTrend {
  date: string
  score: number
  commits: number
  prs: number
  issues: number
  reviews: number
}

export interface CommitHeatmapData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ActivityGraphData {
  date: string
  commits: number
  prs: number
  issues: number
}

export interface TimeStats {
  hour: number
  count: number
  label: string
}

export interface DayOfWeekStats {
  day: string
  count: number
  dayIndex: number
}
