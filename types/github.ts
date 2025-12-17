export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  email: string | null
  bio: string | null
  location: string | null
  company: string | null
  blog: string
  twitter_username: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  fork: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  stats?: {
    additions: number
    deletions: number
    total: number
  }
  files?: GitHubFile[]
}

export interface GitHubFile {
  filename: string
  additions: number
  deletions: number
  changes: number
  status: string
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  user: {
    login: string
    avatar_url: string
  }
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  closed_at: string | null
  user: {
    login: string
    avatar_url: string
  }
}

export interface GitHubReview {
  id: number
  user: {
    login: string
    avatar_url: string
  }
  state: string
  submitted_at: string
}

export interface GitHubSyncResult {
  success: boolean
  message: string
  data?: {
    commits: number
    prs: number
    issues: number
    reviews: number
    repos: number
  }
  error?: string
}

export interface GitHubRateLimit {
  limit: number
  remaining: number
  reset: number
  used: number
}
