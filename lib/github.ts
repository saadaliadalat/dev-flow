import { Octokit } from '@octokit/rest'
import type {
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubPullRequest,
  GitHubIssue,
  GitHubRateLimit
} from '@/types'

/**
 * Create an authenticated Octokit instance
 */
export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
    userAgent: 'DevFlow v1.0.0',
  })
}

/**
 * Fetch authenticated user data from GitHub
 */
export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const octokit = createGitHubClient(accessToken)
  const { data } = await octokit.users.getAuthenticated()
  return data as unknown as GitHubUser
}

/**
 * Fetch user repositories from GitHub
 */
export async function fetchUserRepositories(
  accessToken: string,
  options: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}
): Promise<GitHubRepository[]> {
  const octokit = createGitHubClient(accessToken)

  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: options.sort || 'updated',
    direction: options.direction || 'desc',
    per_page: options.per_page || 100,
    page: options.page || 1,
  })

  return data as unknown as GitHubRepository[]
}

/**
 * Fetch commits for a repository
 */
export async function fetchRepositoryCommits(
  accessToken: string,
  owner: string,
  repo: string,
  options: {
    since?: string
    until?: string
    per_page?: number
    page?: number
  } = {}
): Promise<GitHubCommit[]> {
  const octokit = createGitHubClient(accessToken)

  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      since: options.since,
      until: options.until,
      per_page: options.per_page || 100,
      page: options.page || 1,
    })

    return data as unknown as GitHubCommit[]
  } catch (error: any) {
    // Handle repo access errors (private repos, deleted repos, etc.)
    if (error.status === 404 || error.status === 403) {
      console.warn(`Cannot access commits for ${owner}/${repo}:`, error.message)
      return []
    }
    throw error
  }
}

/**
 * Fetch detailed commit information including stats
 */
export async function fetchCommitDetails(
  accessToken: string,
  owner: string,
  repo: string,
  sha: string
): Promise<GitHubCommit> {
  const octokit = createGitHubClient(accessToken)

  const { data } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: sha,
  })

  return data as unknown as GitHubCommit
}

/**
 * Fetch pull requests for a repository
 */
export async function fetchPullRequests(
  accessToken: string,
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubPullRequest[]> {
  const octokit = createGitHubClient(accessToken)

  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state,
      per_page: 100,
    })

    return data as unknown as GitHubPullRequest[]
  } catch (error: any) {
    if (error.status === 404 || error.status === 403) {
      console.warn(`Cannot access PRs for ${owner}/${repo}:`, error.message)
      return []
    }
    throw error
  }
}

/**
 * Fetch issues for a repository
 */
export async function fetchIssues(
  accessToken: string,
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubIssue[]> {
  const octokit = createGitHubClient(accessToken)

  try {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 100,
    })

    // Filter out pull requests (GitHub API includes PRs in issues)
    const issues = data.filter((issue) => !issue.pull_request)

    return issues as unknown as GitHubIssue[]
  } catch (error: any) {
    if (error.status === 404 || error.status === 403) {
      console.warn(`Cannot access issues for ${owner}/${repo}:`, error.message)
      return []
    }
    throw error
  }
}

/**
 * Fetch user's contribution stats
 */
export async function fetchContributionStats(
  accessToken: string,
  username: string,
  since: Date
): Promise<{
  commits: number
  prs: number
  issues: number
  reviews: number
}> {
  const octokit = createGitHubClient(accessToken)
  const sinceISO = since.toISOString()

  try {
    // Fetch user events to count contributions
    const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
      per_page: 100,
    } as any)

    let commits = 0
    let prs = 0
    let issues = 0
    let reviews = 0

    events.forEach((event: any) => {
      const eventDate = new Date(event.created_at)
      if (eventDate >= since) {
        switch (event.type) {
          case 'PushEvent':
            commits += event.payload?.commits?.length || 0
            break
          case 'PullRequestEvent':
            prs++
            break
          case 'IssuesEvent':
            issues++
            break
          case 'PullRequestReviewEvent':
            reviews++
            break
        }
      }
    })

    return { commits, prs, issues, reviews }
  } catch (error) {
    console.error('Error fetching contribution stats:', error)
    return { commits: 0, prs: 0, issues: 0, reviews: 0 }
  }
}

/**
 * Check GitHub API rate limit
 */
export async function checkRateLimit(accessToken: string): Promise<GitHubRateLimit> {
  const octokit = createGitHubClient(accessToken)

  const { data } = await octokit.rateLimit.get()

  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    reset: data.rate.reset,
    used: data.rate.used,
  }
}

/**
 * Batch fetch commits for multiple repositories
 */
export async function batchFetchCommits(
  accessToken: string,
  repos: Array<{ owner: string; repo: string }>,
  since?: string
): Promise<Map<string, GitHubCommit[]>> {
  const commitsByRepo = new Map<string, GitHubCommit[]>()

  // Fetch commits for each repo in parallel (with rate limiting consideration)
  const promises = repos.map(async ({ owner, repo }) => {
    const repoKey = `${owner}/${repo}`
    try {
      const commits = await fetchRepositoryCommits(accessToken, owner, repo, { since })
      commitsByRepo.set(repoKey, commits)
    } catch (error) {
      console.error(`Error fetching commits for ${repoKey}:`, error)
      commitsByRepo.set(repoKey, [])
    }
  })

  await Promise.all(promises)

  return commitsByRepo
}

/**
 * Calculate streak from commit dates
 */
export function calculateStreak(commitDates: Date[]): { current: number; longest: number } {
  if (commitDates.length === 0) return { current: 0, longest: 0 }

  // Sort dates in descending order
  const sortedDates = commitDates
    .map(d => new Date(d).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  // Check if current streak is active
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1

    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i])
      const previous = new Date(sortedDates[i - 1])
      const diffDays = Math.floor((previous.getTime() - current.getTime()) / 86400000)

      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i])
    const previous = new Date(sortedDates[i - 1])
    const diffDays = Math.floor((previous.getTime() - current.getTime()) / 86400000)

    if (diffDays === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { current: currentStreak, longest: longestStreak }
}
