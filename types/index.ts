export * from './user'
export * from './stats'
export * from './github'
export * from './achievement'
export * from './repository'

// Common types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface DateRangeParams {
  startDate: string
  endDate: string
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ErrorState {
  message: string
  code?: string
  details?: any
}
