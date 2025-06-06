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
 * ToastAudience defines who should see this toast.
 * - 'user': Toasts relevant to the end user (normal user-facing notifications)
 * - 'system': Toasts relevant to system administrators or critical system operations
 */
export type ToastAudience = 'user' | 'system'

/**
 * ToastContext defines the origin of the event that triggered the toast.
 * - 'user-action': Direct user interaction (e.g., button click, form submit)
 * - 'background': Automatic/background operations (e.g., sync, bootstrap, polling)
 */
export type ToastContext = 'user-action' | 'background'

/**
 * ToastLevel defines the severity of the toast.
 * - 'info': Informational message
 * - 'success': Success message
 * - 'warning': Warning message
 * - 'error': Error message
 */
export type ToastLevel = 'info' | 'success' | 'warning' | 'error'

/**
 * ToastOptions configures the display behavior of a toast notification.
 * @property context - The origin of the event that triggered the toast
 * @property audience - Who should see this toast
 * @property level - The severity level of the toast
 * @property showLoading - Whether to show a loading toast for promises (default: true for user-action, false for background)
 * @property showSuccess - Whether to show a success toast for promises (default: true for user-action, false for background)
 * @property maxLength - Maximum length for toast messages before truncation (default: 100)
 * @property duration - Auto-dismiss timeout in milliseconds (default: 3000 for success/info, TOAST_DURATION_INFINITY for error/warning)
 * @property dismissible - Whether this toast can be dismissed by the user (default: true)
 * @property expandableErrorData - Data for expandable error toasts (used by ExpandableErrorToast component)
 */
export type ToastOptions = {
  context: ToastContext
  audience: ToastAudience
  level: ToastLevel
  showLoading?: boolean
  showSuccess?: boolean
  maxLength?: number
  duration: number
  dismissible?: boolean
  expandableErrorData?: {
    isTruncated: boolean
    errorDetails: ToastError
  }
}

/**
 * DEFAULT_TOAST_OPTIONS provides default options for each context.
 */
export const DEFAULT_TOAST_OPTIONS: Record<ToastContext, ToastOptions> = {
  'user-action': {
    showLoading: true,
    showSuccess: true,
    maxLength: 100,
    duration: 3000,
    dismissible: true,
    context: 'user-action',
    audience: 'user',
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
    audience: 'user',
    level: 'info',
  },
}

/**
 * TOAST_PRIORITY defines priority levels for toast queue management.
 * Higher numbers = higher priority.
 */
export const TOAST_PRIORITY: Record<ToastLevel, number> = {
  error: 4,
  warning: 3,
  info: 2,
  success: 1,
}

/**
 * ToastQueueConfig configures the toast queue manager.
 */
export type ToastQueueConfig = {
  /** Delay between toast transitions in milliseconds (default: 300) */
  transitionDelay: number
}

/**
 * DEFAULT_QUEUE_CONFIG provides the default queue configuration.
 */
export const DEFAULT_QUEUE_CONFIG: ToastQueueConfig = {
  transitionDelay: 300,
}

/**
 * ToastItem represents a toast in the queue.
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
 * ToastError contains error details for expandable error messages.
 */
export type ToastError = {
  message: string
  fullError: string
  stack?: string
  context?: Record<string, unknown>
  timestamp?: number
}

// Add JSDoc for all exported types and functions for better maintainability
