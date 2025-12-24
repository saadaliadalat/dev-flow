'use client'

import React, { useEffect, useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'

export function UpgradeButton() {
    const [status, setStatus] = useState<'loading' | 'free' | 'active' | 'cancelled'>('loading')

    useEffect(() => {
        checkStatus()
    }, [])

    async function checkStatus() {
        try {
            const res = await fetch('/api/user/me')
            const data = await res.json()
            if (data.user) {
                if (data.user.subscription_status === 'active') {
                    setStatus('active')
                } else {
                    setStatus('free')
                }
            }
        } catch (e) {
            console.error(e)
            setStatus('free')
        }
    }

    const handleCheckout = () => {
        // Generate checkout URL (In production, assume it's set in env or hardcoded variant)
        // Pass user_id in custom data: ?checkout[custom][user_id]=<ID>
        // For MVP, we'll just redirect to a dummy URL or env var
        const checkoutUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_URL || '#'
        if (checkoutUrl === '#') {
            alert('Configure NEXT_PUBLIC_LEMON_SQUEEZY_URL in .env')
            return
        }

        // We need to append the user_id dynamically if possible, but for client component 
        // it's checking /user/me first. A real implementation would generate this link server-side.
        // For this "Button" component, we'll just open the link.
        window.open(checkoutUrl, '_blank')
    }

    if (status === 'loading') {
        return <div className="h-10 w-32 bg-zinc-800/50 rounded-lg animate-pulse" />
    }

    if (status === 'active') {
        return (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-medium text-sm">
                <Zap size={16} fill="currentColor" />
                <span>PRO Active</span>
            </div>
        )
    }

    return (
        <button
            onClick={handleCheckout}
            className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm hover:scale-105 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
        >
            <Zap size={18} className="text-purple-600 group-hover:fill-current transition-colors" />
            <span>Upgrade to PRO</span>
        </button>
    )
}
