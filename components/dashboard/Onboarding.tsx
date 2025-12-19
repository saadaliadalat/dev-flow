'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { Rocket, Target, Zap, Users, Trophy, ArrowRight, Check } from 'lucide-react'

interface OnboardingProps {
    userName: string
    onComplete: () => void
}

const steps = [
    {
        title: "Welcome to DevFlow",
        subtitle: "Your personal coding command center",
        icon: Rocket,
        content: "Track your GitHub activity, set goals, compete with friends, and gain insights into your coding patterns."
    },
    {
        title: "Set Your Goals",
        subtitle: "What do you want to achieve?",
        icon: Target,
        content: "We'll help you stay on track with daily and weekly coding goals. Start with something achievable!"
    },
    {
        title: "You're All Set!",
        subtitle: "Let's start building",
        icon: Zap,
        content: "Your dashboard is syncing your GitHub data. This may take a minute for the first sync."
    }
]

export function Onboarding({ userName, onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [dailyGoal, setDailyGoal] = useState(3)
    const [weeklyGoal, setWeeklyGoal] = useState(15)

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            // Save goals to localStorage or API
            localStorage.setItem('devflow_goals', JSON.stringify({ dailyGoal, weeklyGoal }))
            onComplete()
        }
    }

    const CurrentIcon = steps[currentStep].icon

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            >
                <GlassCard className="max-w-lg w-full p-8 md:p-12 border-white/10 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 blur-[80px] rounded-full" />

                    {/* Progress Dots */}
                    <div className="flex gap-2 mb-8 justify-center">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-white w-6' : i < currentStep ? 'bg-white/60' : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <CurrentIcon size={32} className="text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {currentStep === 0 ? `Hey ${userName}!` : steps[currentStep].title}
                        </h2>
                        <p className="text-zinc-400 text-lg mb-2">{steps[currentStep].subtitle}</p>
                        <p className="text-zinc-500">{steps[currentStep].content}</p>
                    </div>

                    {/* Goals Step */}
                    {currentStep === 1 && (
                        <div className="space-y-6 mb-8">
                            <div>
                                <label className="text-sm text-zinc-400 mb-2 block">Daily Commit Goal</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={dailyGoal}
                                        onChange={(e) => setDailyGoal(Number(e.target.value))}
                                        className="flex-1 accent-white"
                                    />
                                    <span className="text-2xl font-bold text-white w-12 text-center">{dailyGoal}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-zinc-400 mb-2 block">Weekly Commit Goal</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        step="5"
                                        value={weeklyGoal}
                                        onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                                        className="flex-1 accent-white"
                                    />
                                    <span className="text-2xl font-bold text-white w-12 text-center">{weeklyGoal}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <GradientButton
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleNext}
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                Let's Go!
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </GradientButton>

                    {/* Skip */}
                    {currentStep < steps.length - 1 && (
                        <button
                            onClick={onComplete}
                            className="w-full mt-4 text-zinc-500 hover:text-white transition-colors text-sm"
                        >
                            Skip for now
                        </button>
                    )}
                </GlassCard>
            </motion.div>
        </AnimatePresence>
    )
}
