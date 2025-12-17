import type { Repository } from './repository'
import type { Achievement } from './achievement'

export interface User {
  id: string
  github_id: string
  username: string
  name?: string
  email?: string
  avatar_url?: string
  bio?: string
  location?: string
  company?: string
  website?: string
  twitter_username?: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  last_synced?: string
}

export interface UserProfile {
  user: User
  stats: UserStats
  repositories: Repository[]
  achievements: Achievement[]
}

export interface UserStats {
  totalCommits: number
  totalPRs: number
  totalIssues: number
  totalReviews: number
  productivityScore: number
  currentStreak: number
  longestStreak: number
  activeRepos: number
  topLanguages: LanguageStats[]
}

export interface LanguageStats {
  language: string
  count: number
  percentage: number
  color: string
}
