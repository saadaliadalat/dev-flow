'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { Github, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function LoginPage() {
    const [isLoading, setIsLoading] = React.useState(false)

    const handleLogin = async (provider: string) => {
        setIsLoading(true)
        await signIn(provider, { callbackUrl: '/dashboard' })
    }

    return (
        <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-bg-deepest">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-glow delay-1000" />
                <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
            </div>

            <div className="container px-6 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-md mx-auto"
                >
                    {/* Back Link */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-text-tertiary hover:text-white transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </motion.div>

                    {/* Login Card */}
                    <GlassCard className="text-center p-10" glow="cyan">
                        {/* Logo */}
                        <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-cyan-500/20">
                                D
                            </div>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-3xl font-display font-bold mb-3">
                            Welcome Back
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-text-secondary mb-8">
                            Sign in to track your productivity and unlock new achievements.
                        </motion.p>

                        <motion.div variants={itemVariants} className="space-y-4">
                            <GradientButton
                                onClick={() => handleLogin('github')}
                                className="w-full"
                                size="lg"
                                icon={<Github size={20} />}
                                loading={isLoading}
                            >
                                Continue with GitHub
                            </GradientButton>

                            <div className="flex justify-center">
                                <span className="text-xs font-medium text-text-tertiary/50">
                                    Google authentication coming soon
                                </span>
                            </div>
                        </motion.div>

                        <motion.p variants={itemVariants} className="mt-8 text-xs text-text-muted">
                            By signing in, you agree to our <a href="#" className="underline hover:text-text-secondary">Terms</a> and <a href="#" className="underline hover:text-text-secondary">Privacy Policy</a>.
                        </motion.p>
                    </GlassCard>
                </motion.div>
            </div>
        </main>
    )
}
