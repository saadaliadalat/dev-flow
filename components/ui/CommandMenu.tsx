'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Settings,
    Plus,
    Code,
    Search,
    Brain,
    Trophy,
    Target
} from 'lucide-react'

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                    >
                        <Command className="bg-transparent">
                            <div className="flex items-center border-b border-zinc-800 px-4">
                                <Search className="mr-2 h-5 w-5 shrink-0 text-zinc-500" />
                                <Command.Input
                                    placeholder="Type a command or search..."
                                    className="flex h-12 w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-500 font-sans"
                                />
                                <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden py-2 px-2">
                                <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                                    No results found.
                                </Command.Empty>

                                <Command.Group heading="Navigation" className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1.5 mb-1">
                                    <CommandItem
                                        icon={LayoutDashboard}
                                        label="Go to Dashboard"
                                        onSelect={() => runCommand(() => router.push('/dashboard'))}
                                    />
                                    <CommandItem
                                        icon={Brain}
                                        label="AI Insights"
                                        onSelect={() => runCommand(() => router.push('/dashboard/insights'))}
                                    />
                                    <CommandItem
                                        icon={Target}
                                        label="Goals & Directives"
                                        onSelect={() => runCommand(() => router.push('/dashboard/goals'))}
                                    />
                                    <CommandItem
                                        icon={Trophy}
                                        label="Achievements"
                                        onSelect={() => runCommand(() => router.push('/dashboard/achievements'))}
                                    />
                                    <CommandItem
                                        icon={Settings}
                                        label="Settings"
                                        onSelect={() => runCommand(() => router.push('/dashboard/settings'))}
                                    />
                                </Command.Group>

                                <Command.Group heading="Actions" className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1.5 mb-1 mt-2">
                                    <CommandItem
                                        icon={Plus}
                                        label="Create New Goal"
                                        shortcut="G"
                                        onSelect={() => runCommand(() => router.push('/dashboard/goals?action=create'))}
                                    />
                                    <CommandItem
                                        icon={Code}
                                        label="Analyze Code"
                                        shortcut="A"
                                        onSelect={() => runCommand(() => router.push('/dashboard/analytics'))}
                                    />
                                </Command.Group>
                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

function CommandItem({
    icon: Icon,
    label,
    shortcut,
    onSelect
}: {
    icon: any
    label: string
    shortcut?: string
    onSelect: () => void
}) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="group flex items-center justify-between rounded-lg px-2 py-2 text-sm text-zinc-400 aria-selected:bg-purple-500/10 aria-selected:text-purple-400 cursor-pointer transition-colors"
        >
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 transition-colors group-aria-selected:text-purple-400" />
                <span>{label}</span>
            </div>
            {shortcut && (
                <span className="text-xs text-zinc-600 group-aria-selected:text-purple-500/50 font-mono">
                    {shortcut}
                </span>
            )}
        </Command.Item>
    )
}
