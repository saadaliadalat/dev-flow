export interface Repository {
  id: string
  user_id: string
  github_repo_id: number
  name: string
  full_name: string
  description?: string
  language?: string
  stars: number
  forks: number
  is_private: boolean
  is_fork: boolean
  commit_count: number
  last_commit_date?: string
  created_at: string
  updated_at: string
}

export interface RepositoryStats {
  id: string
  name: string
  commits: number
  prs: number
  issues: number
  language?: string
  stars: number
  lastActivity: string
}

export interface LanguageDistribution {
  language: string
  repos: number
  commits: number
  percentage: number
  color: string
}
