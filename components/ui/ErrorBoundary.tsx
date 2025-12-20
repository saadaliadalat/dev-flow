'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to error reporting service in production
        console.error('Error caught by boundary:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center">
                        {/* Error icon */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>

                        {/* Error message */}
                        <h2 className="text-xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-zinc-400 mb-6">
                            We encountered an unexpected error. Please try again or return to the dashboard.
                        </p>

                        {/* Error details (collapsible in production) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-400">
                                    Error details
                                </summary>
                                <pre className="mt-2 p-4 rounded-lg bg-zinc-900 text-xs text-red-400 overflow-x-auto">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-4 py-2 rounded-lg bg-white text-black font-medium text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <a
                                href="/dashboard"
                                className="px-4 py-2 rounded-lg bg-zinc-800 text-white font-medium text-sm flex items-center gap-2 hover:bg-zinc-700 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Inline error display for smaller sections
 */
export function InlineError({
    message = 'Failed to load data',
    onRetry
}: {
    message?: string
    onRetry?: () => void
}) {
    return (
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-zinc-400 mb-3">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-1 mx-auto"
                >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                </button>
            )}
        </div>
    )
}
