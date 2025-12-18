import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authConfig: NextAuthConfig = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'read:user user:email repo read:org'
                }
            },
        })
    ],

    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === 'github' && profile) {
                try {
                    // Check if user exists
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('id')
                        .eq('github_id', profile.id.toString())
                        .single()

                    if (!existingUser) {
                        // Create new user
                        const { error } = await supabase.from('users').insert({
                            github_id: profile.id.toString(),
                            username: profile.login,
                            name: profile.name,
                            email: profile.email,
                            avatar_url: profile.avatar_url,
                            bio: profile.bio,
                            location: profile.location,
                            company: profile.company,
                            website: profile.blog,
                            twitter_username: profile.twitter_username,
                            public_repos: profile.public_repos,
                            followers: profile.followers,
                            following: profile.following,
                            github_access_token: account.access_token, // TODO: Encrypt in production!
                            github_refresh_token: account.refresh_token,
                        })

                        if (error) {
                            console.error('Error creating user:', error)
                            return false
                        }

                        // Trigger initial sync in background
                        await triggerInitialSync(profile.login, account.access_token)
                    } else {
                        // Update existing user's tokens and info
                        await supabase
                            .from('users')
                            .update({
                                github_access_token: account.access_token,
                                github_refresh_token: account.refresh_token,
                                avatar_url: profile.avatar_url,
                                name: profile.name,
                                email: profile.email,
                                bio: profile.bio,
                                location: profile.location,
                                company: profile.company,
                                website: profile.blog,
                                followers: profile.followers,
                                following: profile.following,
                                updated_at: new Date().toISOString()
                            })
                            .eq('github_id', profile.id.toString())
                    }

                    return true
                } catch (error) {
                    console.error('SignIn error:', error)
                    return false
                }
            }
            return true
        },

        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.sub!
                session.user.username = token.username as string
                session.user.githubId = token.githubId as string
            }
            return session
        },

        async jwt({ token, account, profile }: any) {
            if (account && profile) {
                token.username = profile.login
                token.githubId = profile.id.toString()
            }
            return token
        }
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
}

const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

export { handlers, auth, signIn, signOut }

// Helper function to trigger initial sync
async function triggerInitialSync(username: string, accessToken: string) {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/github/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, accessToken })
        })
    } catch (err) {
        console.error('Initial sync trigger failed:', err)
    }
}
