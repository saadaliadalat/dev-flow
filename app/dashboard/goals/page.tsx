'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Calendar, CheckCircle2, Clock, MoreHorizontal, LayoutGrid, List } from 'lucide-react'

// Mock Data
const initialGoals = [
    {
        id: 1,
        title: 'Master TypeScript Generics',
        deadline: '2025-01-15',
        progress: 65,
        status: 'in-progress',
        priority: 'high'
    },
    {
        id: 2,
        title: 'Refactor Auth System',
        deadline: '2025-02-01',
        progress: 30,
        status: 'todo',
        priority: 'medium'
    },
    {
        id: 3,
        title: 'Launch MVP v1.0',
        deadline: '2024-12-31',
        progress: 90,
        status: 'in-progress',
        priority: 'critical'
    }
]

export default function GoalsPage() {
    const [goals, setGoals] = useState(initialGoals)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Goals & Directives</h1>
                    <p className="text-[var(--text-tertiary)]">Track your high-level engineering objectives.</p>
                </div>
                <div className="flex gap-3">
                    <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded hover:bg-zinc-800 transition-colors ${viewMode === 'grid' ? 'text-white bg-zinc-800' : 'text-zinc-500'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded hover:bg-zinc-800 transition-colors ${viewMode === 'list' ? 'text-white bg-zinc-800' : 'text-zinc-500'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Goal
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {goals.length === 0 ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                        <Target size={32} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No active directives</h3>
                    <p className="text-zinc-500 text-center max-w-sm mb-6">
                        Initialize your first sprint by setting a clear, actionable goal.
                    </p>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Initialize Goal
                    </button>
                </div>
            ) : (
                /* Goals Grid */
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {goals.map((goal) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card p-6group relative overflow-hidden group hover:border-purple-500/30 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${goal.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        goal.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {goal.priority}
                                </span>
                                <button className="text-zinc-600 hover:text-white transition-colors">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                {goal.title}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    <span>{goal.deadline}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span className="capitalize">{goal.status}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-400">Progress</span>
                                    <span className="text-white font-mono">{goal.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${goal.progress}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Goal Modal (Mock) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">Create New Goal</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Title</label>
                                <input type="text" placeholder="e.g., Refactor API Layer" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Deadline</label>
                                    <input type="date" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Priority</label>
                                    <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none">
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium">Cancel</button>
                            <button onClick={() => setIsModalOpen(false)} className="btn-primary">Create Goal</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
