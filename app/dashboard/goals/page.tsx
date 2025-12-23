'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Calendar, Clock, LayoutGrid, List, Trash2, Edit2, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react'

interface Goal {
    id: string
    title: string
    deadline: string | null
    progress: number
    status: 'todo' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    created_at: string
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [formTitle, setFormTitle] = useState('')
    const [formDeadline, setFormDeadline] = useState('')
    const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')

    // Fetch goals on mount
    useEffect(() => {
        fetchGoals()
    }, [])

    async function fetchGoals() {
        try {
            const res = await fetch('/api/goals')
            const data = await res.json()
            if (res.ok) {
                setGoals(data.goals || [])
                setError(null)
            } else if (data.code === 'TABLE_NOT_FOUND') {
                setError('Database table not set up. Please run the SQL setup script.')
            }
        } catch (err) {
            console.error('Error fetching goals:', err)
            setError('Failed to connect to database')
        } finally {
            setIsLoading(false)
        }
    }

    async function createGoal() {
        if (!formTitle.trim()) return

        setIsSaving(true)
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formTitle,
                    deadline: formDeadline || null,
                    priority: formPriority
                })
            })

            const data = await res.json()
            if (res.ok && data.goal) {
                setGoals([data.goal, ...goals])
                closeModal()
                setError(null)
            } else {
                setError(data.error || 'Failed to create goal')
            }
        } catch (err) {
            console.error('Error creating goal:', err)
            setError('Failed to create goal')
        } finally {
            setIsSaving(false)
        }
    }

    async function updateGoal(goalId: string, updates: Partial<Goal>) {
        try {
            const res = await fetch('/api/goals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goalId, ...updates })
            })

            if (res.ok) {
                setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g))
            }
        } catch (err) {
            console.error('Error updating goal:', err)
        }
    }

    async function deleteGoal(goalId: string) {
        try {
            const res = await fetch(`/api/goals?id=${goalId}`, { method: 'DELETE' })
            if (res.ok) {
                setGoals(goals.filter(g => g.id !== goalId))
            }
        } catch (err) {
            console.error('Error deleting goal:', err)
        }
    }

    function openModal(goal?: Goal) {
        if (goal) {
            setEditingGoal(goal)
            setFormTitle(goal.title)
            setFormDeadline(goal.deadline || '')
            setFormPriority(goal.priority)
        } else {
            setEditingGoal(null)
            setFormTitle('')
            setFormDeadline('')
            setFormPriority('medium')
        }
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
        setEditingGoal(null)
        setFormTitle('')
        setFormDeadline('')
        setFormPriority('medium')
    }

    async function handleSubmit() {
        if (editingGoal) {
            await updateGoal(editingGoal.id, {
                title: formTitle,
                deadline: formDeadline || null,
                priority: formPriority
            })
            closeModal()
        } else {
            await createGoal()
        }
    }

    function cycleStatus(goal: Goal) {
        const statuses: Goal['status'][] = ['todo', 'in-progress', 'completed']
        const currentIndex = statuses.indexOf(goal.status)
        const nextStatus = statuses[(currentIndex + 1) % statuses.length]
        updateGoal(goal.id, {
            status: nextStatus,
            progress: nextStatus === 'completed' ? 100 : nextStatus === 'in-progress' ? 50 : 0
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

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
                        onClick={() => openModal()}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Goal
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                    <div className="flex-1">
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                        <p className="text-red-400/60 text-xs mt-1">Run the SQL setup in Supabase to enable Goals.</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {goals.length === 0 && !error ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                        <Target size={32} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No active directives</h3>
                    <p className="text-zinc-500 text-center max-w-sm mb-6">
                        Initialize your first sprint by setting a clear, actionable goal.
                    </p>
                    <button onClick={() => openModal()} className="btn-primary">
                        Initialize Goal
                    </button>
                </div>
            ) : goals.length > 0 && (
                /* Goals Grid */
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {goals.map((goal) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card p-6 group relative overflow-hidden hover:border-purple-500/30 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${goal.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    goal.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        goal.priority === 'low' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {goal.priority}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal(goal)}
                                        className="p-1.5 text-zinc-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                {goal.title}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                                {goal.deadline && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => cycleStatus(goal)}
                                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                                >
                                    {goal.status === 'completed' ? (
                                        <CheckCircle size={14} className="text-emerald-400" />
                                    ) : (
                                        <Clock size={14} />
                                    )}
                                    <span className="capitalize">{goal.status}</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-400">Progress</span>
                                    <span className="text-white font-mono">{goal.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${goal.progress}%` }}
                                        className={`h-full rounded-full transition-all duration-500 ${goal.status === 'completed'
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                                : 'bg-gradient-to-r from-purple-500 to-purple-400'
                                            }`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Goal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                <X size={18} className="text-zinc-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Title</label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g., Refactor API Layer"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Deadline</label>
                                    <input
                                        type="date"
                                        value={formDeadline}
                                        onChange={(e) => setFormDeadline(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Priority</label>
                                    <select
                                        value={formPriority}
                                        onChange={(e) => setFormPriority(e.target.value as any)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving || !formTitle.trim()}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving && <Loader2 size={16} className="animate-spin" />}
                                {editingGoal ? 'Save Changes' : 'Create Goal'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
