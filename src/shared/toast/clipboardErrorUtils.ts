/**
 * Utilities for formatting and copying error details to clipboard.
 * Shared between ExpandableErrorToast and ErrorDetailModal.
 */
import { ToastError } from './toastConfig'
import { handleApiError } from '~/shared/error/errorHandler'

// Explicit type for context
export type ClipboardErrorContext = { component: string; operation: string }

export function formatErrorForClipboard(errorDetails: ToastError): string {
  const sections: string[] = []
  if (
    typeof errorDetails.message === 'string' &&
    errorDetails.message.trim() !== ''
  ) {
    sections.push(`Message: ${errorDetails.message}`)
  }
  if (
    typeof errorDetails.fullError === 'string' &&
    errorDetails.fullError.trim() !== '' &&
    errorDetails.fullError !== errorDetails.message
  ) {
    sections.push(`Details: ${errorDetails.fullError}`)
  }
  if (errorDetails.context && Object.keys(errorDetails.context).length > 0) {
    sections.push(`Context: ${JSON.stringify(errorDetails.context, null, 2)}`)
  }
  if (
    typeof errorDetails.stack === 'string' &&
    errorDetails.stack.trim() !== ''
  ) {
    sections.push(`Stack Trace:\n${errorDetails.stack}`)
  }
  if (
    typeof errorDetails.timestamp === 'number' &&
    !isNaN(errorDetails.timestamp) &&
    errorDetails.timestamp > 0
  ) {
    const date = new Date(errorDetails.timestamp)
    sections.push(`Timestamp: ${date.toISOString()}`)
  }
  const timestamp = new Date().toISOString()
  return `Error Report - ${timestamp}\n\n${sections.join('\n\n')}`
}

export async function handleCopyErrorToClipboard(
  errorDetails: ToastError,
  context: ClipboardErrorContext,
) {
  try {
    // Defensive: clipboard may not be available in all environments
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: navigator may not exist in some environments
    if (
      typeof navigator === 'undefined' ||
      typeof navigator.clipboard === 'undefined'
    ) {
      handleApiError(new Error('Clipboard API not available'), {
        component: context.component,
        operation: context.operation,
        additionalData: { errorDetails },
      })
      return
    }
    const clipboardContent = formatErrorForClipboard(errorDetails)
    await navigator.clipboard.writeText(clipboardContent)
  } catch (error) {
    handleApiError(error, {
      component: context.component,
      operation: context.operation,
      additionalData: { errorDetails },
    })
  }
}
