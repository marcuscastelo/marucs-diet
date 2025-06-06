/**
 * Utilities for formatting and copying error details to clipboard.
 * Shared between ExpandableErrorToast and ErrorDetailModal.
 */
import { ToastError } from '~/modules/toast/domain/toastTypes'
import { handleApiError } from '~/shared/error/errorHandler'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { TOAST_MESSAGES } from '~/modules/toast/domain/toastMessages'

// Explicit type for context
export type ClipboardErrorContext = { component: string; operation: string }

export function formatErrorForClipboard(errorDetails: ToastError): string {
  const sections: string[] = []
  if (
    typeof errorDetails.message === 'string' &&
    errorDetails.message.trim() !== ''
  ) {
    sections.push(`${TOAST_MESSAGES.ERROR_TITLE}: ${errorDetails.message}`)
  }
  if (
    typeof errorDetails.fullError === 'string' &&
    errorDetails.fullError.trim() !== '' &&
    errorDetails.fullError !== errorDetails.message
  ) {
    sections.push(`${TOAST_MESSAGES.SHOW_DETAILS}: ${errorDetails.fullError}`)
  }
  if (errorDetails.context && Object.keys(errorDetails.context).length > 0) {
    sections.push(
      `${TOAST_MESSAGES.COPY_ERROR}: ${JSON.stringify(
        errorDetails.context,
        null,
        2,
      )}`,
    )
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
    sections.push(
      `Timestamp: ${new Date(errorDetails.timestamp).toISOString()}`,
    )
  }
  return `Error Report - ${new Date().toISOString()}\n` + sections.join('\n')
}

export async function handleCopyErrorToClipboard(
  errorDetails: ToastError,
  context: ClipboardErrorContext,
) {
  const { write } = useClipboard()
  const clipboardContent = formatErrorForClipboard(errorDetails)
  write(clipboardContent, (error) => {
    if (error != null) {
      handleApiError(error, {
        component: context.component,
        operation: context.operation,
        additionalData: { errorDetails },
      })
    }
  })
}
