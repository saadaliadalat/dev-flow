'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import {
    Github,
    RefreshCw,
    Share2,
    Settings,
    BarChart3,
    Users,
    Trophy,
    Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
    onSync: () => void
    isSyncing: boolean
}

export function QuickActions({ onSync, isSyncing }: QuickActionsProps) {
    const router = useRouter()

    const actions = [
        {
            icon: RefreshCw,
            label: 'Sync GitHub',
            description: 'Update your stats',
            onClick: onSync,
            loading: isSyncing,
            primary: true
        },
        {
            icon: Share2,
            label: 'Share Profile',
            description: 'Show off your stats',
            onClick: () => router.push('/share'),
        },
        {
            icon: Users,
            label: 'Leaderboard',
            description: 'See top devs',
            onClick: () => router.push('/leaderboard'),
        },
        {
            icon: Trophy,
            label: 'Achievements',
            description: 'View badges',
            onClick: () => router.push('/achievements'),
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, i) => (
                <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={action.onClick}
                    disabled={action.loading}
                    className={`
                        group p-4 rounded-2xl border transition-all duration-200
                        ${action.primary
                            ? 'bg-white text-black border-transparent hover:bg-zinc-200'
                            : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    <div className="flex flex-col items-center text-center gap-2">
                        <action.icon
                            className={`w-6 h-6 ${action.loading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}
                        />
                        <div>
                            <p className="font-semibold text-sm">{action.label}</p>
                            <p className={`text-xs ${action.primary ? 'text-black/60' : 'text-zinc-500'}`}>
                                {action.description}
                            </p>
                        </div>
                    </div>
                </motion.button>
            ))}
        </div>
    )
}
