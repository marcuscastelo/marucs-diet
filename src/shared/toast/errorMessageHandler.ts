/**
 * Error Message Handler
 *
 * Utilities for handling error messages in toasts, including truncation,
 * formatting, and providing expansion capabilities for long messages.
 */

import { ToastError } from './toastConfig'

/**
 * Result of error message processing
 */
export type ProcessedErrorMessage = {
  /** The truncated message for display */
  displayMessage: string
  /** Whether the message was truncated */
  isTruncated: boolean
  /** The original full message */
  originalMessage: string
  /** Full error details */
  errorDetails: ToastError
  /** Whether expansion is available */
  canExpand: boolean
}

/**
 * Options for error message processing
 */
export type ErrorProcessingOptions = {
  /** Maximum length before truncation */
  maxLength?: number
  /** Whether to preserve line breaks in truncation */
  preserveLineBreaks?: boolean
  /** Custom truncation suffix */
  truncationSuffix?: string
  /** Include stack trace in error details */
  includeStack?: boolean
}

/**
 * Default options for error processing
 */
const DEFAULT_ERROR_OPTIONS: Required<ErrorProcessingOptions> = {
  maxLength: 100,
  preserveLineBreaks: false,
  truncationSuffix: '...',
  includeStack: true,
}

// Centralized default error messages for maintainability and i18n
const DEFAULT_UNKNOWN_ERROR = 'Unknown error occurred'
const DEFAULT_UNEXPECTED_ERROR = 'An unexpected error occurred'

// Extracted noisy prefixes to avoid recreating array on every call
const NOISY_PREFIXES = [
  'Error: ',
  'TypeError: ',
  'ReferenceError: ',
  'SyntaxError: ',
  'Network Error: ',
  'Request failed: ',
]

/**
 * Process an error for display in toasts
 * Handles truncation, formatting, and detail extraction
 */
export function processErrorMessage(
  error: unknown,
  options: ErrorProcessingOptions = {},
): ProcessedErrorMessage {
  const opts = { ...DEFAULT_ERROR_OPTIONS, ...options }
  const errorDetails = mapUnknownToToastError(error, opts.includeStack)
  const originalMessage = errorDetails.message

  // Clean up the message for display
  const cleanMessage = cleanErrorMessage(
    originalMessage,
    opts.preserveLineBreaks,
  )

  // Check if truncation is needed
  const needsTruncation = cleanMessage.length > opts.maxLength
  const displayMessage = needsTruncation
    ? truncateMessage(cleanMessage, opts.maxLength, opts.truncationSuffix)
    : cleanMessage

  return {
    displayMessage,
    isTruncated: needsTruncation,
    originalMessage,
    errorDetails,
    canExpand:
      needsTruncation ||
      (typeof errorDetails.stack === 'string' &&
        errorDetails.stack.trim().length > 0) ||
      !!errorDetails.context,
  }
}

/**
 * Convert unknown error to ToastError details (adapts various error types)
 */
function mapUnknownToToastError(
  error: unknown,
  includeStack: boolean,
): ToastError {
  if (error instanceof Error) {
    // Only serialize cause if it's a primitive or stringifiable
    let cause: unknown = error.cause
    if (typeof cause === 'object' && cause !== null) {
      try {
        cause = JSON.parse(JSON.stringify(cause))
      } catch {
        cause = '[Unserializable cause]'
      }
    }
    return {
      message: error.message || DEFAULT_UNKNOWN_ERROR,
      fullError: error.toString(),
      stack: includeStack ? error.stack : undefined,
      context: {
        name: error.name,
        cause,
      },
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      fullError: error,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>
    let message: string
    if (typeof errorObj.message === 'string') {
      message = errorObj.message
    } else if (typeof errorObj.error === 'string') {
      message = errorObj.error
    } else {
      message = DEFAULT_UNKNOWN_ERROR
    }
    // Limit JSON.stringify depth/size for fullError
    let fullError: string
    try {
      fullError = JSON.stringify(error, null, 2)
    } catch {
      fullError = '[Unserializable object]'
    }
    return {
      message,
      fullError,
      context: errorObj,
    }
  }

  return {
    message: DEFAULT_UNEXPECTED_ERROR,
    fullError: String(error),
  }
}

function cleanErrorMessage(
  message: string,
  preserveLineBreaks: boolean,
): string {
  let cleaned = message.trim()

  for (const prefix of NOISY_PREFIXES) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length)
      break
    }
  }

  // Handle line breaks
  if (!preserveLineBreaks) {
    cleaned = cleaned.replace(/\n\s*/g, ' ')
  } else {
    // Remove only trailing whitespace after line breaks, but preserve the line breaks
    cleaned = cleaned.replace(/\n\s*/g, '\n')
  }

  // Remove excessive whitespace (but not line breaks)
  cleaned = cleaned.replace(/[ \t\f\v]+/g, ' ').trim()

  return cleaned
}

function truncateMessage(
  message: string,
  maxLength: number,
  suffix: string,
): string {
  if (message.length <= maxLength) {
    return message
  }

  const targetLength = maxLength - suffix.length

  // Try to break at a word boundary
  const truncated = message.substring(0, targetLength)
  const lastSpace = truncated.lastIndexOf(' ')

  // If we can break at a word boundary and it's not too short, do so
  if (lastSpace > targetLength * 0.7 && lastSpace > 10) {
    return truncated.substring(0, lastSpace) + suffix
  }

  // Otherwise, hard truncate
  return truncated + suffix
}
