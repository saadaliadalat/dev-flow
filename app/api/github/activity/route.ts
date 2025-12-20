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

        const githubId = (session.user as any).githubId

        // Get user's GitHub token - try github_id first, then email as fallback
        let userData = null

        if (githubId) {
            const { data } = await supabase
                .from('users')
                .select('github_access_token, username')
                .eq('github_id', githubId)
                .single()
            userData = data
        }

        // Fallback to email if github_id doesn't work
        if (!userData && session.user.email) {
            const { data } = await supabase
                .from('users')
                .select('github_access_token, username')
                .eq('email', session.user.email)
                .single()
            userData = data
        }

        if (!userData?.github_access_token) {
            return NextResponse.json({ error: 'No GitHub token found' }, { status: 400 })
        }

        const octokit = new Octokit({ auth: userData.github_access_token })

        // Get username from GitHub API directly to ensure accuracy
        const { data: profile } = await octokit.users.getAuthenticated()
        const username = profile.login

        // Fetch more events (30) to ensure we have enough activity
        const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
            username: username,
            per_page: 30
        })

        // Format events for the feed - include more event types
        const formattedEvents = events
            .filter((e: any) => [
                'PushEvent',
                'CreateEvent',
                'WatchEvent',
                'PullRequestEvent',
                'IssuesEvent',
                'PullRequestReviewEvent',
                'IssueCommentEvent',
                'CommitCommentEvent',
                'ForkEvent',
                'DeleteEvent',
                'ReleaseEvent'
            ].includes(e.type))
            .map((e: any) => {
                let title = ''
                let icon = 'git-commit'

                switch (e.type) {
                    case 'PushEvent':
                        const commitCount = e.payload?.commits?.length || 1
                        title = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${e.repo.name}`
                        icon = 'git-commit'
                        break
                    case 'CreateEvent':
                        if (e.payload?.ref_type === 'repository') {
                            title = `Created repository ${e.repo.name}`
                        } else if (e.payload?.ref_type === 'branch') {
                            title = `Created branch ${e.payload.ref} in ${e.repo.name}`
                        } else {
                            title = `Created ${e.payload?.ref_type || 'something'} in ${e.repo.name}`
                        }
                        icon = 'plus'
                        break
                    case 'WatchEvent':
                        title = `Starred ${e.repo.name}`
                        icon = 'star'
                        break
                    case 'PullRequestEvent':
                        const prAction = e.payload?.action || 'updated'
                        title = `${prAction.charAt(0).toUpperCase() + prAction.slice(1)} PR #${e.payload?.pull_request?.number} in ${e.repo.name}`
                        icon = 'git-pull-request'
                        break
                    case 'IssuesEvent':
                        const issueAction = e.payload?.action || 'updated'
                        title = `${issueAction.charAt(0).toUpperCase() + issueAction.slice(1)} issue #${e.payload?.issue?.number} in ${e.repo.name}`
                        icon = 'alert-circle'
                        break
                    case 'PullRequestReviewEvent':
                        title = `Reviewed PR #${e.payload?.pull_request?.number} in ${e.repo.name}`
                        icon = 'eye'
                        break
                    case 'IssueCommentEvent':
                        title = `Commented on issue #${e.payload?.issue?.number} in ${e.repo.name}`
                        icon = 'message-circle'
                        break
                    case 'ForkEvent':
                        title = `Forked ${e.repo.name}`
                        icon = 'git-branch'
                        break
                    case 'DeleteEvent':
                        title = `Deleted ${e.payload?.ref_type} ${e.payload?.ref} from ${e.repo.name}`
                        icon = 'trash'
                        break
                    case 'ReleaseEvent':
                        title = `Released ${e.payload?.release?.tag_name} in ${e.repo.name}`
                        icon = 'tag'
                        break
                    default:
                        title = `Activity in ${e.repo.name}`
                        icon = 'activity'
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
        return NextResponse.json({
            error: error.message,
            events: [] // Return empty array instead of error to prevent UI breaks
        }, { status: 500 })
    }
}
