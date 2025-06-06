/**
 * Toast System Configuration
 *
 * Defines the core types and configuration options for the intelligent toast system.
 */

/**
 * Special duration value for infinite toast duration (manual dismiss only)
 */
export const TOAST_DURATION_INFINITY = Infinity

/**
 * Context in which a toast is triggered
 * - user-action: Direct user interaction (button clicks, form submissions)
 * - background: Automatic operations (bootstrap, realtime updates, sync)
 * - system: System-level notifications (errors, warnings)
 */
export type ToastContext = 'user-action' | 'background' | 'system'

/**
 * Toast severity levels
 */
export type ToastLevel = 'info' | 'success' | 'warning' | 'error'

/**
 * Configuration options for toast display behavior
 */
export type ToastOptions = {
  /**
   * Context that triggered the toast
   */
  context: ToastContext

  /**
   * Severity level of the toast
   */
  level: ToastLevel

  /**
   * Whether to show loading toast for promises
   * @default true for user-action, false for background
   */
  showLoading?: boolean

  /**
   * Whether to show success toast for promises
   * @default true for user-action, false for background
   */
  showSuccess?: boolean

  /**
   * Maximum length for toast messages before truncation
   * @default 100
   */
  maxLength?: number

  /**
   * Auto-dismiss timeout in milliseconds
   * @default 3000 for success/info, TOAST_DURATION_INFINITY (manual) for error/warning
   */
  duration: number

  /**
   * Whether this toast can be dismissed by user
   * @default true
   */
  dismissible?: boolean

  /**
   * Data for expandable error toasts
   * @internal Used by ExpandableErrorToast component
   */
  expandableErrorData?: {
    isTruncated: boolean
    errorDetails: ToastError
  }
}

/**
 * Default toast options based on context
 */
export const DEFAULT_TOAST_OPTIONS: Record<ToastContext, ToastOptions> = {
  'user-action': {
    showLoading: true,
    showSuccess: true,
    maxLength: 100,
    duration: 3000,
    dismissible: true,
    context: 'user-action',
    level: 'info',
    expandableErrorData: undefined,
  },
  background: {
    showLoading: false,
    showSuccess: false,
    maxLength: 150,
    duration: 2000,
    dismissible: true,
    context: 'background',
    level: 'info',
  },
  system: {
    showLoading: false,
    showSuccess: true,
    maxLength: 200,
    duration: 5000,
    dismissible: true,
    context: 'system',
    level: 'info',
  },
}

/**
 * Priority levels for toast queue management
 * Higher numbers = higher priority
 */
export const TOAST_PRIORITY: Record<ToastLevel, number> = {
  error: 4,
  warning: 3,
  info: 2,
  success: 1,
}

/**
 * Configuration for toast queue management
 */
export type ToastQueueConfig = {
  /**
   * Delay between toast transitions in milliseconds
   * @default 300
   */
  transitionDelay: number
}

/**
 * Default queue configuration
 */
export const DEFAULT_QUEUE_CONFIG: ToastQueueConfig = {
  transitionDelay: 300,
}

/**
 * Toast item for queue management
 */
export type ToastItem = {
  id: string
  message: string
  options: ToastOptions
  timestamp: number
  priority: number
  solidToastId?: string // ID returned by solid-toast when displayed
  displayedAt?: number // Timestamp when toast was displayed (for auto-dismiss timing)
}

/**
 * Error details for expandable error messages
 */
export type ToastError = {
  message: string
  fullError: string
  stack?: string
  context?: Record<string, unknown>
  timestamp?: number
}
