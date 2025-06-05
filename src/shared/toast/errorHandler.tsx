/**
 * Toast Error Handler
 *
 * Integrates the app's error handling system with the toast notification system,
 * providing smart error display with truncation and modal expansion capability.
 */

import toast from 'solid-toast'
import { ToastOptions } from './toastConfig'
import { ErrorContext, logError } from '../error/errorHandler'
import { processErrorMessage } from './errorMessageHandler'
import { showExpandableErrorToast } from './ExpandableErrorToast'

/**
 * Options for error toast display
 */
export type ErrorToastOptions = {
  /** Maximum length before truncation */
  maxLength?: number
  /** Toast duration in ms, or -1 for no auto-close */
  duration?: number
  /** Context of the toast (user action, background, system) */
  context?: ToastOptions['context']
  /** Error context information */
  errorContext?: ErrorContext
}

/**
 * Default options for error toasts
 */
const DEFAULT_ERROR_TOAST_OPTIONS: ErrorToastOptions = {
  maxLength: 100,
  duration: 8000, // 8 seconds for errors
  context: 'system',
}

/**
 * Show an error toast with smart truncation and expandable details
 */
export function showErrorToast(
  error: unknown,
  options: ErrorToastOptions = {},
): string {
  const opts = { ...DEFAULT_ERROR_TOAST_OPTIONS, ...options }

  // Process the error message (truncation, cleaning, etc)
  const processed = processErrorMessage(error, {
    maxLength: opts.maxLength,
    includeStack: true,
  })

  // Always log the full error
  if (opts.errorContext) {
    logError(error, opts.errorContext)
  } else {
    console.error('Toast error:', error)
  }

  // Determine toast duration based on context
  const duration =
    opts.duration === undefined
      ? opts.context === 'user-action'
        ? 8000
        : 5000
      : opts.duration

  // Use the expandable error toast component for rich display
  return showExpandableErrorToast(
    processed.displayMessage,
    processed.isTruncated,
    processed.errorDetails,
    { duration },
  )
}

/**
 * Show a generic error message when something goes wrong
 */
export function showGenericErrorToast(errorContext?: ErrorContext): string {
  return showErrorToast(new Error('Something went wrong. Please try again.'), {
    context: 'system',
    errorContext,
  })
}

/**
 * Show a network error toast
 */
export function showNetworkErrorToast(errorContext?: ErrorContext): string {
  return showErrorToast(
    new Error(
      'Network connection issue. Please check your internet connection.',
    ),
    {
      context: 'system',
      errorContext,
    },
  )
}

/**
 * Show a permission denied error toast
 */
export function showPermissionErrorToast(errorContext?: ErrorContext): string {
  return showErrorToast(
    new Error("You don't have permission to perform this action."),
    {
      context: 'system',
      errorContext,
    },
  )
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissErrorToast(id: string): void {
  toast.dismiss(id)
}
