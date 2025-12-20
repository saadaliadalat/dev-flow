'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'default'
    loading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    loading = false
}: ConfirmModalProps) {
    const variantStyles = {
        danger: {
            icon: 'bg-red-500/10 text-red-400 border-red-500/20',
            button: 'bg-red-500 hover:bg-red-600 text-white'
        },
        warning: {
            icon: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            button: 'bg-yellow-500 hover:bg-yellow-600 text-black'
        },
        default: {
            icon: 'bg-white/10 text-white border-white/20',
            button: 'bg-white hover:bg-zinc-200 text-black'
        }
    }

    const styles = variantStyles[variant]

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl bg-bg-elevated border border-white/10 shadow-2xl z-50"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl border ${styles.icon}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${styles.button}`}
                            >
                                {loading && (
                                    <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                                )}
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
