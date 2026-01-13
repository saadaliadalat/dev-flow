'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Play, Pause, RotateCcw, Coffee, Zap, Clock, Target,
    TrendingUp, GitCommit, CheckCircle, Volume2, VolumeX
} from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'
import { useSession } from 'next-auth/react'

// Timer presets
const PRESETS = {
    focus: { duration: 25 * 60, label: 'Focus', icon: Zap, color: 'violet' },
    short: { duration: 5 * 60, label: 'Short Break', icon: Coffee, color: 'emerald' },
    long: { duration: 15 * 60, label: 'Long Break', icon: Coffee, color: 'cyan' },
}

type PresetKey = keyof typeof PRESETS

interface FocusSession {
    id: string
    startedAt: Date
    endedAt?: Date
    duration: number
    type: PresetKey
    commitsTracked: number
    completed: boolean
}

export default function FocusZonePage() {
    const { data: session } = useSession()
    const [preset, setPreset] = useState<PresetKey>('focus')
    const [timeLeft, setTimeLeft] = useState(PRESETS.focus.duration)
    const [isRunning, setIsRunning] = useState(false)
    const [sessions, setSessions] = useState<FocusSession[]>([])
    const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [commitsBefore, setCommitsBefore] = useState<number | null>(null)
    const [todayStats, setTodayStats] = useState({ sessions: 0, focusMinutes: 0, commits: 0 })

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Load saved sessions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('focusSessions')
        if (saved) {
            const parsed = JSON.parse(saved).map((s: any) => ({
                ...s,
                startedAt: new Date(s.startedAt),
                endedAt: s.endedAt ? new Date(s.endedAt) : undefined,
            }))
            setSessions(parsed)

            // Calculate today's stats
            const today = new Date().toDateString()
            const todaySessions = parsed.filter((s: FocusSession) =>
                s.startedAt.toDateString() === today && s.completed
            )
            setTodayStats({
                sessions: todaySessions.length,
                focusMinutes: Math.round(todaySessions.reduce((acc: number, s: FocusSession) =>
                    acc + (s.type === 'focus' ? s.duration / 60 : 0), 0)),
                commits: todaySessions.reduce((acc: number, s: FocusSession) =>
                    acc + s.commitsTracked, 0),
            })
        }
    }, [])

    // Timer tick
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(t => t - 1)
            }, 1000)
        } else if (timeLeft === 0 && isRunning) {
            handleComplete()
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRunning, timeLeft])

    // Fetch initial commit count when starting focus session
    const fetchCommitCount = async () => {
        try {
            const res = await fetch('/api/user/me')
            const data = await res.json()
            return data.user?.total_commits || 0
        } catch {
            return 0
        }
    }

    const handleStart = async () => {
        if (!isRunning) {
            const commits = await fetchCommitCount()
            setCommitsBefore(commits)

            const newSession: FocusSession = {
                id: Date.now().toString(),
                startedAt: new Date(),
                duration: PRESETS[preset].duration,
                type: preset,
                commitsTracked: 0,
                completed: false,
            }
            setCurrentSession(newSession)
        }
        setIsRunning(true)
    }

    const handlePause = () => {
        setIsRunning(false)
    }

    const handleReset = () => {
        setIsRunning(false)
        setTimeLeft(PRESETS[preset].duration)
        setCurrentSession(null)
        setCommitsBefore(null)
    }

    const handleComplete = async () => {
        setIsRunning(false)

        // Play completion sound
        if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => { })
        }

        // Calculate commits during session
        const commitsAfter = await fetchCommitCount()
        const commitsTracked = commitsBefore !== null ? Math.max(0, commitsAfter - commitsBefore) : 0

        if (currentSession) {
            const completedSession: FocusSession = {
                ...currentSession,
                endedAt: new Date(),
                commitsTracked,
                completed: true,
            }

            const updatedSessions = [completedSession, ...sessions].slice(0, 20)
            setSessions(updatedSessions)
            localStorage.setItem('focusSessions', JSON.stringify(updatedSessions))

            // Update today's stats
            if (preset === 'focus') {
                setTodayStats(prev => ({
                    sessions: prev.sessions + 1,
                    focusMinutes: prev.focusMinutes + Math.round(PRESETS.focus.duration / 60),
                    commits: prev.commits + commitsTracked,
                }))
            }
        }

        // Auto-switch to break after focus
        if (preset === 'focus') {
            setPreset('short')
            setTimeLeft(PRESETS.short.duration)
        } else {
            setPreset('focus')
            setTimeLeft(PRESETS.focus.duration)
        }

        setCurrentSession(null)
        setCommitsBefore(null)
    }

    const handlePresetChange = (newPreset: PresetKey) => {
        if (!isRunning) {
            setPreset(newPreset)
            setTimeLeft(PRESETS[newPreset].duration)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const progress = ((PRESETS[preset].duration - timeLeft) / PRESETS[preset].duration) * 100
    const PresetIcon = PRESETS[preset].icon

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Hidden audio element for completion sound */}
            <audio ref={audioRef} src="/sounds/complete.mp3" preload="auto" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                        <Zap className="text-violet-400" />
                        Focus Zone
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Deep work sessions that track your coding output
                    </p>
                </div>
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-3 gap-4">
                <AliveCard className="p-4 text-center" glass>
                    <Clock size={18} className="text-violet-400 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-white font-mono">{todayStats.focusMinutes}</span>
                    <p className="text-xs text-zinc-500">Focus Minutes</p>
                </AliveCard>
                <AliveCard className="p-4 text-center" glass>
                    <Target size={18} className="text-emerald-400 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-white font-mono">{todayStats.sessions}</span>
                    <p className="text-xs text-zinc-500">Sessions</p>
                </AliveCard>
                <AliveCard className="p-4 text-center" glass>
                    <GitCommit size={18} className="text-amber-400 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-white font-mono">{todayStats.commits}</span>
                    <p className="text-xs text-zinc-500">Commits Tracked</p>
                </AliveCard>
            </div>

            {/* Main Timer */}
            <AliveCard className="p-8" glass>
                {/* Preset Tabs */}
                <div className="flex justify-center gap-2 mb-8">
                    {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
                        const p = PRESETS[key]
                        const Icon = p.icon
                        return (
                            <button
                                key={key}
                                onClick={() => handlePresetChange(key)}
                                disabled={isRunning}
                                className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${preset === key
                                        ? `bg-${p.color}-500/20 text-${p.color}-400 border border-${p.color}-500/30`
                                        : 'bg-white/5 text-zinc-500 hover:text-white border border-transparent'
                                    } ${isRunning && preset !== key ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Icon size={14} />
                                {p.label}
                            </button>
                        )
                    })}
                </div>

                {/* Timer Display */}
                <div className="relative flex justify-center mb-8">
                    {/* Background circle */}
                    <svg className="w-64 h-64 transform -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="8"
                            fill="none"
                        />
                        <motion.circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke={preset === 'focus' ? '#8B5CF6' : '#10B981'}
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 120}
                            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>

                    {/* Timer text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <PresetIcon size={24} className={`mb-2 ${preset === 'focus' ? 'text-violet-400' : 'text-emerald-400'}`} />
                        <motion.span
                            key={timeLeft}
                            initial={{ scale: 1.05, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-6xl font-mono font-bold text-white"
                        >
                            {formatTime(timeLeft)}
                        </motion.span>
                        <p className="text-sm text-zinc-500 mt-2">{PRESETS[preset].label}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                    {!isRunning ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStart}
                            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/25"
                        >
                            <Play size={20} />
                            Start Focus
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePause}
                            className="px-8 py-3 rounded-2xl bg-white/10 text-white font-semibold flex items-center gap-2"
                        >
                            <Pause size={20} />
                            Pause
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        className="px-4 py-3 rounded-2xl bg-white/5 text-zinc-400 hover:text-white"
                    >
                        <RotateCcw size={20} />
                    </motion.button>
                </div>

                {/* Live tracking indicator */}
                <AnimatePresence>
                    {isRunning && preset === 'focus' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs text-emerald-400">Tracking commits...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </AliveCard>

            {/* Recent Sessions */}
            {sessions.length > 0 && (
                <AliveCard className="p-6" glass>
                    <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-violet-400" />
                        Recent Sessions
                    </h2>
                    <div className="space-y-2">
                        {sessions.slice(0, 5).map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    {s.completed ? (
                                        <CheckCircle size={16} className="text-emerald-400" />
                                    ) : (
                                        <Clock size={16} className="text-zinc-500" />
                                    )}
                                    <div>
                                        <p className="text-sm text-white font-medium">
                                            {PRESETS[s.type].label}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {s.startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono text-white">
                                        {Math.round(s.duration / 60)} min
                                    </p>
                                    {s.type === 'focus' && s.commitsTracked > 0 && (
                                        <p className="text-xs text-amber-400">
                                            +{s.commitsTracked} commits
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </AliveCard>
            )}

            {/* Tip */}
            <div className="text-center text-xs text-zinc-600 max-w-md mx-auto">
                💡 The Focus Zone tracks how many commits you make during each focus session.
                Push code to see your productivity during deep work!
            </div>
        </motion.div>
    )
}
