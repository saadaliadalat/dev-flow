'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Users,
    Search,
    Filter,
    UserX,
    UserCheck,
    Trash2,
    MoreHorizontal,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { formatDistanceToNow } from 'date-fns'

interface User {
    id: string
    username: string
    name: string
    email: string
    avatar_url: string
    is_suspended: boolean
    is_admin: boolean
    total_commits: number
    created_at: string
    last_synced: string
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<'all' | 'active' | 'suspended'>('all')
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Modal states
    const [suspendModal, setSuspendModal] = useState<{ open: boolean, user: User | null }>({ open: false, user: null })
    const [deleteModal, setDeleteModal] = useState<{ open: boolean, user: User | null }>({ open: false, user: null })
    const [actionLoading, setActionLoading] = useState(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                status,
                sortBy,
                sortOrder
            })

            const res = await fetch(`/api/admin/users?${params}`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data.users)
                setTotal(data.total)
                setTotalPages(data.totalPages)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }, [page, limit, search, status, sortBy, sortOrder])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('desc')
        }
    }

    const handleSuspend = async () => {
        if (!suspendModal.user) return
        setActionLoading(true)

        try {
            const action = suspendModal.user.is_suspended ? 'unsuspend' : 'suspend'
            const res = await fetch(`/api/admin/users/${suspendModal.user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })

            if (res.ok) {
                fetchUsers()
                setSuspendModal({ open: false, user: null })
            }
        } catch (error) {
            console.error('Failed to suspend user:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.user) return
        setActionLoading(true)

        try {
            const res = await fetch(`/api/admin/users/${deleteModal.user.id}?permanent=true`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchUsers()
                setDeleteModal({ open: false, user: null })
            }
        } catch (error) {
            console.error('Failed to delete user:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const columns = [
        {
            key: 'user',
            label: 'User',
            render: (user: User) => (
                <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                        <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full border border-white/10"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{user.name || user.username}</p>
                            {user.is_admin && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-400 rounded">
                                    ADMIN
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500">@{user.username}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            render: (user: User) => (
                <span className="text-sm text-zinc-400">{user.email || '-'}</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (user: User) => (
                <StatusBadge
                    status={user.is_suspended ? 'suspended' : 'active'}
                    size="sm"
                />
            )
        },
        {
            key: 'total_commits',
            label: 'Commits',
            sortable: true,
            render: (user: User) => (
                <span className="text-sm text-white font-mono">{user.total_commits?.toLocaleString() || 0}</span>
            )
        },
        {
            key: 'created_at',
            label: 'Joined',
            sortable: true,
            render: (user: User) => (
                <span className="text-sm text-zinc-500">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </span>
            )
        },
        {
            key: 'last_synced',
            label: 'Last Active',
            sortable: true,
            render: (user: User) => (
                <span className="text-sm text-zinc-500">
                    {user.last_synced
                        ? formatDistanceToNow(new Date(user.last_synced), { addSuffix: true })
                        : 'Never'}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            width: 'w-20',
            render: (user: User) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => setSuspendModal({ open: true, user })}
                        className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${user.is_suspended
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-yellow-400 hover:text-yellow-300'
                            }`}
                        title={user.is_suspended ? 'Unsuspend' : 'Suspend'}
                    >
                        {user.is_suspended ? <UserCheck size={16} /> : <UserX size={16} />}
                    </button>
                    <button
                        onClick={() => setDeleteModal({ open: true, user })}
                        className="p-2 rounded-lg hover:bg-white/5 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display">Users</h1>
                    <p className="text-zinc-500 mt-1">Manage all registered users</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-zinc-500" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                    >
                        <option value="all">All Users</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-sm text-zinc-400">{selectedIds.length} selected</span>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-xs text-zinc-500 hover:text-white"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                >
                    <p className="text-2xl font-bold text-white">{total}</p>
                    <p className="text-xs text-zinc-500 font-mono uppercase">Total Users</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                >
                    <p className="text-2xl font-bold text-emerald-400">
                        {users.filter(u => !u.is_suspended).length}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono uppercase">Active (this page)</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                >
                    <p className="text-2xl font-bold text-red-400">
                        {users.filter(u => u.is_suspended).length}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono uppercase">Suspended (this page)</p>
                </motion.div>
            </div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-bg-elevated/50 border border-white/5 p-6"
            >
                <DataTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    getRowId={(user) => user.id}
                    pagination={{
                        page,
                        limit,
                        total,
                        totalPages,
                        onPageChange: setPage,
                        onLimitChange: (newLimit) => {
                            setLimit(newLimit)
                            setPage(1)
                        }
                    }}
                    sorting={{
                        sortBy,
                        sortOrder,
                        onSort: handleSort
                    }}
                    emptyMessage="No users found"
                />
            </motion.div>

            {/* Suspend Modal */}
            <ConfirmModal
                isOpen={suspendModal.open}
                onClose={() => setSuspendModal({ open: false, user: null })}
                onConfirm={handleSuspend}
                title={suspendModal.user?.is_suspended ? 'Unsuspend User' : 'Suspend User'}
                message={suspendModal.user?.is_suspended
                    ? `Are you sure you want to unsuspend ${suspendModal.user?.username}? They will regain access to their account.`
                    : `Are you sure you want to suspend ${suspendModal.user?.username}? They will lose access to their account until unsuspended.`
                }
                confirmText={suspendModal.user?.is_suspended ? 'Unsuspend' : 'Suspend'}
                variant={suspendModal.user?.is_suspended ? 'default' : 'warning'}
                loading={actionLoading}
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, user: null })}
                onConfirm={handleDelete}
                title="Delete User Permanently"
                message={`Are you sure you want to permanently delete ${deleteModal.user?.username}? This action cannot be undone and all their data will be lost forever.`}
                confirmText="Delete Forever"
                variant="danger"
                loading={actionLoading}
            />
        </div>
    )
}
