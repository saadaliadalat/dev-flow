import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's GitHub token
        const { data: userData } = await supabase
            .from('users')
            .select('github_access_token')
            .eq('email', session.user.email)
            .single()

        if (!userData?.github_access_token) {
            return NextResponse.json({ error: 'No GitHub token' }, { status: 400 })
        }

        const octokit = new Octokit({ auth: userData.github_access_token })
        // @ts-ignore - session.user.username might be missing from type but exists in session
        const username = session.user.username || session.user.name

        // Fetch user's public events
        const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
            username: username,
            per_page: 10
        })

        // Format events for the feed
        const formattedEvents = events
            .filter((e: any) => e.type === 'PushEvent' || e.type === 'CreateEvent' || e.type === 'WatchEvent')
            .map((e: any) => {
                let title = ''
                let icon = 'git-commit'

                if (e.type === 'PushEvent') {
                    const commitCount = e.payload?.commits?.length || 1
                    title = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${e.repo.name}`
                } else if (e.type === 'CreateEvent') {
                    title = `Created repository ${e.repo.name}`
                    icon = 'plus'
                } else if (e.type === 'WatchEvent') {
                    title = `Starred ${e.repo.name}`
                    icon = 'star'
                }

                return {
                    id: e.id,
                    type: e.type,
                    title,
                    repo: e.repo.name,
                    created_at: e.created_at,
                    icon
                }
            })

        return NextResponse.json({ events: formattedEvents })

    } catch (error: any) {
        console.error('Activity fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
