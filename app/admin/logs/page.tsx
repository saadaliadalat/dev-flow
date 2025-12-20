'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    ScrollText,
    Filter,
    Download,
    RefreshCw,
    User,
    Settings,
    Bell,
    Flag,
    Trash2,
    UserX,
    UserCheck,
    LogIn,
    Shield
} from 'lucide-react'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { formatDistanceToNow, format } from 'date-fns'

interface LogEntry {
    id: string
    admin_id: string
    admin_username: string
    action: string
    target_type: string
    target_id: string
    target_name: string
    details: Record<string, any>
    created_at: string
}

const actionFilters = [
    { value: '', label: 'All Actions' },
    { value: 'user.suspend', label: 'User Suspended' },
    { value: 'user.unsuspend', label: 'User Unsuspended' },
    { value: 'user.delete', label: 'User Deleted' },
    { value: 'setting.update', label: 'Setting Updated' },
    { value: 'feature_flag.update', label: 'Feature Flag' },
    { value: 'announcement.create', label: 'Announcement Created' },
    { value: 'announcement.update', label: 'Announcement Updated' },
    { value: 'announcement.delete', label: 'Announcement Deleted' }
]

const actionIcons: Record<string, any> = {
    'user.suspend': UserX,
    'user.unsuspend': UserCheck,
    'user.delete': Trash2,
    'user.impersonate': LogIn,
    'setting.update': Settings,
    'announcement.create': Bell,
    'announcement.update': Bell,
    'announcement.delete': Bell,
    'feature_flag.update': Flag,
    'default': Shield
}

const actionColors: Record<string, string> = {
    'user.suspend': 'bg-red-500/10 text-red-400 border-red-500/20',
    'user.unsuspend': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'user.delete': 'bg-red-500/10 text-red-400 border-red-500/20',
    'user.impersonate': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'setting.update': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'announcement.create': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'announcement.update': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'announcement.delete': 'bg-red-500/10 text-red-400 border-red-500/20',
    'feature_flag.update': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'default': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(20)
    const [actionFilter, setActionFilter] = useState('')

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            })
            if (actionFilter) {
                params.set('action', actionFilter)
            }

            const res = await fetch(`/api/admin/logs?${params}`)
            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs || [])
                setTotal(data.total || 0)
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setLoading(false)
        }
    }, [page, limit, actionFilter])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const getActionDescription = (log: LogEntry): string => {
        const target = log.target_name || 'Unknown'

        switch (log.action) {
            case 'user.suspend':
                return `Suspended user "${target}"`
            case 'user.unsuspend':
                return `Unsuspended user "${target}"`
            case 'user.delete':
                return `Deleted user "${target}"${log.details?.permanent ? ' permanently' : ''}`
            case 'user.impersonate':
                return `Impersonated user "${target}"`
            case 'setting.update':
                return `Updated setting "${target}"`
            case 'announcement.create':
                return `Created announcement "${target}"`
            case 'announcement.update':
                return `Updated announcement "${target}"`
            case 'announcement.delete':
                return `Deleted announcement "${target}"`
            case 'feature_flag.update':
                return `${log.details?.enabled ? 'Enabled' : 'Disabled'} feature "${target}"`
            default:
                return log.action
        }
    }

    const exportLogs = () => {
        const csv = [
            ['Timestamp', 'Admin', 'Action', 'Target', 'Details'].join(','),
            ...logs.map(log => [
                format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
                log.admin_username,
                log.action,
                log.target_name || '',
                JSON.stringify(log.details || {}).replace(/,/g, ';')
            ].join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `admin-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display">Audit Logs</h1>
                    <p className="text-zinc-500 mt-1">Track all admin actions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLogs}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={exportLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-zinc-500" />
                    <select
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value)
                            setPage(1)
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                    >
                        {actionFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>{filter.label}</option>
                        ))}
                    </select>
                </div>
                <span className="text-sm text-zinc-500">
                    {total} total entries
                </span>
            </div>

            {/* Logs List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-bg-elevated/50 border border-white/5 overflow-hidden"
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <ScrollText size={32} className="mx-auto mb-2 text-zinc-600" />
                        <p className="text-zinc-500">No logs found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {logs.map((log, index) => {
                            const Icon = actionIcons[log.action] || actionIcons.default
                            const colorClass = actionColors[log.action] || actionColors.default

                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="p-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl border ${colorClass}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-white">
                                                    {log.admin_username || 'System'}
                                                </span>
                                                <span className="text-zinc-400">
                                                    {getActionDescription(log)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-zinc-600 font-mono">
                                                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                                </span>
                                                <span className="text-xs text-zinc-600">
                                                    ({formatDistanceToNow(new Date(log.created_at), { addSuffix: true })})
                                                </span>
                                            </div>
                                            {log.details && Object.keys(log.details).length > 0 && (
                                                <div className="mt-2 p-2 rounded-lg bg-black/20 border border-white/5">
                                                    <pre className="text-xs text-zinc-500 overflow-x-auto">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${colorClass}`}>
                                                {log.action}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {total > limit && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm text-zinc-500">
                            Page {page} of {Math.ceil(total / limit)}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(total / limit)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
