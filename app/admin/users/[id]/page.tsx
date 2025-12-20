'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    User,
    Mail,
    MapPin,
    Building,
    Link2,
    Calendar,
    GitCommit,
    GitPullRequest,
    Flame,
    Trophy,
    UserX,
    UserCheck,
    Trash2,
    RefreshCw,
    ExternalLink
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500">User not found</p>
            </div>
        )
    }

    // Prepare chart data
    const chartData = activity.map(a => ({
        date: a.date,
        commits: a.total_commits
    })).reverse()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/users')}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white font-display">User Details</h1>
                    <p className="text-zinc-500">@{user.username}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSuspendModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${user.is_suspended
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                            }`}
                    >
                        {user.is_suspended ? <UserCheck size={16} /> : <UserX size={16} />}
                        {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button
                        onClick={() => setDeleteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="text-center mb-6">
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.username}
                                className="w-24 h-24 rounded-full border-2 border-white/10 mx-auto mb-4"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-white">{user.name || user.username}</h2>
                        <p className="text-zinc-500">@{user.username}</p>

                        <div className="flex items-center justify-center gap-2 mt-3">
                            <StatusBadge
                                status={user.is_suspended ? 'suspended' : 'active'}
                            />
                            {user.is_admin && (
                                <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-lg">
                                    ADMIN
                                </span>
                            )}
                        </div>
                    </div>

                    {user.bio && (
                        <p className="text-sm text-zinc-400 text-center mb-6">{user.bio}</p>
                    )}

                    <div className="space-y-3">
                        {user.email && (
                            <div className="flex items-center gap-3 text-sm">
                                <Mail size={16} className="text-zinc-500" />
                                <span className="text-zinc-300">{user.email}</span>
                            </div>
                        )}
                        {user.location && (
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin size={16} className="text-zinc-500" />
                                <span className="text-zinc-300">{user.location}</span>
                            </div>
                        )}
                        {user.company && (
                            <div className="flex items-center gap-3 text-sm">
                                <Building size={16} className="text-zinc-500" />
                                <span className="text-zinc-300">{user.company}</span>
                            </div>
                        )}
                        {user.website && (
                            <div className="flex items-center gap-3 text-sm">
                                <Link2 size={16} className="text-zinc-500" />
                                <a
                                    href={user.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-300 hover:text-white transition-colors"
                                >
                                    {user.website}
                                </a>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar size={16} className="text-zinc-500" />
                            <span className="text-zinc-300">
                                Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/5">
                        <div className="text-center">
                            <p className="text-lg font-bold text-white">{user.followers}</p>
                            <p className="text-xs text-zinc-500">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-white">{user.following}</p>
                            <p className="text-xs text-zinc-500">Following</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-white">{user.total_repos}</p>
                            <p className="text-xs text-zinc-500">Repos</p>
                        </div>
                    </div>

                    <a
                        href={`https://github.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        View on GitHub <ExternalLink size={14} />
                    </a>
                </motion.div>

                {/* Stats & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <GitCommit size={16} className="text-purple-400" />
                                <span className="text-xs text-zinc-500 font-mono uppercase">Commits</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{user.total_commits?.toLocaleString() || 0}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <GitPullRequest size={16} className="text-green-400" />
                                <span className="text-xs text-zinc-500 font-mono uppercase">PRs</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{user.total_prs?.toLocaleString() || 0}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Flame size={16} className="text-orange-400" />
                                <span className="text-xs text-zinc-500 font-mono uppercase">Streak</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{user.current_streak || 0} days</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy size={16} className="text-yellow-400" />
                                <span className="text-xs text-zinc-500 font-mono uppercase">Score</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{user.productivity_score || 0}</p>
                        </motion.div>
                    </div>

                    {/* Activity Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Activity (Last 30 Days)</h3>
                                <p className="text-sm text-zinc-500">Daily commit activity</p>
                            </div>
                            <p className="text-sm text-zinc-500">
                                Last synced: {user.last_synced
                                    ? formatDistanceToNow(new Date(user.last_synced), { addSuffix: true })
                                    : 'Never'}
                            </p>
                        </div>

                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="userActivityGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 10 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        interval={6}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 10 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="commits"
                                        stroke="#a855f7"
                                        strokeWidth={2}
                                        fill="url(#userActivityGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Account Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-zinc-500 font-mono uppercase mb-1">User ID</p>
                                <p className="text-sm text-white font-mono">{user.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Created At</p>
                                <p className="text-sm text-white">{format(new Date(user.created_at), 'PPpp')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Status</p>
                                <p className="text-sm text-white">{user.is_suspended ? 'Suspended' : 'Active'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Role</p>
                                <p className="text-sm text-white">{user.is_admin ? 'Administrator' : 'User'}</p>
                            </div>
                            {user.is_suspended && (
                                <>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Suspended At</p>
                                        <p className="text-sm text-white">
                                            {user.suspended_at ? format(new Date(user.suspended_at), 'PPpp') : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Reason</p>
                                        <p className="text-sm text-white">{user.suspended_reason || 'No reason provided'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={suspendModal}
                onClose={() => setSuspendModal(false)}
                onConfirm={handleSuspend}
                title={user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
                message={user.is_suspended
                    ? `Are you sure you want to unsuspend ${user.username}? They will regain access to their account.`
                    : `Are you sure you want to suspend ${user.username}? They will lose access to their account until unsuspended.`
                }
                confirmText={user.is_suspended ? 'Unsuspend' : 'Suspend'}
                variant={user.is_suspended ? 'default' : 'warning'}
                loading={actionLoading}
            />

            <ConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete User Permanently"
                message={`Are you sure you want to permanently delete ${user.username}? This action cannot be undone and all their data will be lost forever.`}
                confirmText="Delete Forever"
                variant="danger"
                loading={actionLoading}
            />
        </div>
    )
}
