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

                            <GradientButton
                                variant="secondary"
                                className="w-full bg-white text-black hover:bg-gray-100 hover:text-black border-none"
                                onClick={() => { }} // Placeholder for Google
                                disabled
                            >
                                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google (Soon)
                            </GradientButton>
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
