'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description?: string // Renamed from message for consistency
    message?: string // Backwards compatibility
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'default' | 'success'
    loading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    loading = false
}: ConfirmModalProps) {
    // Handle both description and message props
    const desc = description || message || ''

    const variantStyles = {
        danger: {
            iconWrapper: 'bg-red-500/10 border-red-500/20 text-red-500',
            button: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
            icon: Trash2
        },
        warning: {
            iconWrapper: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
            button: 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20',
            icon: AlertTriangle
        },
        success: {
            iconWrapper: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
            button: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
            icon: ShieldCheck
        },
        default: {
            iconWrapper: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
            icon: ShieldCheck
        }
    }

    const styles = variantStyles[variant]
    const Icon = styles.icon

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl z-[101]"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={`p-4 rounded-2xl border mb-5 ${styles.iconWrapper}`}>
                                <Icon size={32} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed max-w-[90%] mb-8">
                                {desc}
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-300 font-medium hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 ${styles.button}`}
                                >
                                    {loading && (
                                        <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                                    )}
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
