/**
 * Expandable Error Toast Component
 *
 * A SolidJS component for displaying error messages with a "Show Details" option
 * that opens a modal with full error information.
 */

import { createSignal, Show } from 'solid-js'
import toast from 'solid-toast'
import { ToastError } from './toastConfig'
import { ErrorDetailModal } from '~/sections/common/components/ErrorDetailModal'
import { enqueue, createToastItem } from './toastQueue'

export type ExpandableErrorToastProps = {
  /** The display message (potentially truncated) */
  message: string
  /** Whether the message was truncated */
  isTruncated: boolean
  /** Full error details for expansion */
  errorDetails: ToastError
  /** Optional dismiss callback */
  onDismiss?: () => void
  /** Optional copy to clipboard callback */
  onCopy?: (text: string) => void
}

/**
 * Expandable Error Toast Component
 *
 * Shows a truncated error message with an option to open a modal with details.
 */
export function ExpandableErrorToast(props: ExpandableErrorToastProps) {
  const [isModalOpen, setIsModalOpen] = createSignal(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleDismiss = () => {
    if (props.onDismiss) {
      props.onDismiss()
    }
  }

  // Helper to remove leading indentation from template literals
  function dedent(str: string): string {
    const lines = str.replace(/^\n/, '').split('\n')
    const minIndent = lines
      .filter((line) => line.trim())
      .reduce(
        (min, line) => {
          const match = line.match(/^(\s*)/)
          const indent = match ? match[1].length : 0
          return min === null ? indent : Math.min(min, indent)
        },
        null as number | null,
      )
    return lines
      .map((line) => line.slice(minIndent ?? 0))
      .join('\n')
      .trim()
  }

  // Use dedent for cleaner clipboard content
  const handleCopy = () => {
    const timestampText =
      typeof props.errorDetails.timestamp === 'number'
        ? `Timestamp: ${new Date(props.errorDetails.timestamp).toISOString()}`
        : ''

    const fullErrorText = dedent(`
      Error Message: ${props.errorDetails.message}
      Stack Trace: ${props.errorDetails.stack ?? 'Not available'}
      Context: ${props.errorDetails.context ? JSON.stringify(props.errorDetails.context, null, 2) : 'None'}
      ${timestampText}
    `)

    if (props.onCopy) {
      props.onCopy(fullErrorText)
    } else {
      // Fallback to clipboard API
      navigator.clipboard.writeText(fullErrorText).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = fullErrorText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      })
    }
  }

  return (
    <>
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
        {/* Header with error icon and message */}
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{props.message}</p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button
              type="button"
              class="bg-red-50 rounded-md inline-flex text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDismiss}
            >
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Show details button if message was truncated or has additional details */}
        <Show
          when={
            props.isTruncated ||
            (props.errorDetails.stack != null &&
              props.errorDetails.stack.length > 0) ||
            (props.errorDetails.context != null &&
              Object.keys(props.errorDetails.context).length > 0)
          }
        >
          <div class="mt-3 flex gap-2">
            <button
              type="button"
              class="text-sm text-red-600 hover:text-red-500 font-medium"
              onClick={openModal}
            >
              Show more details
            </button>
            <button
              type="button"
              class="text-sm text-red-600 hover:text-red-500 font-medium"
              onClick={handleCopy}
            >
              Copy error
            </button>
          </div>
        </Show>
      </div>

      {/* Error Details Modal */}
      <ErrorDetailModal
        errorDetails={props.errorDetails}
        isOpen={isModalOpen()}
        onClose={closeModal}
      />
    </>
  )
}

/**
 * Display an expandable error toast using solid-toast directly
 * This function is called from the toast queue system
 */
export function displayExpandableErrorToast(
  message: string,
  isTruncated: boolean,
  errorDetails: ToastError,
  options?: {
    duration?: number
    onDismiss?: () => void
    onCopy?: (text: string) => void
  },
): string {
  const duration = options?.duration ?? (isTruncated ? 8000 : 5000)

  return toast.custom(
    () => (
      <ExpandableErrorToast
        message={message}
        isTruncated={isTruncated}
        errorDetails={errorDetails}
        onDismiss={options?.onDismiss}
        onCopy={options?.onCopy}
      />
    ),
    {
      duration,
    },
  )
}

/**
 * Utility function to create an expandable error toast
 * This integrates with the toast queue system
 */
export function showExpandableErrorToast(
  message: string,
  isTruncated: boolean,
  errorDetails: ToastError,
  options?: {
    duration?: number
    onDismiss?: () => void
    onCopy?: (text: string) => void
  },
): string {
  const duration = options?.duration ?? (isTruncated ? 8000 : 5000)

  // Create a custom toast item that will render the ExpandableErrorToast component
  const toastItem = createToastItem(message, {
    level: 'error',
    context: 'user-action',
    duration,
    dismissible: true,
    // Store the expandable error data in the toast item for later use
    expandableErrorData: {
      isTruncated,
      errorDetails,
      onDismiss: options?.onDismiss,
      onCopy: options?.onCopy,
    },
  })

  return enqueue(toastItem)
}
