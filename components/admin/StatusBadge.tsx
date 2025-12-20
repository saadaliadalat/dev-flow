'use client'

import React from 'react'

interface StatusBadgeProps {
    status: 'active' | 'suspended' | 'pending' | 'success' | 'warning' | 'error' | 'info'
    size?: 'sm' | 'md' | 'lg'
    pulse?: boolean
}

const statusConfig = {
    active: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500',
        label: 'Active'
    },
    suspended: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        dot: 'bg-red-500',
        label: 'Suspended'
    },
    pending: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/20',
        dot: 'bg-yellow-500',
        label: 'Pending'
    },
    success: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500',
        label: 'Success'
    },
    warning: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/20',
        dot: 'bg-yellow-500',
        label: 'Warning'
    },
    error: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        dot: 'bg-red-500',
        label: 'Error'
    },
    info: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/20',
        dot: 'bg-blue-500',
        label: 'Info'
    }
}

const sizeConfig = {
    sm: {
        padding: 'px-2 py-0.5',
        text: 'text-xs',
        dot: 'w-1.5 h-1.5'
    },
    md: {
        padding: 'px-2.5 py-1',
        text: 'text-xs',
        dot: 'w-2 h-2'
    },
    lg: {
        padding: 'px-3 py-1.5',
        text: 'text-sm',
        dot: 'w-2.5 h-2.5'
    }
}

export function StatusBadge({ status, size = 'md', pulse = false }: StatusBadgeProps) {
    const config = statusConfig[status]
    const sizeClass = sizeConfig[size]

    return (
        <span className={`inline-flex items-center gap-1.5 ${sizeClass.padding} rounded-full ${config.bg} ${config.text} border ${config.border} ${sizeClass.text} font-medium`}>
            <span className="relative flex">
                {pulse && (
                    <span className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75 animate-ping`} />
                )}
                <span className={`relative inline-flex rounded-full ${sizeClass.dot} ${config.dot}`} />
            </span>
            {config.label}
        </span>
    )
}
