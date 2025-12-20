'use client'

import React from 'react'
import { CheckCircle2, XCircle, AlertCircle, Clock, Ban } from 'lucide-react'

export type StatusType = 'active' | 'inactive' | 'suspended' | 'pending' | 'banned' | 'warning' | 'success' | 'error'

interface StatusBadgeProps {
    status: StatusType | string
    size?: 'sm' | 'md'
    glow?: boolean
}

const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
        case 'success':
            return {
                icon: CheckCircle2,
                colors: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
            }
        case 'inactive':
        case 'pending':
            return {
                icon: Clock,
                colors: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
                glow: 'shadow-[0_0_15px_-3px_rgba(113,113,122,0.3)]'
            }
        case 'suspended':
        case 'banned':
        case 'error':
            return {
                icon: Ban,
                colors: 'text-red-400 bg-red-500/10 border-red-500/20',
                glow: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]'
            }
        case 'warning':
            return {
                icon: AlertCircle,
                colors: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                glow: 'shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]'
            }
        default:
            return {
                icon: Clock,
                colors: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]'
            }
    }
}

export function StatusBadge({ status, size = 'md', glow = true }: StatusBadgeProps) {
    const config = getStatusConfig(status)
    const Icon = config.icon

    return (
        <span className={`
            inline-flex items-center gap-1.5 
            rounded-full border font-medium transition-all duration-300
            ${config.colors}
            ${glow ? config.glow : ''}
            ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}
        `}>
            <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2} />
            <span className="capitalize">{status}</span>
        </span>
    )
}
