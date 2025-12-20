'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
    User,
    Settings,
    Trash2,
    Bell,
    Shield,
    UserX,
    UserCheck,
    LogIn,
    RefreshCw,
    Flag,
    MessageSquare
} from 'lucide-react'

interface ActivityItem {
    id: string
    admin_username?: string
    action: string
    target_type?: string
    target_name?: string
    details?: Record<string, any>
    created_at: string
}

interface ActivityFeedProps {
    items: ActivityItem[]
    loading?: boolean
    maxItems?: number
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
    'system.sync': RefreshCw,
    'default': Shield
}

const actionColors: Record<string, string> = {
    'user.suspend': 'text-red-400 bg-red-500/10',
    'user.unsuspend': 'text-emerald-400 bg-emerald-500/10',
    'user.delete': 'text-red-400 bg-red-500/10',
    'user.impersonate': 'text-yellow-400 bg-yellow-500/10',
    'setting.update': 'text-blue-400 bg-blue-500/10',
    'announcement.create': 'text-purple-400 bg-purple-500/10',
    'announcement.update': 'text-purple-400 bg-purple-500/10',
    'announcement.delete': 'text-red-400 bg-red-500/10',
    'feature_flag.update': 'text-cyan-400 bg-cyan-500/10',
    'system.sync': 'text-green-400 bg-green-500/10',
    'default': 'text-zinc-400 bg-zinc-500/10'
}

function getActionDescription(item: ActivityItem): string {
    const target = item.target_name || 'Unknown'

    switch (item.action) {
        case 'user.suspend':
            return `Suspended user "${target}"`
        case 'user.unsuspend':
            return `Unsuspended user "${target}"`
        case 'user.delete':
            return `Deleted user "${target}"`
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
            return `Toggled feature "${target}"`
        case 'system.sync':
            return 'Triggered system sync'
        default:
            return item.action
    }
}

export function ActivityFeed({ items, loading = false, maxItems = 10 }: ActivityFeedProps) {
    const displayItems = items.slice(0, maxItems)

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-white/5" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-white/5 rounded" />
                            <div className="h-3 w-1/4 bg-white/5 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (displayItems.length === 0) {
        return (
            <div className="text-center py-8">
                <Shield className="mx-auto mb-2 text-zinc-600" size={32} />
                <p className="text-zinc-500 text-sm">No recent activity</p>
            </div>
        )
    }

    return (
        <div className="space-y-1">
            {displayItems.map((item, index) => {
                const Icon = actionIcons[item.action] || actionIcons.default
                const colorClass = actionColors[item.action] || actionColors.default

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white leading-snug">
                                <span className="font-medium text-white">{item.admin_username || 'System'}</span>
                                <span className="text-zinc-400 ml-1">{getActionDescription(item)}</span>
                            </p>
                            <p className="text-xs text-zinc-600 mt-1 font-mono">
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
