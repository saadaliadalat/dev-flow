import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

/**
 * 📛 README BADGE GENERATOR
 * 
 * Generates dynamic SVG badges for GitHub READMEs.
 * URL: /api/share/badge?user=username&type=streak|score|velocity
 * 
 * Usage in README:
 * ![DevFlow](https://devflow.app/api/share/badge?user=saadaliadalat&type=streak)
 */

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'score'
    const value = searchParams.get('value') || '0'
    const label = searchParams.get('label') || getLabel(type)

    const colors = getColors(type, parseInt(value))

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    backgroundColor: 'transparent',
                }}
            >
                {/* Label */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 10px',
                        backgroundColor: '#1f1f2e',
                        color: '#a1a1aa',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '4px 0 0 4px',
                        height: '100%',
                    }}
                >
                    {label}
                </div>

                {/* Value */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 10px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        fontSize: '11px',
                        fontWeight: 'bold',
                        borderRadius: '0 4px 4px 0',
                        height: '100%',
                    }}
                >
                    {type === 'streak' ? `🔥 ${value}` : value}
                </div>
            </div>
        ),
        {
            width: 120,
            height: 20,
        }
    )
}

function getLabel(type: string): string {
    switch (type) {
        case 'streak': return 'streak'
        case 'score': return 'DEV score'
        case 'velocity': return 'velocity'
        case 'commits': return 'commits'
        default: return 'DevFlow'
    }
}

function getColors(type: string, value: number): { bg: string; text: string } {
    if (type === 'streak') {
        if (value >= 30) return { bg: '#dc2626', text: 'white' }
        if (value >= 14) return { bg: '#ea580c', text: 'white' }
        if (value >= 7) return { bg: '#d97706', text: 'white' }
        return { bg: '#8B5CF6', text: 'white' }
    }

    if (type === 'score' || type === 'velocity') {
        if (value >= 80) return { bg: '#059669', text: 'white' }
        if (value >= 60) return { bg: '#8B5CF6', text: 'white' }
        if (value >= 40) return { bg: '#d97706', text: 'white' }
        return { bg: '#dc2626', text: 'white' }
    }

    return { bg: '#8B5CF6', text: 'white' }
}
