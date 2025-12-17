import NextAuth, { NextAuthConfig } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { SupabaseAdapter } from '@auth/supabase-adapter'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const githubId = process.env.GITHUB_ID
const githubSecret = process.env.GITHUB_SECRET

// Use Supabase adapter only when env vars are available (not during build)
const adapter = supabaseUrl && supabaseServiceKey
  ? SupabaseAdapter({
      url: supabaseUrl,
      secret: supabaseServiceKey,
    })
  : undefined

export const authOptions: NextAuthConfig = {
  providers: [
    GitHubProvider({
      clientId: githubId || 'dummy',
      clientSecret: githubSecret || 'dummy',
      authorization: {
        params: {
          scope: 'read:user user:email repo read:org',
        },
      },
    }),
  ],
  ...(adapter && { adapter }),
  callbacks: {
    async session({ session, user, token }) {
      // Add user ID and access token to session
      if (session.user) {
        session.user.id = user?.id || token?.sub || ''
      }
      return session
    },
    async jwt({ token, account }) {
      // Store GitHub access token
      if (account) {
        token.accessToken = account.access_token
        token.githubId = account.providerAccountId
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: adapter ? 'database' : 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
