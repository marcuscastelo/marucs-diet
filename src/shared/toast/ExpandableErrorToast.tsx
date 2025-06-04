/**
 * Expandable Error Toast Component
 *
 * A SolidJS component for displaying error messages with expand/collapse functionality
 * for long error messages. Integrates with the toast queue system.
 */

import { createSignal, Show } from 'solid-js'
import { ToastError } from './toastConfig'

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
 * Shows a truncated error message with an option to expand and view full details.
 * Includes copy-to-clipboard functionality for debugging.
 */
export function ExpandableErrorToast(props: ExpandableErrorToastProps) {
  const [isExpanded, setIsExpanded] = createSignal(false)
  const [isCopied, setIsCopied] = createSignal(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded())
  }

  const handleCopy = () => {
    const timestampText =
      typeof props.errorDetails.timestamp === 'number'
        ? `Timestamp: ${new Date(props.errorDetails.timestamp).toISOString()}`
        : ''

    const fullErrorText = `
Error Message: ${props.errorDetails.message}
Stack Trace: ${props.errorDetails.stack ?? 'Not available'}
Context: ${props.errorDetails.context ? JSON.stringify(props.errorDetails.context, null, 2) : 'None'}
${timestampText}
    `.trim()

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

    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDismiss = () => {
    if (props.onDismiss) {
      props.onDismiss()
    }
  }

  return (
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

      {/* Expandable section for truncated messages */}
      <Show when={props.isTruncated}>
        <div class="mt-3">
          <button
            type="button"
            class="text-sm text-red-600 hover:text-red-500 font-medium"
            onClick={toggleExpanded}
          >
            {isExpanded() ? 'Show less' : 'Show more details'}
          </button>
        </div>
      </Show>

      {/* Expanded error details */}
      <Show when={isExpanded()}>
        <div class="mt-3 bg-red-100 rounded-md p-3">
          <div class="text-sm text-red-800">
            <div class="font-medium mb-2">Full Error Details:</div>
            <div class="whitespace-pre-wrap break-words">
              {props.errorDetails.message}
            </div>

            <Show when={props.errorDetails.stack}>
              <div class="mt-2">
                <div class="font-medium">Stack Trace:</div>
                <pre class="text-xs text-red-700 overflow-x-auto whitespace-pre-wrap break-words">
                  {props.errorDetails.stack}
                </pre>
              </div>
            </Show>

            <Show when={props.errorDetails.context}>
              <div class="mt-2">
                <div class="font-medium">Context:</div>
                <pre class="text-xs text-red-700 overflow-x-auto">
                  {JSON.stringify(props.errorDetails.context, null, 2)}
                </pre>
              </div>
            </Show>
          </div>

          {/* Actions */}
          <div class="mt-3 flex gap-2">
            <button
              type="button"
              class="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleCopy}
            >
              <Show
                when={isCopied()}
                fallback={
                  <>
                    <svg
                      class="h-3 w-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Error
                  </>
                }
              >
                <>
                  <svg
                    class="h-3 w-3 mr-1 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span class="text-green-600">Copied!</span>
                </>
              </Show>
            </button>
          </div>
        </div>
      </Show>
    </div>
  )
}

/**
 * Utility function to create an expandable error toast
 * This integrates with solid-toast to show custom toast content
 */
export function showExpandableErrorToast(
  message: string,
  isTruncated: boolean,
  errorDetails: ToastError,
  _options?: {
    duration?: number
    onDismiss?: () => void
    onCopy?: (text: string) => void
  },
): void {
  // This would integrate with solid-toast custom content
  // For now, we'll implement this in the next phase when we integrate with toastManager
  console.warn(
    'showExpandableErrorToast not yet implemented - will be added in integration phase',
  )
  console.group('📋 Expandable Error Toast')
  console.log('Message:', message)
  console.log('Is Truncated:', isTruncated)
  console.log('Error Details:', errorDetails)
  console.groupEnd()
}
