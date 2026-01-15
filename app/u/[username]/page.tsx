import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicProfilePage } from '@/components/profile/PublicProfilePage'

interface Props {
    params: { username: string }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = params

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/${username}`, {
            cache: 'no-store'
        })

        if (!res.ok) {
            return {
                title: 'Profile Not Found | DevFlow',
            }
        }

        const data = await res.json()
        const { user, stats } = data

        return {
            title: `${user.name || user.username} | DevFlow Developer Profile`,
            description: `${user.name || user.username} has a ${stats.currentStreak}-day streak, ${stats.totalCommits.toLocaleString()} commits, and is Level ${stats.level} (${stats.levelTitle}) on DevFlow.`,
            openGraph: {
                title: `${user.name || user.username} - DevFlow`,
                description: `🔥 ${stats.currentStreak}-day streak • 📦 ${stats.totalCommits.toLocaleString()} commits • ⚡ Level ${stats.level} ${stats.levelTitle}`,
                images: [
                    {
                        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/share/proof-card?type=streak&username=${user.username}&streak=${stats.currentStreak}&level=${stats.level}&title=${stats.levelTitle}&avatar=${encodeURIComponent(user.avatarUrl || '')}`,
                        width: 1200,
                        height: 630,
                        alt: `${user.username}'s DevFlow Profile`,
                    },
                ],
                type: 'profile',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${user.name || user.username} - DevFlow Developer Profile`,
                description: `🔥 ${stats.currentStreak}-day streak • 📦 ${stats.totalCommits.toLocaleString()} commits`,
            },
        }
    } catch {
        return {
            title: 'Profile | DevFlow',
        }
    }
}

export default async function ProfilePage({ params }: Props) {
    const { username } = params

    // Fetch profile data
    let profileData = null
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/${username}`, {
            cache: 'no-store'
        })

        if (!res.ok) {
            notFound()
        }

        profileData = await res.json()
    } catch {
        notFound()
    }

    return <PublicProfilePage data={profileData} />
}
