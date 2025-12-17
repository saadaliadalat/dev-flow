'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Github, Code2, Zap, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const handleGitHubSignIn = async () => {
    await signIn('github', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center lg:text-left"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Code2 className="w-10 h-10 text-cyan-500" />
            <span className="text-3xl font-bold gradient-text">DevFlow</span>
          </Link>

          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="gradient-text">DevFlow</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Transform your GitHub activity into actionable insights and level up your development workflow.
          </p>

          <div className="space-y-4">
            {[
              {
                icon: Zap,
                title: 'Instant Setup',
                description: 'Connect your GitHub account and get started in seconds',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your data is encrypted and never shared with third parties',
              },
              {
                icon: TrendingUp,
                title: 'Real Insights',
                description: 'Track your productivity and see your progress over time',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="p-2 rounded-lg bg-cyan-500/20 flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Sign In Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Get Started</h2>
              <p className="text-slate-400">
                Sign in with your GitHub account to unlock your analytics
              </p>
            </div>

            <Button
              onClick={handleGitHubSignIn}
              size="lg"
              icon={<Github className="w-6 h-6" />}
              className="w-full mb-6"
            >
              Continue with GitHub
            </Button>

            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                No credit card required
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Free forever for public repositories
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Instant access to your analytics
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-slate-400">
                By signing in, you agree to our{' '}
                <a href="#" className="text-cyan-500 hover:text-cyan-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-cyan-500 hover:text-cyan-400">
                  Privacy Policy
                </a>
              </p>
            </div>
          </GlassCard>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-6"
          >
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              ← Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
