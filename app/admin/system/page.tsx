'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Server,
    Database,
    Zap,
    RefreshCw,
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Cpu,
    HardDrive,
    Cloud,
    GitBranch,
    Clock
} from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'

interface SystemMetrics {
    database: {
        users: number
        daily_stats: number
        repositories: number
        achievements: number
        insights: number
    }
    api: {
        github: {
            remaining: number
            limit: number
            resetAt: string
        }
        gemini: {
            remaining: number
            limit: number
            resetAt: string
        }
    }
    jobs: Array<{
        name: string
        schedule: string
        lastRun: string
        status: 'success' | 'error' | 'running'
        nextRun: string
    }>
    health: {
        status: string
        uptime: string
        responseTime: string
        lastCheck: string
    }
    recentErrors: any[]
}

export default function AdminSystemPage() {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchMetrics = async () => {
        try {
            const res = await fetch('/api/admin/system')
            if (res.ok) {
                const data = await res.json()
                setMetrics(data)
            }
        } catch (error) {
            console.error('Failed to fetch system metrics:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchMetrics()
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchMetrics()
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
            case 'healthy':
                return <CheckCircle2 size={16} className="text-emerald-400" />
            case 'warning':
                return <AlertTriangle size={16} className="text-yellow-400" />
            case 'error':
                return <XCircle size={16} className="text-red-400" />
            case 'running':
                return <RefreshCw size={16} className="text-blue-400 animate-spin" />
            default:
                return <CheckCircle2 size={16} className="text-zinc-500" />
        }
    }

    const formatTimeUntil = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        if (hours > 0) return `${hours}h ${minutes % 60}m`
        return `${minutes}m`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm font-medium animate-pulse">Checking system status...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Status</h1>
                    <p className="text-zinc-500 mt-1">Real-time health monitoring and resource tracking</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* System Health Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
                {/* Health Status */}
                <div className="lg:col-span-1 p-6 rounded-3xl bg-[#09090b] border border-white/10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Activity size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Activity size={24} />
                            </div>
                            <span className="text-zinc-400 font-medium tracking-wide">Overall Health</span>
                        </div>
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{metrics?.health.status}</h2>
                            </div>
                            <p className="text-xs text-zinc-500 font-mono">
                                Last checked: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock size={16} className="text-purple-400" />
                            <span className="text-zinc-400 text-sm font-medium">Uptime</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{metrics?.health.uptime}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap size={16} className="text-yellow-400" />
                            <span className="text-zinc-400 text-sm font-medium">Latency</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{metrics?.health.responseTime}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <Server size={16} className="text-blue-400" />
                            <span className="text-zinc-400 text-sm font-medium">Server Load</span>
                        </div>
                        <p className="text-2xl font-bold text-white">Low</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* API Quotas */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Cloud size={20} className="text-zinc-400" />
                        API Usage & Quotas
                    </h3>

                    {/* GitHub API */}
                    <div className="p-6 rounded-3xl bg-[#09090b] border border-white/10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-800 text-white">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">GitHub API</h4>
                                    <p className="text-xs text-zinc-500">Core data provider</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white font-mono">{metrics?.api.github.remaining}</p>
                                <p className="text-xs text-zinc-500">requests remaining</p>
                            </div>
                        </div>

                        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                            <div
                                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${(metrics?.api.github.remaining || 0) / (metrics?.api.github.limit || 1) * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                            <span>Limit: {metrics?.api.github.limit}</span>
                            <span>Resets in: {metrics?.api.github.resetAt ? formatTimeUntil(metrics.api.github.resetAt) : '-'}</span>
                        </div>
                    </div>

                    {/* Gemini API */}
                    <div className="p-6 rounded-3xl bg-[#09090b] border border-white/10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Gemini AI</h4>
                                    <p className="text-xs text-zinc-500">Intelligence engine</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white font-mono">{metrics?.api.gemini.remaining}</p>
                                <p className="text-xs text-zinc-500">quota remaining</p>
                            </div>
                        </div>

                        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                            <div
                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${(metrics?.api.gemini.remaining || 0) / (metrics?.api.gemini.limit || 1) * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                            <span>Limit: {metrics?.api.gemini.limit}</span>
                            <span>Resets in: {metrics?.api.gemini.resetAt ? formatTimeUntil(metrics.api.gemini.resetAt) : '-'}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Database & Jobs */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Database size={20} className="text-zinc-400" />
                        Background Services
                    </h3>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-6 rounded-3xl bg-[#09090b] border border-white/10 overflow-hidden"
                    >
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Scheduled Jobs</h4>
                        <div className="space-y-4">
                            {metrics?.jobs.map((job, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${job.status === 'running' ? 'bg-blue-400 animate-pulse' : job.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                        <div>
                                            <p className="font-medium text-white text-sm">{job.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">{job.schedule}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-300">{new Date(job.lastRun).toLocaleTimeString()}</p>
                                        <p className="text-[10px] text-zinc-600">Last run</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-3xl bg-[#09090b] border border-white/10"
                    >
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Database Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {metrics?.database && Object.entries(metrics.database).map(([key, value]) => (
                                <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-lg font-bold text-white">{value.toLocaleString()}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-mono">{key.replace('_', ' ')}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recent Errors */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-6 rounded-3xl bg-[#09090b] border border-white/10"
            >
                <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle size={20} className="text-red-400" />
                    <h3 className="text-lg font-bold text-white">Recent Errors</h3>
                </div>

                {metrics?.recentErrors && metrics.recentErrors.length > 0 ? (
                    <div className="space-y-3">
                        {metrics.recentErrors.map((error: any, index: number) => (
                            <div key={index} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle size={14} className="text-red-400" />
                                    <span className="text-sm text-red-400 font-medium">{error.action}</span>
                                    <span className="text-xs text-zinc-500 ml-auto">
                                        {new Date(error.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400 font-mono bg-black/20 p-2 rounded-lg">{JSON.stringify(error.details)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500/50" />
                        <p className="text-zinc-500">No recent system errors</p>
                        <p className="text-xs text-zinc-600 mt-1">All systems optional</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
