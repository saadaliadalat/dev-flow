'use client'

import React, { useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnDef,
    FilterFn
} from '@tanstack/react-table'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search..."
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    })

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    <input
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#18181b] border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#18181b] border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border border-white/5 bg-[#09090b]/50 backdrop-blur-sm overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-zinc-400 text-xs uppercase font-medium border-b border-white/5">
                            {table.getHeaderGroups().map((headerGroup: any) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header: any) => {
                                        return (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className="px-6 py-4 font-semibold select-none cursor-pointer hover:text-white transition-colors group"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {!header.isPlaceholder && (
                                                    <div className="flex items-center gap-1">
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {header.column.getCanSort() && (
                                                            <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" />
                                                        )}
                                                    </div>
                                                )}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row: any, index: number) => (
                                        <motion.tr
                                            key={row.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell: any) => (
                                                <td
                                                    key={cell.id}
                                                    className="px-6 py-4 text-zinc-300 font-medium whitespace-nowrap"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="h-32 text-center text-zinc-500"
                                        >
                                            No results found.
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="text-xs text-zinc-500">
                    Page <span className="text-white font-mono">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                    <span className="text-white font-mono">{table.getPageCount()}</span>
                    <span className="mx-2 text-zinc-600">•</span>
                    Total <span className="text-white font-mono">{data.length}</span> items
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
