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

// Star brightness based on days since last commit
export function getStarBrightness(lastCommitDate: Date | string | null): number {
    if (!lastCommitDate) return 0.2 // Dead star
    const daysSince = Math.floor(
        (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSince <= 2) return 1.0   // Actively burning
    if (daysSince <= 7) return 0.85
    if (daysSince <= 30) return 0.6
    if (daysSince <= 90) return 0.35
    return 0.15 // Dim ember
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
