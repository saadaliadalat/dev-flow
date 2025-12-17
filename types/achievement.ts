export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string
  icon: string
  unlocked_at: string
  metadata: Record<string, any>
}

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: 'streak' | 'volume' | 'social' | 'time' | 'language' | 'special'
  condition: (stats: any) => boolean
  progress?: (stats: any) => number
  maxProgress?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Streak Achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Committed code for 3 days in a row',
    icon: '🌱',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 3,
    maxProgress: 3,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Committed code for 7 days straight',
    icon: '🔥',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 7,
    maxProgress: 7,
    rarity: 'common'
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: '30 day coding streak',
    icon: '⚡',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 30,
    maxProgress: 30,
    rarity: 'rare'
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    description: '100 day coding streak',
    icon: '💯',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 100,
    maxProgress: 100,
    rarity: 'epic'
  },
  {
    id: 'streak_365',
    title: 'Year Long Dedication',
    description: '365 day coding streak',
    icon: '👑',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 365,
    maxProgress: 365,
    rarity: 'legendary'
  },

  // Volume Achievements
  {
    id: 'commits_100',
    title: 'First 100',
    description: 'Made 100 commits',
    icon: '📝',
    category: 'volume',
    condition: (stats) => stats.totalCommits >= 100,
    maxProgress: 100,
    rarity: 'common'
  },
  {
    id: 'commits_1000',
    title: 'Commit Master',
    description: 'Made 1,000 commits',
    icon: '🎯',
    category: 'volume',
    condition: (stats) => stats.totalCommits >= 1000,
    maxProgress: 1000,
    rarity: 'rare'
  },
  {
    id: 'commits_10000',
    title: 'Commit Legend',
    description: 'Made 10,000 commits',
    icon: '🏆',
    category: 'volume',
    condition: (stats) => stats.totalCommits >= 10000,
    maxProgress: 10000,
    rarity: 'legendary'
  },
  {
    id: 'pr_master',
    title: 'PR Master',
    description: 'Merged 50 pull requests',
    icon: '🎯',
    category: 'volume',
    condition: (stats) => stats.totalPRs >= 50,
    maxProgress: 50,
    rarity: 'rare'
  },
  {
    id: 'issue_closer',
    title: 'Issue Closer',
    description: 'Closed 100 issues',
    icon: '✅',
    category: 'volume',
    condition: (stats) => stats.totalIssues >= 100,
    maxProgress: 100,
    rarity: 'rare'
  },

  // Time Achievements
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: '50 commits after midnight',
    icon: '🦉',
    category: 'time',
    condition: (stats) => stats.lateNightCommits >= 50,
    maxProgress: 50,
    rarity: 'common'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: '50 commits before 8am',
    icon: '🌅',
    category: 'time',
    condition: (stats) => stats.earlyCommits >= 50,
    maxProgress: 50,
    rarity: 'common'
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: '100 commits on weekends',
    icon: '🏖️',
    category: 'time',
    condition: (stats) => stats.weekendCommits >= 100,
    maxProgress: 100,
    rarity: 'rare'
  },

  // Language Achievements
  {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Coded in 5+ languages',
    icon: '🌍',
    category: 'language',
    condition: (stats) => stats.languageCount >= 5,
    maxProgress: 5,
    rarity: 'common'
  },
  {
    id: 'multilingual',
    title: 'Multilingual Master',
    description: 'Coded in 10+ languages',
    icon: '🗣️',
    category: 'language',
    condition: (stats) => stats.languageCount >= 10,
    maxProgress: 10,
    rarity: 'rare'
  },
  {
    id: 'language_expert',
    title: 'Language Expert',
    description: '1,000 commits in a single language',
    icon: '🎓',
    category: 'language',
    condition: (stats) => stats.maxLanguageCommits >= 1000,
    maxProgress: 1000,
    rarity: 'epic'
  },

  // Social Achievements
  {
    id: 'code_reviewer',
    title: 'Code Reviewer',
    description: 'Reviewed 25 pull requests',
    icon: '👀',
    category: 'social',
    condition: (stats) => stats.totalReviews >= 25,
    maxProgress: 25,
    rarity: 'common'
  },
  {
    id: 'review_master',
    title: 'Review Master',
    description: 'Reviewed 100 pull requests',
    icon: '🔍',
    category: 'social',
    condition: (stats) => stats.totalReviews >= 100,
    maxProgress: 100,
    rarity: 'rare'
  },
  {
    id: 'popular_project',
    title: 'Popular Project',
    description: 'Created a repo with 100+ stars',
    icon: '⭐',
    category: 'social',
    condition: (stats) => stats.maxRepoStars >= 100,
    maxProgress: 100,
    rarity: 'epic'
  },

  // Special Achievements
  {
    id: 'century_day',
    title: 'Century Club',
    description: '100 commits in one day',
    icon: '💯',
    category: 'special',
    condition: (stats) => stats.maxDailyCommits >= 100,
    maxProgress: 100,
    rarity: 'epic'
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Committed every day for a week with 10+ commits each',
    icon: '✨',
    category: 'special',
    condition: (stats) => stats.perfectWeeks >= 1,
    maxProgress: 1,
    rarity: 'rare'
  },
  {
    id: 'open_source_hero',
    title: 'Open Source Hero',
    description: 'Contributed to 10+ different repositories',
    icon: '🦸',
    category: 'special',
    condition: (stats) => stats.reposContributed >= 10,
    maxProgress: 10,
    rarity: 'rare'
  }
]
