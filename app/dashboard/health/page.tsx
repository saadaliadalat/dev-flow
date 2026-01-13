'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield, RefreshCw, Activity, Wrench, Users, FileText,
    AlertTriangle, CheckCircle, XCircle, ChevronRight, ArrowLeft
} from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'

interface RepoSummary {
    name: string
    fullName: string
    score: number
    lastPush: string
}

interface RepoHealth {
    repo: string
    score: number
    metrics: {
        activity: { score: number; label: string; detail: string }
        maintenance: { score: number; label: string; detail: string }
        community: { score: number; label: string; detail: string }
        documentation: { score: number; label: string; detail: string }
    }
    issues: {
        severity: 'high' | 'medium' | 'low'
        title: string
        description: string
        action: string
    }[]
}

interface RepoListData {
    repos: RepoSummary[]
    summary: { healthy: number; needsAttention: number; critical: number }
}

const SCORE_COLORS = {
    high: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Healthy' },
    medium: { bg: 'bg-amber-500', text: 'text-amber-400', label: 'Needs Attention' },
    low: { bg: 'bg-red-500', text: 'text-red-400', label: 'Critical' },
}

function getScoreLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
}

export default function RepoHealthPage() {
    const [repoList, setRepoList] = useState<RepoListData | null>(null)
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [repoDetail, setRepoDetail] = useState<RepoHealth | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchRepoList = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/health')
            if (res.ok) {
                const data = await res.json()
                setRepoList(data)
            }
        } catch (e) {
            console.error('Health fetch error:', e)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRepoDetail = async (fullName: string) => {
        setSelectedRepo(fullName)
        setRepoDetail(null)
        try {
            const res = await fetch(`/api/health?repo=${encodeURIComponent(fullName)}`)
            if (res.ok) {
                const data = await res.json()
                setRepoDetail(data)
            }
        } catch (e) {
            console.error('Detail fetch error:', e)
        }
    }

    useEffect(() => {
        fetchRepoList()
    }, [])

    const goBack = () => {
        setSelectedRepo(null)
        setRepoDetail(null)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {selectedRepo && (
                        <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                            <Shield className="text-emerald-400" />
                            Repo Health
                        </h1>
                        <p className="text-sm text-zinc-500">
                            {selectedRepo ? selectedRepo : 'Monitor the health of your repositories'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={selectedRepo ? () => fetchRepoDetail(selectedRepo) : fetchRepoList}
                    disabled={isLoading}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Loading */}
            {isLoading && !repoList && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            <Shield size={32} className="text-emerald-400" />
                        </motion.div>
                        <p className="text-zinc-500 text-sm">Scanning repositories...</p>
                    </div>
                </div>
            )}

            {/* Repo List View */}
            <AnimatePresence mode="wait">
                {!selectedRepo && repoList && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <SummaryCard
                                label="Healthy"
                                count={repoList.summary.healthy}
                                color="emerald"
                                icon={<CheckCircle size={16} />}
                            />
                            <SummaryCard
                                label="Needs Attention"
                                count={repoList.summary.needsAttention}
                                color="amber"
                                icon={<AlertTriangle size={16} />}
                            />
                            <SummaryCard
                                label="Critical"
                                count={repoList.summary.critical}
                                color="red"
                                icon={<XCircle size={16} />}
                            />
                        </div>

                        {/* Repo List */}
                        <div className="space-y-2">
                            {repoList.repos.map((repo, i) => {
                                const level = getScoreLevel(repo.score)
                                const colors = SCORE_COLORS[level]

                                return (
                                    <motion.div
                                        key={repo.fullName}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <AliveCard
                                            className="p-4 cursor-pointer hover:border-white/20 transition-colors"
                                            glass
                                            onClick={() => fetchRepoDetail(repo.fullName)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-8 rounded-full ${colors.bg}`} />
                                                    <div>
                                                        <p className="font-medium text-white">{repo.name}</p>
                                                        <p className="text-xs text-zinc-500">
                                                            {new Date(repo.lastPush).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <span className={`text-lg font-mono font-bold ${colors.text}`}>
                                                            {repo.score}
                                                        </span>
                                                        <p className="text-[10px] text-zinc-500">{colors.label}</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-zinc-500" />
                                                </div>
                                            </div>
                                        </AliveCard>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Repo Detail View */}
                {selectedRepo && repoDetail && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {/* Score Ring */}
                        <AliveCard className="p-8 text-center" glass>
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 mb-4">
                                <span className={`text-5xl font-mono font-black ${SCORE_COLORS[getScoreLevel(repoDetail.score)].text}`}>
                                    {repoDetail.score}
                                </span>
                            </div>
                            <p className={`text-lg font-medium ${SCORE_COLORS[getScoreLevel(repoDetail.score)].text}`}>
                                {SCORE_COLORS[getScoreLevel(repoDetail.score)].label}
                            </p>
                        </AliveCard>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard
                                icon={<Activity size={16} />}
                                label="Activity"
                                score={repoDetail.metrics.activity.score}
                                sublabel={repoDetail.metrics.activity.label}
                                detail={repoDetail.metrics.activity.detail}
                            />
                            <MetricCard
                                icon={<Wrench size={16} />}
                                label="Maintenance"
                                score={repoDetail.metrics.maintenance.score}
                                sublabel={repoDetail.metrics.maintenance.label}
                                detail={repoDetail.metrics.maintenance.detail}
                            />
                            <MetricCard
                                icon={<Users size={16} />}
                                label="Community"
                                score={repoDetail.metrics.community.score}
                                sublabel={repoDetail.metrics.community.label}
                                detail={repoDetail.metrics.community.detail}
                            />
                            <MetricCard
                                icon={<FileText size={16} />}
                                label="Documentation"
                                score={repoDetail.metrics.documentation.score}
                                sublabel={repoDetail.metrics.documentation.label}
                                detail={repoDetail.metrics.documentation.detail}
                            />
                        </div>

                        {/* Issues */}
                        {repoDetail.issues.length > 0 && (
                            <div>
                                <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-amber-400" />
                                    Issues Found
                                </h3>
                                <div className="space-y-3">
                                    {repoDetail.issues.map((issue, i) => (
                                        <AliveCard key={i} className="p-4" glass>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${issue.severity === 'high' ? 'bg-red-500' :
                                                        issue.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                                    }`} />
                                                <div>
                                                    <p className="font-medium text-white">{issue.title}</p>
                                                    <p className="text-sm text-zinc-400 mt-1">{issue.description}</p>
                                                    <p className="text-xs text-violet-400 mt-2">💡 {issue.action}</p>
                                                </div>
                                            </div>
                                        </AliveCard>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function SummaryCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
    const colorClasses = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
    }
    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <span className="text-2xl font-mono font-bold">{count}</span>
        </div>
    )
}

function MetricCard({ icon, label, score, sublabel, detail }: {
    icon: React.ReactNode
    label: string
    score: number
    sublabel: string
    detail: string
}) {
    const level = getScoreLevel(score)
    const colors = SCORE_COLORS[level]

    return (
        <AliveCard className="p-4" glass>
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-mono font-bold ${colors.text}`}>{score}</span>
                <span className="text-xs text-zinc-500">{sublabel}</span>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1 truncate" title={detail}>{detail}</p>
        </AliveCard>
    )
}
