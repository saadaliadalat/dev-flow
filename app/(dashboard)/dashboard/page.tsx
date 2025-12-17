'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Code2, BarChart3, GitCommit, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      setIsLoading(false)
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Code2 className="w-10 h-10 text-cyan-500" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">DevFlow</h1>
              <p className="text-slate-400 text-sm">Developer Analytics Dashboard</p>
            </div>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
                />
              )}
              <div className="text-right">
                <p className="text-white font-medium">{session.user.name}</p>
                <p className="text-slate-400 text-sm">{session.user.email}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold mb-4">
                Welcome to <span className="gradient-text">DevFlow</span>! 🎉
              </h2>
              <p className="text-xl text-slate-300 mb-6">
                You've successfully signed in with GitHub
              </p>
              <p className="text-slate-400">
                Your dashboard is being prepared. Soon you'll be able to view your productivity
                metrics, coding patterns, achievements, and much more!
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              icon: BarChart3,
              title: 'Analytics',
              description: 'Track your productivity score and coding patterns',
              color: 'from-cyan-500 to-cyan-600',
            },
            {
              icon: GitCommit,
              title: 'Activity',
              description: 'View your commit history and contribution graph',
              color: 'from-purple-500 to-purple-600',
            },
            {
              icon: Activity,
              title: 'Insights',
              description: 'Discover your most productive hours and languages',
              color: 'from-green-500 to-green-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <GlassCard className="p-6 h-full">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <GlassCard className="p-6 border-2 border-cyan-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <Activity className="w-6 h-6 text-cyan-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  🚀 Dashboard Features Coming Soon
                </h3>
                <p className="text-slate-300 mb-3">
                  We're building amazing features for you:
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">▸</span>
                    Real-time productivity score and statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">▸</span>
                    GitHub contribution heatmap
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">▸</span>
                    Language analytics and trends
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">▸</span>
                    Achievement system with badges
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">▸</span>
                    Deep insights into coding patterns
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
