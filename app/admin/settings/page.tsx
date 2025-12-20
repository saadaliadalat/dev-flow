'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings,
    Flag,
    Bell,
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    AlertTriangle,
    Info,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import { ConfirmModal } from '@/components/admin/ConfirmModal'

interface FeatureFlag {
    id: string
    name: string
    description: string
    is_enabled: boolean
}

interface Announcement {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    is_active: boolean
    show_on_dashboard: boolean
    show_on_landing: boolean
    created_at: string
}

export default function AdminSettingsPage() {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    // Announcement modal
    const [announcementModal, setAnnouncementModal] = useState<{
        open: boolean
        mode: 'create' | 'edit'
        announcement?: Announcement
    }>({ open: false, mode: 'create' })

    const [deleteModal, setDeleteModal] = useState<{ open: boolean, id: string | null }>({ open: false, id: null })

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'warning' | 'success' | 'error',
        show_on_dashboard: true,
        show_on_landing: false
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const [settingsRes, announcementsRes] = await Promise.all([
                fetch('/api/admin/settings'),
                fetch('/api/admin/announcements')
            ])

            if (settingsRes.ok) {
                const data = await settingsRes.json()
                setFeatureFlags(data.featureFlags || [])
            }

            if (announcementsRes.ok) {
                const data = await announcementsRes.json()
                setAnnouncements(data.announcements || [])
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleFeatureFlag = async (flag: FeatureFlag) => {
        setSaving(flag.id)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'feature_flag',
                    id: flag.id,
                    key: flag.name,
                    value: !flag.is_enabled
                })
            })

            if (res.ok) {
                setFeatureFlags(flags =>
                    flags.map(f => f.id === flag.id ? { ...f, is_enabled: !f.is_enabled } : f)
                )
            }
        } catch (error) {
            console.error('Failed to toggle feature flag:', error)
        } finally {
            setSaving(null)
        }
    }

    const openCreateModal = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            show_on_dashboard: true,
            show_on_landing: false
        })
        setAnnouncementModal({ open: true, mode: 'create' })
    }

    const openEditModal = (announcement: Announcement) => {
        setFormData({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            show_on_dashboard: announcement.show_on_dashboard,
            show_on_landing: announcement.show_on_landing
        })
        setAnnouncementModal({ open: true, mode: 'edit', announcement })
    }

    const saveAnnouncement = async () => {
        setSaving('announcement')
        try {
            if (announcementModal.mode === 'create') {
                const res = await fetch('/api/admin/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                if (res.ok) {
                    fetchSettings()
                }
            } else if (announcementModal.announcement) {
                const res = await fetch(`/api/admin/announcements/${announcementModal.announcement.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                if (res.ok) {
                    fetchSettings()
                }
            }
            setAnnouncementModal({ open: false, mode: 'create' })
        } catch (error) {
            console.error('Failed to save announcement:', error)
        } finally {
            setSaving(null)
        }
    }

    const toggleAnnouncement = async (announcement: Announcement) => {
        setSaving(announcement.id)
        try {
            const res = await fetch(`/api/admin/announcements/${announcement.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !announcement.is_active })
            })
            if (res.ok) {
                setAnnouncements(list =>
                    list.map(a => a.id === announcement.id ? { ...a, is_active: !a.is_active } : a)
                )
            }
        } catch (error) {
            console.error('Failed to toggle announcement:', error)
        } finally {
            setSaving(null)
        }
    }

    const deleteAnnouncement = async () => {
        if (!deleteModal.id) return
        setSaving('delete')
        try {
            const res = await fetch(`/api/admin/announcements/${deleteModal.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setAnnouncements(list => list.filter(a => a.id !== deleteModal.id))
            }
            setDeleteModal({ open: false, id: null })
        } catch (error) {
            console.error('Failed to delete announcement:', error)
        } finally {
            setSaving(null)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'info': return <Info size={16} className="text-blue-400" />
            case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />
            case 'success': return <CheckCircle2 size={16} className="text-emerald-400" />
            case 'error': return <XCircle size={16} className="text-red-400" />
            default: return <Info size={16} className="text-zinc-400" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white font-display">Settings</h1>
                <p className="text-zinc-500 mt-1">Manage feature flags and announcements</p>
            </div>

            {/* Feature Flags */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Flag size={20} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Feature Flags</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureFlags.map((flag) => (
                        <div
                            key={flag.id}
                            className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white">{flag.name.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-zinc-500 truncate">{flag.description}</p>
                            </div>
                            <button
                                onClick={() => toggleFeatureFlag(flag)}
                                disabled={saving === flag.id}
                                className={`relative w-12 h-6 rounded-full transition-colors ${flag.is_enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                                    } ${saving === flag.id ? 'opacity-50' : ''}`}
                            >
                                <span
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${flag.is_enabled ? 'left-7' : 'left-1'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Announcements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Bell size={20} className="text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">Announcements</h3>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                    >
                        <Plus size={16} />
                        New
                    </button>
                </div>

                {announcements.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell size={32} className="mx-auto mb-2 text-zinc-600" />
                        <p className="text-zinc-500">No announcements yet</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-sm text-white hover:underline"
                        >
                            Create your first announcement
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`p-4 rounded-xl border transition-all ${announcement.is_active
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-zinc-900/50 border-zinc-800 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {getTypeIcon(announcement.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white">{announcement.title}</p>
                                            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{announcement.message}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                {announcement.show_on_dashboard && (
                                                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Dashboard</span>
                                                )}
                                                {announcement.show_on_landing && (
                                                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Landing</span>
                                                )}
                                                <span className="text-xs text-zinc-600">
                                                    {new Date(announcement.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleAnnouncement(announcement)}
                                            disabled={saving === announcement.id}
                                            className={`p-2 rounded-lg transition-colors ${announcement.is_active
                                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                                : 'text-zinc-500 hover:bg-zinc-800'
                                                }`}
                                            title={announcement.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {announcement.is_active ? <Check size={16} /> : <X size={16} />}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(announcement)}
                                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ open: true, id: announcement.id })}
                                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Announcement Modal */}
            {announcementModal.open && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={() => setAnnouncementModal({ open: false, mode: 'create' })}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 rounded-2xl bg-bg-elevated border border-white/10 shadow-2xl z-50"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">
                            {announcementModal.mode === 'create' ? 'Create Announcement' : 'Edit Announcement'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20"
                                    placeholder="Announcement title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 resize-none"
                                    placeholder="Announcement message"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Type</label>
                                <div className="flex gap-2">
                                    {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-colors ${formData.type === type
                                                ? type === 'info' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    : type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-white/5 text-zinc-400 border border-transparent hover:border-white/10'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.show_on_dashboard}
                                        onChange={(e) => setFormData({ ...formData, show_on_dashboard: e.target.checked })}
                                        className="w-4 h-4 rounded bg-white/5 border-white/10"
                                    />
                                    <span className="text-sm text-zinc-400">Show on Dashboard</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.show_on_landing}
                                        onChange={(e) => setFormData({ ...formData, show_on_landing: e.target.checked })}
                                        className="w-4 h-4 rounded bg-white/5 border-white/10"
                                    />
                                    <span className="text-sm text-zinc-400">Show on Landing</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setAnnouncementModal({ open: false, mode: 'create' })}
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveAnnouncement}
                                disabled={saving === 'announcement' || !formData.title || !formData.message}
                                className="flex-1 px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {saving === 'announcement' ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={deleteAnnouncement}
                title="Delete Announcement"
                message="Are you sure you want to delete this announcement? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={saving === 'delete'}
            />
        </div>
    )
}
