/**
 * 🌪️ SOUL VELOCITY
 * Calculation logic for the three soul metrics: Depth, Learning, Risk.
 */

export interface SoulMetrics {
    depth: number      // 0-100: Are you going deeper or wider?
    learning: number   // 0-100: Are you acquiring new patterns?
    risk: number       // 0-100: Creative courage - doing new things
    combined: number   // 0-100: Weighted average
}

export interface CommitData {
    repoName: string
    date: string
    filesChanged: string[]
}

/**
 * Calculate Depth Score
 * Higher when you focus on fewer repos, lower when scattered.
 */
export function calculateDepth(commits: CommitData[]): number {
    if (commits.length === 0) return 50

    const repoCommitCounts = new Map<string, number>()
    commits.forEach(c => {
        repoCommitCounts.set(c.repoName, (repoCommitCounts.get(c.repoName) || 0) + 1)
    })

    // Find the dominant repo's share
    const commitValues = Array.from(repoCommitCounts.values())
    const maxCommits = Math.max(...commitValues)
    const focusRatio = maxCommits / commits.length

    // Score: 100 if all commits are to one repo, ~30 if very scattered
    return Math.min(100, Math.round(30 + focusRatio * 70))
}

/**
 * Calculate Learning Score
 * Higher when touching new file types, new repos, unfamiliar territory.
 */
export function calculateLearning(
    recentCommits: CommitData[],
    historicalFileTypes: Set<string>
): number {
    if (recentCommits.length === 0) return 50

    // Collect file extensions from recent commits
    const recentFileTypes = new Set<string>()
    recentCommits.forEach(c => {
        c.filesChanged.forEach(file => {
            const ext = file.split('.').pop()?.toLowerCase()
            if (ext) recentFileTypes.add(ext)
        })
    })

    // Count new file types (not seen before)
    let newTypes = 0
    recentFileTypes.forEach(type => {
        if (!historicalFileTypes.has(type)) newTypes++
    })

    // Score based on novelty ratio
    const noveltyRatio = recentFileTypes.size > 0
        ? newTypes / recentFileTypes.size
        : 0

    return Math.min(100, Math.round(40 + noveltyRatio * 60))
}

/**
 * Calculate Risk Score
 * Higher when working on newer repos (< 30 days old) or first-time contributions.
 */
export function calculateRisk(
    commits: CommitData[],
    repoAges: Map<string, number> // repo name → days since creation
): number {
    if (commits.length === 0) return 50

    let riskyCommits = 0
    commits.forEach(c => {
        const repoAge = repoAges.get(c.repoName) || 365
        if (repoAge < 30) riskyCommits++ // New repo = risky
    })

    const riskRatio = riskyCommits / commits.length
    return Math.min(100, Math.round(30 + riskRatio * 70))
}

/**
 * Calculate combined Soul Velocity score.
 * Weighted: Depth 0.3, Learning 0.4, Risk 0.3
 */
export function calculateSoulVelocity(metrics: Omit<SoulMetrics, 'combined'>): number {
    return Math.round(
        metrics.depth * 0.3 +
        metrics.learning * 0.4 +
        metrics.risk * 0.3
    )
}
