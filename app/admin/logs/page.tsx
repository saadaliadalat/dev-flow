'use client'

import React, { useEffect, useState } from 'react'
import {
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
    Shield,
    FileJson
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { DataTable } from '@/components/admin/DataTable'
import { ColumnDef } from '@tanstack/react-table'

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
    'user.suspend': 'text-red-400 bg-red-400/10 border-red-400/20',
    'user.unsuspend': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'user.delete': 'text-red-400 bg-red-400/10 border-red-400/20',
    'user.impersonate': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'setting.update': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'announcement.create': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'announcement.update': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'announcement.delete': 'text-red-400 bg-red-400/10 border-red-400/20',
    'feature_flag.update': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'default': 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/logs?limit=100`)
            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs || [])
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const columns: ColumnDef<LogEntry>[] = [
        {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => {
                const action = row.original.action
                const Icon = actionIcons[action] || actionIcons.default
                const colorClass = actionColors[action] || actionColors.default

                return (
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${colorClass}`}>
                            <Icon size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-white capitalize">
                                {action.replace('.', ' ')}
                            </span>
                            <span className="text-xs text-zinc-500">
                                by {row.original.admin_username}
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'target',
            header: 'Target',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-zinc-300 font-medium">{row.original.target_name || 'N/A'}</span>
                    <span className="text-xs text-zinc-500 font-mono">{row.original.target_id}</span>
                </div>
            )
        },
        {
            accessorKey: 'details',
            header: 'Details',
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate text-xs text-zinc-500 font-mono">
                    {JSON.stringify(row.original.details)}
                </div>
            )
        },
        {
            accessorKey: 'created_at',
            header: 'Time',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-zinc-300">
                        {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-zinc-500">
                        {format(new Date(row.original.created_at), 'MMM d, HH:mm')}
                    </span>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
                    <p className="text-zinc-500 mt-1">Comprehensive record of all administrative actions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLogs}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Refresh Logs"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <DataTable
                columns={columns}
                data={logs}
                searchKey="target_name"
                searchPlaceholder="Search by target..."
            />
        </div>
    )
}
