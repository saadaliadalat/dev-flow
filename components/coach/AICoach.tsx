'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain, Send, Sparkles, Loader2, ChevronDown, ChevronUp,
    Zap, Target, Clock, Coffee, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoachInsight {
    category: 'quality' | 'productivity' | 'learning' | 'habit'
    title: string
    observation: string
    suggestion: string
    impact: 'high' | 'medium' | 'low'
}

interface AICoachProps {
    className?: string
    compact?: boolean
}

export function AICoach({ className, compact = false }: AICoachProps) {
    const [isOpen, setIsOpen] = useState(!compact)
    const [insights, setInsights] = useState<CoachInsight[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [question, setQuestion] = useState('')
    const [conversation, setConversation] = useState<{ role: 'user' | 'coach'; content: string }[]>([])
    const [isAsking, setIsAsking] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Fetch initial insights on mount
    useEffect(() => {
        fetchInsights()
    }, [])

    const fetchInsights = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/coach')
            if (res.ok) {
                const data = await res.json()
                setInsights(data.insights || [])
            }
        } catch (error) {
            console.error('Failed to fetch coach insights:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const askCoach = async () => {
        if (!question.trim() || isAsking) return

        const userQuestion = question.trim()
        setQuestion('')
        setConversation(prev => [...prev, { role: 'user', content: userQuestion }])
        setIsAsking(true)

        try {
            const res = await fetch('/api/coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userQuestion })
            })

            const data = await res.json()
            setConversation(prev => [...prev, {
                role: 'coach',
                content: data.message || "Keep shipping! Consistency is your superpower."
            }])
        } catch (error) {
            setConversation(prev => [...prev, {
                role: 'coach',
                content: "I'm having trouble connecting. Keep building - that's always the right answer."
            }])
        } finally {
            setIsAsking(false)
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'quality': return <Target size={14} className="text-blue-400" />
            case 'productivity': return <Zap size={14} className="text-amber-400" />
            case 'learning': return <Brain size={14} className="text-purple-400" />
            case 'habit': return <Coffee size={14} className="text-emerald-400" />
            default: return <Sparkles size={14} className="text-zinc-400" />
        }
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
        }
    }

    if (compact) {
        return (
            <motion.div
                className={cn(
                    "rounded-2xl bg-zinc-900/50 border border-white/10 overflow-hidden",
                    className
                )}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Brain size={18} className="text-purple-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-white">AI Coach</h3>
                            <p className="text-xs text-zinc-500">Personalized insights</p>
                        </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                        >
                            <CoachContent
                                insights={insights}
                                isLoading={isLoading}
                                conversation={conversation}
                                question={question}
                                setQuestion={setQuestion}
                                askCoach={askCoach}
                                isAsking={isAsking}
                                getCategoryIcon={getCategoryIcon}
                                getImpactColor={getImpactColor}
                                inputRef={inputRef}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )
    }

    return (
        <div className={cn("rounded-2xl bg-zinc-900/50 border border-white/10 overflow-hidden", className)}>
            <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Brain size={20} className="text-purple-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">AI Coach</h3>
                    <p className="text-xs text-zinc-500">Personalized productivity insights</p>
                </div>
            </div>

            <CoachContent
                insights={insights}
                isLoading={isLoading}
                conversation={conversation}
                question={question}
                setQuestion={setQuestion}
                askCoach={askCoach}
                isAsking={isAsking}
                getCategoryIcon={getCategoryIcon}
                getImpactColor={getImpactColor}
                inputRef={inputRef}
            />
        </div>
    )
}

function CoachContent({
    insights,
    isLoading,
    conversation,
    question,
    setQuestion,
    askCoach,
    isAsking,
    getCategoryIcon,
    getImpactColor,
    inputRef
}: {
    insights: CoachInsight[]
    isLoading: boolean
    conversation: { role: 'user' | 'coach'; content: string }[]
    question: string
    setQuestion: (q: string) => void
    askCoach: () => void
    isAsking: boolean
    getCategoryIcon: (cat: string) => React.ReactNode
    getImpactColor: (impact: string) => string
    inputRef: React.RefObject<HTMLInputElement>
}) {
    return (
        <div className="p-4 space-y-4">
            {/* Insights */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-purple-400" />
                </div>
            ) : (
                <div className="space-y-3">
                    {insights.map((insight, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getCategoryIcon(insight.category)}
                                    <span className="text-sm font-medium text-white">{insight.title}</span>
                                </div>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", getImpactColor(insight.impact))}>
                                    {insight.impact}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-1">{insight.observation}</p>
                            <p className="text-xs text-zinc-300">{insight.suggestion}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Conversation */}
            {conversation.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {conversation.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "p-3 rounded-xl text-sm",
                                msg.role === 'user'
                                    ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 ml-8"
                                    : "bg-white/5 border border-white/5 text-zinc-300 mr-8"
                            )}
                        >
                            {msg.content}
                        </div>
                    ))}
                </div>
            )}

            {/* Ask Input */}
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askCoach()}
                    placeholder="Ask your coach..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none transition-colors"
                />
                <motion.button
                    onClick={askCoach}
                    disabled={isAsking || !question.trim()}
                    className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isAsking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </motion.button>
            </div>
        </div>
    )
}

// Floating Coach Button (for bottom right corner)
export function FloatingCoachButton({ onClick }: { onClick: () => void }) {
    return (
        <motion.button
            onClick={onClick}
            className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <Brain size={24} />
        </motion.button>
    )
}
