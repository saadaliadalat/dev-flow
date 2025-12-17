'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Server Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in.',
    },
    Verification: {
      title: 'Verification Failed',
      description: 'The verification token has expired or has already been used.',
    },
    OAuthSignin: {
      title: 'OAuth Sign In Error',
      description: 'Error occurred while trying to sign in with GitHub.',
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      description: 'Error occurred during OAuth callback from GitHub.',
    },
    OAuthCreateAccount: {
      title: 'Account Creation Error',
      description: 'Could not create account with the provided credentials.',
    },
    EmailCreateAccount: {
      title: 'Email Account Error',
      description: 'Could not create account with the provided email.',
    },
    Callback: {
      title: 'Callback Error',
      description: 'Error occurred during authentication callback.',
    },
    OAuthAccountNotLinked: {
      title: 'Account Not Linked',
      description: 'This account is already associated with another sign-in method.',
    },
    SessionRequired: {
      title: 'Session Required',
      description: 'Please sign in to access this page.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred during authentication.',
    },
  }

  const errorInfo = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">{errorInfo.title}</h1>
          <p className="text-slate-400 mb-8">{errorInfo.description}</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-400 font-mono">Error Code: {error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signin" className="flex-1">
              <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />} className="w-full">
                Try Again
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" icon={<Home className="w-4 h-4" />} className="w-full">
                Go Home
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Need help?{' '}
              <a href="#" className="text-cyan-500 hover:text-cyan-400">
                Contact Support
              </a>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
