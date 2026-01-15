import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Proof Card OG Image Generator
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        // Get card parameters
        const type = searchParams.get('type') || 'streak'
        const username = searchParams.get('username') || 'developer'
        const avatar = searchParams.get('avatar') || ''

        // Type-specific data
        const streakDays = parseInt(searchParams.get('streak') || '0')
        const commits = parseInt(searchParams.get('commits') || '0')
        const prs = parseInt(searchParams.get('prs') || '0')
        const rank = parseInt(searchParams.get('rank') || '0')
        const level = parseInt(searchParams.get('level') || '1')
        const title = searchParams.get('title') || 'Newcomer'
        const achievement = searchParams.get('achievement') || ''
        const achievementIcon = searchParams.get('icon') || '🏆'

        // Generate different cards based on type
        const cardContent = getCardContent(type, {
            username,
            avatar,
            streakDays,
            commits,
            prs,
            rank,
            level,
            title,
            achievement,
            achievementIcon,
        })

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #0a0a0a 100%)',
                        padding: '48px',
                        position: 'relative',
                    }}
                >
                    {/* Background dots pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.03,
                            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                            backgroundSize: '32px 32px',
                        }}
                    />

                    {/* Purple glow */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-100px',
                            right: '-100px',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Amber glow */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-100px',
                            left: '-100px',
                            width: '300px',
                            height: '300px',
                            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                        {cardContent}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 'auto',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {avatar && (
                                <img
                                    src={avatar}
                                    width={40}
                                    height={40}
                                    style={{
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                    }}
                                />
                            )}
                            <span style={{ color: '#a1a1aa', fontSize: '18px' }}>@{username}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#8b5cf6', fontSize: '16px' }}>⚡</span>
                            <span style={{ color: '#52525b', fontSize: '14px', fontFamily: 'monospace' }}>
                                devflow.io
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
    } catch (error) {
        console.error('Error generating proof card:', error)
        return new Response('Failed to generate image', { status: 500 })
    }
}

function getCardContent(
    type: string,
    data: {
        username: string
        avatar: string
        streakDays: number
        commits: number
        prs: number
        rank: number
        level: number
        title: string
        achievement: string
        achievementIcon: string
    }
) {
    switch (type) {
        case 'streak':
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#f59e0b', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                                🔥 STREAK MILESTONE
                            </span>
                            <span style={{ color: 'white', fontSize: '72px', fontWeight: 'bold', lineHeight: 1 }}>
                                {data.streakDays} Days
                            </span>
                        </div>
                        <span style={{ fontSize: '80px' }}>🔥</span>
                    </div>
                    <span style={{ color: '#d4d4d8', fontSize: '24px', marginBottom: '8px' }}>
                        Shipped code every single day.
                    </span>
                    <span style={{ color: '#71717a', fontSize: '20px' }}>
                        Consistency is the ultimate superpower.
                    </span>
                    {data.level > 1 && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '24px',
                                padding: '8px 16px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '9999px',
                                width: 'fit-content',
                            }}
                        >
                            <span style={{ color: '#c4b5fd', fontSize: '14px' }}>
                                Level {data.level} {data.title}
                            </span>
                        </div>
                    )}
                </div>
            )

        case 'weekly':
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#8b5cf6', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        📊 THIS WEEK IN CODE
                    </span>
                    <span style={{ color: 'white', fontSize: '36px', fontWeight: 'bold', marginBottom: '32px' }}>
                        Weekly Performance
                    </span>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', fontFamily: 'monospace' }}>
                                {data.commits}
                            </span>
                            <span style={{ color: '#71717a', fontSize: '14px' }}>Commits</span>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', fontFamily: 'monospace' }}>
                                {data.prs}
                            </span>
                            <span style={{ color: '#71717a', fontSize: '14px' }}>PRs Merged</span>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }}>
                                #{data.rank || '—'}
                            </span>
                            <span style={{ color: '#71717a', fontSize: '14px' }}>Rank</span>
                        </div>
                    </div>
                </div>
            )

        case 'achievement':
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <span style={{ fontSize: '96px', marginBottom: '16px' }}>{data.achievementIcon}</span>
                    <span style={{ color: '#10b981', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                        ACHIEVEMENT UNLOCKED
                    </span>
                    <span style={{ color: 'white', fontSize: '48px', fontWeight: 'bold', textAlign: 'center' }}>
                        {data.achievement || 'Unknown Achievement'}
                    </span>
                </div>
            )

        default:
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <span style={{ color: 'white', fontSize: '36px' }}>DevFlow Proof Card</span>
                </div>
            )
    }
}
