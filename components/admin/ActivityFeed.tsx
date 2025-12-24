'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    GitCommit,
    GitPullRequest,
    UserPlus,
    UserX,
    Shield,
    Lock,
    Key,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
    id: string
    action: string
    details: string
    created_at: string
    admin_email: string
    type?: 'info' | 'success' | 'warning' | 'error'
}

interface ActivityFeedProps {
    items: ActivityItem[]
    loading?: boolean
    maxItems?: number
}

const getIconForAction = (action: string) => {
    if (action.includes('LOGIN')) return Lock
    if (action.includes('USER_')) return UserPlus
    if (action.includes('SETTINGS')) return Key
    if (action.includes('SYSTEM')) return AlertCircle
    return Shield
}

const getColorForAction = (action: string) => {
    if (action.includes('ERROR') || action.includes('failed')) return 'text-red-400 bg-red-500/10 border-red-500/20'
    if (action.includes('SUCCESS') || action.includes('created')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (action.includes('WARNING')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
}

export function ActivityFeed({ items, loading = false, maxItems = 5 }: ActivityFeedProps) {
    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-white/5" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-white/5 rounded w-3/4" />
                            <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Clock size={48} className="mb-4 opacity-20" />
                <p>No recent activity</p>
            </div>
        )
    }

    const displayItems = maxItems ? items.slice(0, maxItems) : items

    return (
        <div className="relative space-y-0">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/5" />

            {displayItems.map((item, index) => {
                const Icon = getIconForAction(item.action)
                const colorClass = getColorForAction(item.action)

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-12 py-3 group"
                    >
                        {/* Dot/Icon on Timeline */}
                        <div className={`
                            absolute left-0 top-3 w-10 h-10 rounded-full border flex items-center justify-center z-10 
                            transition-transform duration-300 group-hover:scale-110 bg-[#09090b]
                            ${colorClass}
                        `}>
                            <Icon size={16} />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                                <p className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                                    {item.action.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    by <span className="text-zinc-400">{item.admin_email}</span>
                                </p>
                            </div>

                            <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap bg-white/5 px-2 py-1 rounded">
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </span>
                        </div>

                        <div className="mt-1.5 p-2 bg-white/5 rounded-lg border border-white/5 text-xs text-zinc-400 font-mono">
                            {typeof item.details === 'object' ? JSON.stringify(item.details) : item.details}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
