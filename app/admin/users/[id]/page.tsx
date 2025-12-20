'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Mail,
    MapPin,
    Building,
    Link2,
    Calendar,
    GitCommit,
    GitPullRequest,
    Flame,
    Trophy,
    UserCheck,
    Trash2,
    ExternalLink,
    Shield,
    History,
    MoreHorizontal
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { formatDistanceToNow, format } from 'date-fns'

interface UserDetail {
    id: string
    username: string
    name: string
    email: string
    avatar_url: string
    bio: string
    location: string
    company: string
    website: string
    is_suspended: boolean
    is_admin: boolean
    suspended_at: string
    suspended_reason: string
    total_commits: number
    total_prs: number
    total_issues: number
    total_repos: number
    current_streak: number
    longest_streak: number
    productivity_score: number
    followers: number
    following: number
    created_at: string
    last_synced: string
}

interface DailyActivity {
    date: string
    total_commits: number
}

export default function UserDetailPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string

    const [user, setUser] = useState<UserDetail | null>(null)
    const [activity, setActivity] = useState<DailyActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    const [suspendModal, setSuspendModal] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users/${userId}?days=30`)
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
                setActivity(data.activity || [])
            } else if (res.status === 404) {
                router.push('/admin/users')
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [userId])

    const handleSuspend = async () => {
        if (!user) return
        setActionLoading(true)

        try {
            const action = user.is_suspended ? 'unsuspend' : 'suspend'
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })

            if (res.ok) {
                fetchUser()
                setSuspendModal(false)
            }
        } catch (error) {
            console.error('Failed to suspend user:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        setActionLoading(true)

        try {
            const res = await fetch(`/api/admin/users/${userId}?permanent=true`, {
                method: 'DELETE'
            })

            if (res.ok) {
                router.push('/admin/users')
            }
        } catch (error) {
            console.error('Failed to delete user:', error)
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading user profile...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    // Prepare chart data
    const chartData = activity.map(a => ({
        date: a.date,
        commits: a.total_commits
    })).reverse()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push('/admin/users')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="font-medium text-sm">Back to Users</span>
                </button>
            </div>

            {/* Profile Header */}
            <div className="relative rounded-3xl overflow-hidden bg-[#09090b] border border-white/10">
                {/* Banner */}
                <div className="h-48 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 w-full relative">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-end -mt-12 gap-6">
                        {/* Avatar */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <div className="w-32 h-32 rounded-3xl bg-[#09090b] p-1.5 shadow-2xl">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="w-full h-full rounded-2xl object-cover bg-zinc-800"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-500">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 translate-x-1/4 translate-y-1/4">
                                <StatusBadge status={user.is_suspended ? 'suspended' : 'active'} glow={true} size="sm" />
                            </div>
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                {user.name || user.username}
                                {user.is_admin && <Shield size={20} className="text-blue-400 fill-blue-400/10" />}
                            </h1>
                            <div className="flex items-center gap-2 text-zinc-500 mt-1">
                                <span>@{user.username}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Joined {format(new Date(user.created_at), 'MMMM yyyy')}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => setSuspendModal(true)}
                                className={`
                                    px-4 py-2.5 rounded-xl font-medium text-sm transition-all border
                                    ${user.is_suspended
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                                    }
                                `}
                            >
                                {user.is_suspended ? 'Unsuspend Access' : 'Suspend Access'}
                            </button>
                            <button
                                onClick={() => setDeleteModal(true)}
                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-3xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <UserCheck size={20} className="text-zinc-400" />
                            About
                        </h3>

                        {user.bio && (
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{user.bio}</p>
                        )}

                        <div className="space-y-4">
                            {user.email && (
                                <div className="flex items-center gap-3 text-sm group">
                                    <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <span className="text-zinc-300">{user.email}</span>
                                </div>
                            )}
                            {user.location && (
                                <div className="flex items-center gap-3 text-sm group">
                                    <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                        <MapPin size={16} />
                                    </div>
                                    <span className="text-zinc-300">{user.location}</span>
                                </div>
                            )}
                            {user.company && (
                                <div className="flex items-center gap-3 text-sm group">
                                    <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                        <Building size={16} />
                                    </div>
                                    <span className="text-zinc-300">{user.company}</span>
                                </div>
                            )}
                            {user.website && (
                                <div className="flex items-center gap-3 text-sm group">
                                    <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                        <Link2 size={16} />
                                    </div>
                                    <a
                                        href={user.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        {user.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex justify-between text-center">
                            <div>
                                <div className="text-xl font-bold text-white">{user.followers}</div>
                                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Followers</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white">{user.following}</div>
                                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Following</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white">{user.total_repos}</div>
                                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Repos</div>
                            </div>
                        </div>
                    </motion.div>

                    <a
                        href={`https://github.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors font-medium"
                    >
                        View on GitHub <ExternalLink size={16} />
                    </a>
                </div>

                {/* Right Column - Stats & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-2xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <GitCommit size={48} />
                            </div>
                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Commits</p>
                            <p className="text-3xl font-bold text-white">{user.total_commits?.toLocaleString() || 0}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 }}
                            className="p-5 rounded-2xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <GitPullRequest size={48} />
                            </div>
                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Pull Requests</p>
                            <p className="text-3xl font-bold text-white">{user.total_prs?.toLocaleString() || 0}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-5 rounded-2xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Flame size={48} className="text-orange-500" />
                            </div>
                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Current Streak</p>
                            <p className="text-3xl font-bold text-white">{user.current_streak || 0} <span className="text-sm font-normal text-zinc-500">days</span></p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 }}
                            className="p-5 rounded-2xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy size={48} className="text-yellow-500" />
                            </div>
                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Impact Score</p>
                            <p className="text-3xl font-bold text-white">{user.productivity_score || 0}</p>
                        </motion.div>
                    </div>

                    {/* Activity Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-3xl bg-[#09090b]/50 border border-white/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <History size={20} className="text-zinc-400" />
                                    Activity History
                                </h3>
                                <p className="text-sm text-zinc-500">Commit volumes over last 30 days</p>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                                Last synced {user.last_synced ? formatDistanceToNow(new Date(user.last_synced), { addSuffix: true }) : 'Never'}
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="userActivityGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 11 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 11 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="commits"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="url(#userActivityGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={suspendModal}
                onClose={() => setSuspendModal(false)}
                onConfirm={handleSuspend}
                title={user.is_suspended ? 'Restoring User Access' : 'Suspending User Access'}
                description={user.is_suspended
                    ? `You are about to restore access for ${user.username}. They will immediately regain ability to log in and use the platform.`
                    : `You are about to suspend ${user.username}. This will revoke their access immediately. You can reverse this later.`
                }
                confirmText={user.is_suspended ? 'Restore Access' : 'Suspend Account'}
                variant={user.is_suspended ? 'success' : 'warning'}
                loading={actionLoading}
            />

            <ConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Permanently Delete User"
                description={`WARNING: This action is irreversible. All data associated with ${user.username} including repositories, stats, and settings will be permanently erased from the database.`}
                confirmText="Delete Permanently"
                variant="danger"
                loading={actionLoading}
            />
        </div>
    )
}
