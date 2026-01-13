import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

/**
 * 🎴 SHAREABLE LORE CARD
 * 
 * Generates dynamic OG images for social sharing.
 * URL: /api/share/card?user=username
 * 
 * Shows: Username, Dev Score, Streak, Soul Velocity, Title
 */

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('user') || 'Developer'
    const score = parseInt(searchParams.get('score') || '75')
    const streak = parseInt(searchParams.get('streak') || '7')
    const velocity = parseInt(searchParams.get('velocity') || '68')
    const title = searchParams.get('title') || 'Code Warrior'
    const commits = searchParams.get('commits') || '539'

    // Dynamic colors based on score
    const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#8B5CF6' : score >= 40 ? '#F59E0B' : '#EF4444'
    const streakColor = streak >= 14 ? '#F97316' : streak >= 7 ? '#FBBF24' : '#8B5CF6'

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0f',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                }}
            >
                {/* Card Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '48px',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        width: '90%',
                        maxWidth: '1000px',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '36px',
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                        >
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>
                                @{username}
                            </span>
                            <span style={{ fontSize: '20px', color: '#8B5CF6', marginTop: '4px' }}>
                                {title}
                            </span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                        {/* DEV Score */}
                        <div
                            style={{
                                flex: 1,
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '48px', fontWeight: 'bold', color: scoreColor }}>
                                {score}
                            </span>
                            <span style={{ fontSize: '14px', color: '#71717A', marginTop: '8px' }}>
                                DEV SCORE
                            </span>
                        </div>

                        {/* Streak */}
                        <div
                            style={{
                                flex: 1,
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '48px', fontWeight: 'bold', color: streakColor }}>
                                {streak}
                            </span>
                            <span style={{ fontSize: '14px', color: '#71717A', marginTop: '8px' }}>
                                🔥 DAY STREAK
                            </span>
                        </div>

                        {/* Soul Velocity */}
                        <div
                            style={{
                                flex: 1,
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#8B5CF6' }}>
                                {velocity}
                            </span>
                            <span style={{ fontSize: '14px', color: '#71717A', marginTop: '8px' }}>
                                SOUL VELOCITY
                            </span>
                        </div>

                        {/* Commits */}
                        <div
                            style={{
                                flex: 1,
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#10B981' }}>
                                {commits}
                            </span>
                            <span style={{ fontSize: '14px', color: '#71717A', marginTop: '8px' }}>
                                TOTAL COMMITS
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '24px' }}>⚡</span>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                                DevFlow
                            </span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#71717A' }}>
                            devflow.app/u/{username}
                        </span>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    )
}
