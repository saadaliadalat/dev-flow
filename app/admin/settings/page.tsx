'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
    XCircle,
    Save
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
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-zinc-500 mt-1">Configure feature flags and system announcements</p>
                </div>
            </div>

            {/* Feature Flags */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-[#09090b] border border-white/10 shadow-xl"
            >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Flag size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Feature Flags</h3>
                        <p className="text-sm text-zinc-500">Toggle experimental features</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featureFlags.map((flag) => (
                        <div
                            key={flag.id}
                            className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors group"
                        >
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-white tracking-tight">{flag.name.replace(/_/g, ' ')}</p>
                                    <button
                                        onClick={() => toggleFeatureFlag(flag)}
                                        disabled={saving === flag.id}
                                        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${flag.is_enabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-700'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${flag.is_enabled ? 'left-6' : 'left-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <p className="text-sm text-zinc-400 leading-relaxed min-h-[40px]">{flag.description}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono pt-4 border-t border-white/5">
                                ID: {flag.id.substring(0, 8)}...
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Announcements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-[#09090b] border border-white/10 shadow-xl"
            >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Announcements</h3>
                            <p className="text-sm text-zinc-500">Manage system-wide broadcasts</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Create
                    </button>
                </div>

                {announcements.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                            <Bell size={32} />
                        </div>
                        <p className="text-zinc-400 font-medium">No active announcements</p>
                        <p className="text-zinc-600 text-sm mt-1 mb-4">Create a new announcement to notify users</p>
                        <button
                            onClick={openCreateModal}
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
                        >
                            Create now &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`p-5 rounded-2xl border transition-all hover:translate-x-1 duration-300 ${announcement.is_active
                                    ? 'bg-gradient-to-r from-white/5 to-transparent border-white/10'
                                    : 'bg-zinc-900/30 border-zinc-800 opacity-60 grayscale'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="p-2 rounded-lg bg-[#09090b] border border-white/5 shadow-sm mt-1">
                                            {getTypeIcon(announcement.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-semibold text-white text-lg">{announcement.title}</h4>
                                                {!announcement.is_active && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-500">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{announcement.message}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                {announcement.show_on_dashboard && (
                                                    <span className="text-[10px] font-medium text-zinc-400 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">Dashboard</span>
                                                )}
                                                {announcement.show_on_landing && (
                                                    <span className="text-[10px] font-medium text-zinc-400 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">Landing</span>
                                                )}
                                                <span className="text-[10px] text-zinc-600 ml-auto">
                                                    Created {new Date(announcement.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleAnnouncement(announcement)}
                                            disabled={saving === announcement.id}
                                            className={`p-2 rounded-xl transition-all ${announcement.is_active
                                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                                : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                                                }`}
                                            title={announcement.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {announcement.is_active ? <Check size={18} /> : <X size={18} />}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(announcement)}
                                            className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ open: true, id: announcement.id })}
                                            className="p-2 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 border border-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Announcement Modal */}
            <AnimatePresence>
                {announcementModal.open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                            onClick={() => setAnnouncementModal({ open: false, mode: 'create' })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-8 rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl z-[101]"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-500">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {announcementModal.mode === 'create' ? 'Broadcast Announcement' : 'Edit Announcement'}
                                    </h3>
                                    <p className="text-zinc-500 text-sm">Send a notification to all users</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                        placeholder="e.g., Scheduled Maintenance"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                                        placeholder="Write your message here..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Notice Type</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, type })}
                                                className={`px-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${formData.type === type
                                                    ? type === 'info' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                                        : type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                                            : type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                                                : 'bg-red-500/20 text-red-400 border-red-500/50'
                                                    : 'bg-zinc-900 text-zinc-500 border-transparent hover:border-white/10'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.show_on_dashboard ? 'bg-blue-600 border-blue-600' : 'border-zinc-700 bg-zinc-900'}`}>
                                            {formData.show_on_dashboard && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.show_on_dashboard}
                                            onChange={(e) => setFormData({ ...formData, show_on_dashboard: e.target.checked })}
                                        />
                                        <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Show on Dashboard</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.show_on_landing ? 'bg-blue-600 border-blue-600' : 'border-zinc-700 bg-zinc-900'}`}>
                                            {formData.show_on_landing && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.show_on_landing}
                                            onChange={(e) => setFormData({ ...formData, show_on_landing: e.target.checked })}
                                        />
                                        <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Show on Landing</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => setAnnouncementModal({ open: false, mode: 'create' })}
                                    className="flex-1 px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 font-medium hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveAnnouncement}
                                    disabled={saving === 'announcement' || !formData.title || !formData.message}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    {saving === 'announcement' ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={deleteAnnouncement}
                title="Delete Announcement"
                description="Are you sure you want to completely remove this announcement? It will no longer be visible to any users."
                confirmText="Delete Announcement"
                variant="danger"
                loading={saving === 'delete'}
            />
        </div>
    )
}
