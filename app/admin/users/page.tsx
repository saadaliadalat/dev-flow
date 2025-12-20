'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    MoreHorizontal,
    Shield,
    Trash2,
    Eye,
    Ban,
    UserCheck,
    Mail,
    Plus
} from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface User {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
    created_at: string
    subscription_status: string
    is_suspended: boolean
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [confirmModalType, setConfirmModalType] = useState<'suspend' | 'delete' | null>(null)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data.users)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleAction = async (type: 'suspend' | 'delete') => {
        if (!selectedUser) return

        try {
            const endpoint = `/api/admin/users/${selectedUser.id}/${type === 'suspend' ? (selectedUser.is_suspended ? 'unsuspend' : 'suspend') : 'delete'}`
            const res = await fetch(endpoint, { method: type === 'delete' ? 'DELETE' : 'POST' })

            if (res.ok) {
                fetchUsers() // Refresh list
                setConfirmModalType(null)
                setSelectedUser(null)
            }
        } catch (error) {
            console.error(`Failed to ${type} user:`, error)
        }
    }

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.image ? (
                        <img
                            src={row.original.image}
                            alt={row.original.name || 'User'}
                            className="w-9 h-9 rounded-lg border border-white/10"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-zinc-400">
                                {row.original.name?.[0] || row.original.email[0].toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-white">{row.original.name || 'Unknown'}</div>
                        <div className="text-xs text-zinc-500 font-mono">{row.original.email}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.role === 'admin' && <Shield size={14} className="text-blue-400" />}
                    <span className={`text-xs uppercase font-medium tracking-wider ${row.original.role === 'admin' ? 'text-blue-400' : 'text-zinc-500'}`}>
                        {row.original.role}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <StatusBadge
                        status={row.original.is_suspended ? 'suspended' : 'active'}
                        size="sm"
                    />
                    {row.original.role === 'admin' && (
                        <StatusBadge status="admin" size="sm" glow={false} />
                    )}
                </div>
            )
        },
        {
            accessorKey: 'created_at',
            header: 'Joined',
            cell: ({ row }) => (
                <span className="text-zinc-500 text-xs">
                    {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
                </span>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedUser(user)
                                setConfirmModalType('suspend')
                            }}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${user.is_suspended ? 'text-emerald-500 hover:text-emerald-400' : 'text-yellow-500 hover:text-yellow-400'}`}
                            title={user.is_suspended ? "Unsuspend" : "Suspend"}
                        >
                            {user.is_suspended ? <UserCheck size={16} /> : <Ban size={16} />}
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button
                            onClick={() => {
                                setSelectedUser(user)
                                setConfirmModalType('delete')
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete User"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-zinc-500 mt-1">Manage users, roles, and permissions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-xl text-white transition-all shadow-lg shadow-blue-500/20">
                    <Plus size={18} />
                    <span className="font-medium">Add User</span>
                </button>
            </div>

            {/* Main Content */}
            <DataTable
                columns={columns}
                data={users}
                searchKey="name"
                searchPlaceholder="Search users by name..."
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={!!confirmModalType}
                onClose={() => setConfirmModalType(null)}
                onConfirm={() => confirmModalType && handleAction(confirmModalType)}
                title={confirmModalType === 'suspend'
                    ? (selectedUser?.is_suspended ? 'Unsuspend User?' : 'Suspend User?')
                    : 'Delete User?'}
                description={confirmModalType === 'suspend'
                    ? `Are you sure you want to ${selectedUser?.is_suspended ? 'unsuspend' : 'suspend'} ${selectedUser?.name}? They will ${selectedUser?.is_suspended ? 'regain' : 'lose'} access.`
                    : `Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
                variant={confirmModalType === 'delete' ? 'danger' : 'warning'}
                loading={false}
            />
        </div>
    )
}
