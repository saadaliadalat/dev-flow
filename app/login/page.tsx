'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { Github, ArrowLeft, Zap, GitBranch, BarChart3, Trophy, Sparkles, Code, GitPullRequest, Star } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { containerVariants, itemVariants } from '@/lib/animations'
import { DevFlowLogo } from '@/components/ui/DevFlowLogo'

// Floating Icon Component
function FloatingIcon({
    icon: Icon,
    className,
    delay = 0,
    duration = 3
}: {
    icon: React.ElementType
    className?: string
    delay?: number
    duration?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: [0, -10, 0],
            }}
            transition={{
                opacity: { duration: 0.5, delay },
                y: { duration, repeat: Infinity, ease: "easeInOut", delay }
            }}
            className={className}
        >
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm shadow-lg shadow-purple-500/5">
                <Icon className="w-5 h-5 text-purple-400" />
            </div>
        </motion.div>
    )
}

// Animated Code Block
function AnimatedCodeBlock() {
    const lines = [
        { text: 'git commit -m "feat: add new feature"', delay: 0 },
        { text: '✓ 127 commits this week', delay: 0.3 },
        { text: '✓ 12 PRs merged', delay: 0.6 },
        { text: '⚡ Level Up: Code Master!', delay: 0.9 },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-purple-500/10"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-zinc-500 font-mono">devflow-terminal</span>
            </div>
            <div className="font-mono text-sm space-y-2">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.8 + line.delay }}
                        className={`${i === 3 ? 'text-purple-400 font-semibold' : 'text-zinc-400'}`}
                    >
                        {i < 3 && <span className="text-zinc-600 mr-2">$</span>}
                        {line.text}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

// Stats Preview Card
function StatsPreview() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="grid grid-cols-2 gap-3 mt-6"
        >
            {[
                { label: 'Daily Streak', value: '🔥 14', icon: Zap },
                { label: 'Total XP', value: '12,450', icon: Star },
                { label: 'Achievements', value: '23', icon: Trophy },
                { label: 'Rank', value: '#42', icon: BarChart3 },
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.4 + i * 0.1 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 hover:border-purple-500/30 transition-colors group"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <stat.icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        <span className="text-xs text-zinc-500">{stat.label}</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stat.value}</span>
                </motion.div>
            ))}
        </motion.div>
    )
}

// Animated Gradient Orbs
function GradientOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 30, 0],
                    y: [0, -20, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -20, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 right-20 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/3 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[100px]"
            />
        </div>
    )
}

export default function LoginPage() {
    const [isLoading, setIsLoading] = React.useState(false)

    const handleLogin = async (provider: string) => {
        setIsLoading(true)
        await signIn(provider, { callbackUrl: '/dashboard' })
    }

    return (
        <main className="min-h-screen relative flex bg-bg-deepest overflow-hidden">

            {/* Left Side - Illustration */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
                <GradientOrbs />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

                {/* Floating Icons */}
                <FloatingIcon icon={Code} className="absolute top-[15%] left-[20%]" delay={0} duration={4} />
                <FloatingIcon icon={GitPullRequest} className="absolute top-[25%] right-[25%]" delay={0.5} duration={3.5} />
                <FloatingIcon icon={GitBranch} className="absolute bottom-[30%] left-[15%]" delay={1} duration={4.5} />
                <FloatingIcon icon={Trophy} className="absolute bottom-[20%] right-[20%]" delay={0.3} duration={3} />
                <FloatingIcon icon={Sparkles} className="absolute top-[60%] left-[30%]" delay={0.7} duration={3.8} />
                <FloatingIcon icon={BarChart3} className="absolute top-[40%] right-[15%]" delay={0.2} duration={4.2} />

                {/* Main Illustration Content */}
                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Track Your <span className="text-gradient-purple">Developer Journey</span>
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            Turn your commits into achievements. Compete with friends. Level up your coding game.
                        </p>
                    </motion.div>

                    <AnimatedCodeBlock />
                    <StatsPreview />
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-glow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md relative z-10"
                >
                    {/* Back Link */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-text-tertiary hover:text-white transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </motion.div>

                    {/* Login Card */}
                    <GlassCard className="text-center p-8 lg:p-10" glow="purple">
                        {/* Logo */}
                        <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <DevFlowLogo className="w-10 h-10" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-display font-bold mb-3">
                            Welcome to <span className="text-gradient-purple">DevFlow</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-text-secondary mb-8 text-base lg:text-lg">
                            Connect your GitHub and start your productivity adventure.
                        </motion.p>

                        {/* Features List - Mobile Only */}
                        <motion.div variants={itemVariants} className="lg:hidden mb-8 text-left">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Zap, text: 'Track Commits' },
                                    { icon: Trophy, text: 'Earn Achievements' },
                                    { icon: BarChart3, text: 'View Stats' },
                                    { icon: GitBranch, text: 'Compete' },
                                ].map((feature) => (
                                    <div key={feature.text} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <feature.icon className="w-4 h-4 text-purple-400" />
                                        <span>{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                            <GradientButton
                                onClick={() => handleLogin('github')}
                                className="w-full group"
                                size="lg"
                                icon={<Github size={20} />}
                                loading={isLoading}
                            >
                                <span className="flex items-center gap-2">
                                    Continue with GitHub
                                    <motion.span
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        →
                                    </motion.span>
                                </span>
                            </GradientButton>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-900 px-2 text-zinc-500">More coming soon</span>
                                </div>
                            </div>

                            <button
                                disabled
                                className="w-full py-3 px-4 rounded-xl border border-zinc-800 text-zinc-500 cursor-not-allowed flex items-center justify-center gap-2 hover:border-zinc-700 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google Sign In
                            </button>
                        </motion.div>

                        <motion.p variants={itemVariants} className="mt-8 text-xs text-text-muted">
                            By signing in, you agree to our <a href="#" className="underline hover:text-text-secondary transition-colors">Terms</a> and <a href="#" className="underline hover:text-text-secondary transition-colors">Privacy Policy</a>.
                        </motion.p>
                    </GlassCard>

                    {/* Trust Indicators */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-600"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Secure OAuth</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Star className="w-3 h-3" />
                            <span>Free Forever</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3" />
                            <span>Instant Setup</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </main>
    )
}
