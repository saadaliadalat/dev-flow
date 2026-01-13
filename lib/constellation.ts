/**
 * 🌌 THE CONSTELLATION
 * Utility functions for positioning and rendering stars.
 */

// Language → Color mapping (matches our design system)
export const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#8B5CF6',  // Violet
    JavaScript: '#FBBF24',  // Amber
    Python: '#3B82F6',      // Blue
    Rust: '#F97316',        // Orange
    Go: '#06B6D4',          // Cyan
    Java: '#EF4444',        // Red
    'C++': '#EC4899',       // Pink
    Ruby: '#DC2626',        // Deep Red
    PHP: '#6366F1',         // Indigo
    Swift: '#F59E0B',       // Amber
    Kotlin: '#A855F7',      // Purple
    Dart: '#00B4AB',        // Teal (Flutter)
    C: '#555555',           // Gray
    'C#': '#68217A',        // Purple
    Shell: '#89E051',       // Green
    HTML: '#E34C26',        // Orange-Red
    CSS: '#563D7C',         // Purple
    Vue: '#41B883',         // Green
    default: '#71717A',     // Zinc (fallback)
}

export function getLanguageColor(language: string | null): string {
    return LANGUAGE_COLORS[language || ''] || LANGUAGE_COLORS.default
}

// Star sizing based on commits (logarithmic scale for visual balance)
export function getStarSize(commits: number, minSize = 4, maxSize = 40): number {
    if (commits <= 0) return minSize
    const logScale = Math.log10(commits + 1)
    const normalized = Math.min(logScale / 4, 1) // Cap at ~10,000 commits
    return minSize + normalized * (maxSize - minSize)
}

// Recency score using exponential decay: e^{-days/30}
// Returns 0-1 where 1 = today, 0.5 ≈ 21 days, 0.1 ≈ 69 days
export function getRecencyScore(lastCommitDate: Date | string | null): number {
    if (!lastCommitDate) return 0.05 // Near-dead star
    const daysSince = (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
    return Math.exp(-daysSince / 30) // Exponential decay with 30-day half-life
}

// Star brightness based on recency (uses exponential decay)
export function getStarBrightness(lastCommitDate: Date | string | null): number {
    const recency = getRecencyScore(lastCommitDate)
    // Map recency to brightness: 0.15 (dim) to 1.0 (blazing)
    return 0.15 + recency * 0.85
}

// Fibonacci spiral positioning for organic star placement
export function getSpiralPosition(
    index: number,
    centerX: number,
    centerY: number,
    spread = 50
): { x: number; y: number } {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // ~137.5 degrees
    const angle = index * goldenAngle
    const radius = spread * Math.sqrt(index)

    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
    }
}

// Star data structure
export interface Star {
    id: string
    name: string
    fullName: string
    language: string | null
    commits: number
    lastCommitAt: string | null
    url: string
    // Computed
    x?: number
    y?: number
    size?: number
    color?: string
    brightness?: number
}

// Force-directed layout algorithm
// Clusters stars by language, spreads by commit mass
export function forceDirectedLayout(
    stars: Star[],
    width: number,
    height: number,
    iterations = 40
): Star[] {
    if (stars.length === 0) return stars

    const centerX = width / 2
    const centerY = height / 2
    const padding = 60

    // Initialize with golden angle spiral for stability
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    stars.forEach((star, i) => {
        const angle = i * goldenAngle
        const radius = 80 + Math.sqrt(i) * 40
        star.x = centerX + radius * Math.cos(angle)
        star.y = centerY + radius * Math.sin(angle)
    })

    // Group by language for attraction
    const languageGroups = new Map<string, Star[]>()
    stars.forEach(star => {
        const lang = star.language || 'Unknown'
        if (!languageGroups.has(lang)) languageGroups.set(lang, [])
        languageGroups.get(lang)!.push(star)
    })

    // Simulation iterations
    for (let iter = 0; iter < iterations; iter++) {
        const cooling = 1 - iter / iterations // Simulated annealing

        // Repulsion between all nodes (Coulomb's law)
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[j].x! - stars[i].x!
                const dy = stars[j].y! - stars[i].y!
                const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 10)
                const force = (1500 / (dist * dist)) * cooling

                const fx = (dx / dist) * force
                const fy = (dy / dist) * force

                stars[i].x! -= fx
                stars[i].y! -= fy
                stars[j].x! += fx
                stars[j].y! += fy
            }
        }

        // Attraction within language groups (spring force)
        languageGroups.forEach(group => {
            if (group.length < 2) return
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const dx = group[j].x! - group[i].x!
                    const dy = group[j].y! - group[i].y!
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const force = (dist - 80) * 0.01 * cooling // Rest length of 80px

                    const fx = (dx / dist) * force
                    const fy = (dy / dist) * force

                    group[i].x! += fx
                    group[i].y! += fy
                    group[j].x! -= fx
                    group[j].y! -= fy
                }
            }
        })

        // Gravity toward center
        stars.forEach(star => {
            const dx = centerX - star.x!
            const dy = centerY - star.y!
            star.x! += dx * 0.01 * cooling
            star.y! += dy * 0.01 * cooling
        })

        // Keep in bounds
        stars.forEach(star => {
            star.x = Math.max(padding, Math.min(width - padding, star.x!))
            star.y = Math.max(padding, Math.min(height - padding, star.y!))
        })
    }

    return stars
}

// Get language-based edges for constellation lines
export function getLanguageEdges(stars: Star[]): Array<[Star, Star, string]> {
    const edges: Array<[Star, Star, string]> = []
    const languageGroups = new Map<string, Star[]>()

    stars.forEach(star => {
        const lang = star.language || 'Unknown'
        if (!languageGroups.has(lang)) languageGroups.set(lang, [])
        languageGroups.get(lang)!.push(star)
    })

    languageGroups.forEach((group, lang) => {
        if (group.length < 2) return
        // Connect in chain (minimum spanning approach)
        for (let i = 1; i < group.length; i++) {
            edges.push([group[i - 1], group[i], lang])
        }
    })

    return edges
}
