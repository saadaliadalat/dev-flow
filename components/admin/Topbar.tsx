'use client'

import React from 'react'
import { Search, Bell, Settings, ChevronDown, Monitor, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminTopbarProps {
    user: any
}

export function AdminTopbar({ user }: AdminTopbarProps) {
    const [isSearchFocused, setIsSearchFocused] = React.useState(false)
    const [showProfileMenu, setShowProfileMenu] = React.useState(false)

    return (
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
            {/* Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className={`relative group transition-all duration-300 ${isSearchFocused ? 'w-full' : 'w-64'}`}>
                    <Search
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'
                            }`}
                    />
                    <input
                        type="text"
                        placeholder="Type / to search..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`
                            w-full pl-12 pr-4 py-2.5 
                            bg-white/5 border border-white/10 
                            rounded-2xl text-sm text-white 
                            placeholder:text-zinc-600 
                            focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-4 focus:ring-blue-500/10
                            transition-all duration-300
                        `}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-zinc-500">
                            <span className="text-xs">/</span>
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* System Status Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-emerald-400">System Operational</span>
                </div>

                <div className="h-8 w-px bg-white/10 mx-2" />

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all group">
                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b]" />
                </button>

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-white leading-none">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">SUPER ADMIN</p>
                        </div>
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt={user.name || 'Admin'}
                                className="w-9 h-9 rounded-lg border border-white/10 shadow-sm"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-lg border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white font-bold">
                                {user?.name?.[0] || 'A'}
                            </div>
                        )}
                        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-56 bg-[#09090b] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                            >
                                <div className="p-2 space-y-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                        <Monitor size={16} />
                                        Display
                                    </button>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
