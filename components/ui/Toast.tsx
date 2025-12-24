'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toaster, toast as sonnerToast } from 'sonner'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

// ============================================
// COMPATIBILITY HOOKS (Wrappers for Sonner)
// ============================================

export function useToastActions() {
    return {
        success: (title: string, message?: string) =>
            sonnerToast.custom((id) => (
                <CustomToast id={id} type="success" title={title} message={message} />
            )),
        error: (title: string, message?: string) =>
            sonnerToast.custom((id) => (
                <CustomToast id={id} type="error" title={title} message={message} />
            )),
        warning: (title: string, message?: string) =>
            sonnerToast.custom((id) => (
                <CustomToast id={id} type="warning" title={title} message={message} />
            )),
        info: (title: string, message?: string) =>
            sonnerToast.custom((id) => (
                <CustomToast id={id} type="info" title={title} message={message} />
            )),
    }
}

// ============================================
// PROVIDER
// ============================================

export function ToastProvider({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    unstyled: true,
                    classNames: {
                        toast: 'bg-transparent',
                    },
                }}
            />
        </>
    )
}

// ============================================
// CUSTOM TOAST UI
// ============================================

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const colorMap = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
}

function CustomToast({ id, type, title, message }: { id: string | number, type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string }) {
    const Icon = iconMap[type]
    const colorClass = colorMap[type]

    return (
        <div
            className={`min-w-[300px] max-w-md p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 pointer-events-auto ${colorClass}`}
        >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{title}</p>
                {message && (
                    <p className="text-xs text-zinc-400 mt-1">{message}</p>
                )}
            </div>
            <button
                onClick={() => sonnerToast.dismiss(id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
                <X className="w-4 h-4 text-zinc-400" />
            </button>
        </div>
    )
}
