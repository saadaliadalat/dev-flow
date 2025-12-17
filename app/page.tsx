'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  Github,
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Target,
  Activity,
  ArrowRight,
  Code2,
  GitCommit,
  GitPullRequest,
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Code2 className="w-8 h-8 text-cyan-500" />
              <span className="text-2xl font-bold gradient-text">DevFlow</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button icon={<Github className="w-5 h-5" />}>Get Started</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
            >
              <Zap className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-slate-300">
                Powered by GitHub API
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold mb-6"
            >
              Transform Your{' '}
              <span className="gradient-text">Developer Workflow</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto mb-8"
            >
              Connect your GitHub account and unlock powerful insights into your
              coding patterns, productivity metrics, and development achievements.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  icon={<Github className="w-5 h-5" />}
                >
                  Connect GitHub
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard>
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 w-fit mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Real-Time Analytics
                </h3>
                <p className="text-slate-400">
                  Track commits, PRs, issues, and code reviews with beautiful
                  visualizations and insights.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassCard>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 w-fit mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Productivity Score
                </h3>
                <p className="text-slate-400">
                  Get a comprehensive productivity score based on your activity,
                  consistency, and impact.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <GlassCard>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 w-fit mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Achievements
                </h3>
                <p className="text-slate-400">
                  Unlock badges and achievements as you reach milestones in your
                  development journey.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 right-10 opacity-30"
        >
          <GitCommit className="w-24 h-24 text-cyan-500" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 left-10 opacity-20"
        >
          <GitPullRequest className="w-32 h-32 text-purple-500" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Level Up</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Comprehensive analytics and insights to help you become a better developer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: 'Commit Heatmap',
                description: 'Visualize your coding activity with a GitHub-style contribution graph',
                color: 'from-cyan-500 to-cyan-600',
              },
              {
                icon: Target,
                title: 'Streak Tracking',
                description: 'Monitor your coding streaks and maintain consistent development habits',
                color: 'from-orange-500 to-orange-600',
              },
              {
                icon: BarChart3,
                title: 'Language Analytics',
                description: 'See which programming languages you use most and track your polyglot journey',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: TrendingUp,
                title: 'Time Intelligence',
                description: 'Discover your most productive hours and optimize your workflow',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: Award,
                title: 'Achievement System',
                description: 'Unlock badges for milestones like 100-day streaks and PR mastery',
                color: 'from-pink-500 to-pink-600',
              },
              {
                icon: Zap,
                title: 'Deep Insights',
                description: 'Analyze trends, patterns, and opportunities for improvement',
                color: 'from-indigo-500 to-indigo-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Optimize Your Workflow?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join developers who are tracking their progress and leveling up their game
            </p>
            <Link href="/auth/signin">
              <Button
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started Free
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-cyan-500" />
              <span className="text-lg font-bold gradient-text">DevFlow</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 DevFlow. Built for developers, by developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
