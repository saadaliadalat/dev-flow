'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Server,
    Database,
    Cpu,
    HardDrive,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock,
    Zap,
    Activity
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

    const getProgressColor = (percentage: number) => {
        if (percentage > 80) return 'bg-emerald-500'
        if (percentage > 50) return 'bg-yellow-500'
        return 'bg-red-500'
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display">System</h1>
                    <p className="text-zinc-500 mt-1">Monitor system health and resources</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* System Health */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">System Health</h3>
                    <StatusBadge
                        status={metrics?.health.status === 'healthy' ? 'success' : 'warning'}
                        pulse
                    />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Server size={24} className="text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium text-white">Status</p>
                        <p className="text-xs text-emerald-400 capitalize">{metrics?.health.status}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Activity size={24} className="text-cyan-400" />
                        </div>
                        <p className="text-sm font-medium text-white">Uptime</p>
                        <p className="text-xs text-cyan-400">{metrics?.health.uptime}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <Zap size={24} className="text-purple-400" />
                        </div>
                        <p className="text-sm font-medium text-white">Response Time</p>
                        <p className="text-xs text-purple-400">{metrics?.health.responseTime}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <Clock size={24} className="text-yellow-400" />
                        </div>
                        <p className="text-sm font-medium text-white">Last Check</p>
                        <p className="text-xs text-yellow-400">Just now</p>
                    </div>
                </div>
            </motion.div>

            {/* API Quotas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-zinc-800">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-white">GitHub API</h3>
                            <p className="text-xs text-zinc-500">Rate limit status</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Remaining</span>
                            <span className="text-white font-mono">{metrics?.api.github.remaining} / {metrics?.api.github.limit}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${getProgressColor((metrics?.api.github.remaining || 0) / (metrics?.api.github.limit || 1) * 100)}`}
                                style={{ width: `${(metrics?.api.github.remaining || 0) / (metrics?.api.github.limit || 1) * 100}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Resets in</span>
                            <span className="text-zinc-400">{metrics?.api.github.resetAt ? formatTimeUntil(metrics.api.github.resetAt) : '-'}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Zap size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Gemini AI API</h3>
                            <p className="text-xs text-zinc-500">Daily quota status</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Remaining</span>
                            <span className="text-white font-mono">{metrics?.api.gemini.remaining} / {metrics?.api.gemini.limit}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${getProgressColor((metrics?.api.gemini.remaining || 0) / (metrics?.api.gemini.limit || 1) * 100)}`}
                                style={{ width: `${(metrics?.api.gemini.remaining || 0) / (metrics?.api.gemini.limit || 1) * 100}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Resets in</span>
                            <span className="text-zinc-400">{metrics?.api.gemini.resetAt ? formatTimeUntil(metrics.api.gemini.resetAt) : '-'}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Background Jobs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <h3 className="text-lg font-bold text-white mb-6">Background Jobs</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider pb-3">Job</th>
                                <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider pb-3">Schedule</th>
                                <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider pb-3">Last Run</th>
                                <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider pb-3">Status</th>
                                <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider pb-3">Next Run</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics?.jobs.map((job, index) => (
                                <tr key={index} className="border-b border-white/5">
                                    <td className="py-4 text-sm text-white font-medium">{job.name}</td>
                                    <td className="py-4">
                                        <code className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">{job.schedule}</code>
                                    </td>
                                    <td className="py-4 text-sm text-zinc-400">
                                        {new Date(job.lastRun).toLocaleString()}
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(job.status)}
                                            <span className={`text-sm capitalize ${job.status === 'success' ? 'text-emerald-400' : job.status === 'error' ? 'text-red-400' : 'text-blue-400'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-zinc-400">
                                        {new Date(job.nextRun).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Database Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Database size={20} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Database Statistics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {metrics?.database && Object.entries(metrics.database).map(([table, count]) => (
                        <div key={table} className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-2xl font-bold text-white">{count.toLocaleString()}</p>
                            <p className="text-xs text-zinc-500 font-mono uppercase">{table.replace('_', ' ')}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Errors */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <h3 className="text-lg font-bold text-white mb-6">Recent Errors</h3>
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
                                <p className="text-sm text-zinc-400">{JSON.stringify(error.details)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
                        <p className="text-zinc-500">No recent errors</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
