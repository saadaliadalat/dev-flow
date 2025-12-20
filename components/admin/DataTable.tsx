'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    Check
} from 'lucide-react'

interface Column<T> {
    key: string
    label: string
    sortable?: boolean
    width?: string
    render?: (item: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    searchable?: boolean
    searchPlaceholder?: string
    onSearch?: (query: string) => void
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
        onPageChange: (page: number) => void
        onLimitChange: (limit: number) => void
    }
    sorting?: {
        sortBy: string
        sortOrder: 'asc' | 'desc'
        onSort: (column: string) => void
    }
    selectable?: boolean
    selectedIds?: string[]
    onSelectionChange?: (ids: string[]) => void
    getRowId?: (item: T) => string
    emptyMessage?: string
    actions?: React.ReactNode
}

export function DataTable<T>({
    columns,
    data,
    loading = false,
    searchable = false,
    searchPlaceholder = 'Search...',
    onSearch,
    pagination,
    sorting,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    getRowId = (item: any) => item.id,
    emptyMessage = 'No data found',
    actions
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        onSearch?.(value)
    }

    const handleSelectAll = () => {
        if (selectedIds.length === data.length) {
            onSelectionChange?.([])
        } else {
            onSelectionChange?.(data.map(item => getRowId(item)))
        }
    }

    const handleSelectRow = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange?.(selectedIds.filter(i => i !== id))
        } else {
            onSelectionChange?.([...selectedIds, id])
        }
    }

    const renderSortIcon = (column: Column<T>) => {
        if (!column.sortable || !sorting) return null

        if (sorting.sortBy === column.key) {
            return sorting.sortOrder === 'asc'
                ? <ChevronUp size={14} className="text-white" />
                : <ChevronDown size={14} className="text-white" />
        }

        return <ChevronDown size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    }

    return (
        <div className="w-full">
            {/* Header */}
            {(searchable || actions) && (
                <div className="flex items-center justify-between gap-4 mb-4">
                    {searchable && (
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
                            />
                        </div>
                    )}
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            {selectable && (
                                <th className="w-12 p-4">
                                    <button
                                        onClick={handleSelectAll}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.length === data.length && data.length > 0
                                            ? 'bg-white border-white'
                                            : 'border-zinc-600 hover:border-zinc-400'
                                            }`}
                                    >
                                        {selectedIds.length === data.length && data.length > 0 && (
                                            <Check size={12} className="text-black" />
                                        )}
                                    </button>
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`p-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider ${column.width || ''} ${column.sortable ? 'cursor-pointer select-none group' : ''
                                        }`}
                                    onClick={() => column.sortable && sorting?.onSort(column.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {column.label}
                                        {renderSortIcon(column)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {selectable && (
                                        <td className="p-4">
                                            <div className="w-5 h-5 bg-white/5 rounded animate-pulse" />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td key={column.key} className="p-4">
                                            <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: '60%' }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-12 text-center">
                                    <p className="text-zinc-500">{emptyMessage}</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const id = getRowId(item)
                                const isSelected = selectedIds.includes(id)

                                return (
                                    <motion.tr
                                        key={id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-white/[0.03]' : ''
                                            }`}
                                    >
                                        {selectable && (
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleSelectRow(id)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-white border-white'
                                                        : 'border-zinc-600 hover:border-zinc-400'
                                                        }`}
                                                >
                                                    {isSelected && <Check size={12} className="text-black" />}
                                                </button>
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td key={column.key} className="p-4">
                                                {column.render
                                                    ? column.render(item, index)
                                                    : (item as any)[column.key]}
                                            </td>
                                        ))}
                                    </motion.tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Show</span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-white/20"
                        >
                            {[10, 25, 50, 100].map((limit) => (
                                <option key={limit} value={limit}>{limit}</option>
                            ))}
                        </select>
                        <span>of {pagination.total} results</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                let page: number
                                if (pagination.totalPages <= 5) {
                                    page = i + 1
                                } else if (pagination.page <= 3) {
                                    page = i + 1
                                } else if (pagination.page >= pagination.totalPages - 2) {
                                    page = pagination.totalPages - 4 + i
                                } else {
                                    page = pagination.page - 2 + i
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => pagination.onPageChange(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pagination.page
                                            ? 'bg-white text-black'
                                            : 'bg-white/5 text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
