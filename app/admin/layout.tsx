'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminTopbar } from '@/components/admin/Topbar'
import { Shield } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    useEffect(() => {
        async function checkAdmin() {
            if (status === 'loading') return

            if (!session) {
                router.push('/login')
                return
            }

            try {
                const res = await fetch('/api/admin/verify')
                const data = await res.json()

                if (!data.isAdmin) {
                    router.push('/dashboard')
                    return
                }

                setIsAdmin(true)
            } catch (error) {
                console.error('Admin check failed:', error)
                router.push('/dashboard')
            }
        }

        checkAdmin()
    }, [session, status, router])

    if (status === 'loading' || isAdmin === null) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-2xl">
                        <Shield size={32} className="text-white" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">DevFlow Admin</h2>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Verifying Permissions...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 center w-full h-[500px] bg-blue-500/5 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <AdminSidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            <main
                className={`
                    flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                    ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}
                `}
            >
                <AdminTopbar user={session?.user} />

                <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </div>

                <footer className="px-10 py-6 border-t border-white/5 text-center lg:text-left">
                    <p className="text-xs text-zinc-600 font-mono">
                        &copy; 2024 DevFlow Inc. All rights reserved. • System Version 2.0.4-beta
                    </p>
                </footer>
            </main>
        </div>
    )
}
