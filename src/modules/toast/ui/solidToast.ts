import toast from 'solid-toast'
import { ToastItem } from '~/modules/toast/domain/toastTypes'
import { displayExpandableErrorToast } from '~/modules/toast/ui/ExpandableErrorToast'
import { handleApiError } from '~/shared/error/errorHandler'

/**
 * Display a toast in solid-toast with the appropriate styling
 * Returns the solid-toast ID for later dismissal
 */
export function displaySolidToast(toastItem: ToastItem): string {
  const { message, options } = toastItem
  const { type, expandableErrorData, duration } = options
  let solidToastId: string

  // Check if this is an expandable error toast
  if (expandableErrorData && type === 'error') {
    // Use the displayExpandableErrorToast function directly
    solidToastId = displayExpandableErrorToast(toastItem)
    return solidToastId
  }

  // Prepare solid-toast options with duration
  const solidToastOptions = {
    duration: duration,
  }

  // Standard toast rendering
  switch (type) {
    case 'success':
      solidToastId = toast.success(message, solidToastOptions)
      break
    case 'error':
      solidToastId = toast.error(message, solidToastOptions)
      break
    case 'loading':
      solidToastId = toast.loading(message, {
        ...solidToastOptions,
        duration: 0, // Loading toasts should not auto-dismiss
      })
      break
    case 'info':
      solidToastId = toast(message, solidToastOptions)
      break
    default:
      ;((_: never) => _)(type) // TODO:   Create a better function for exhaustive checks
      handleApiError(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        new Error(`Unknown toast type: ${type}`),
        {
          component: 'displayToast',
          operation: 'unknownToastType',
          additionalData: { type, message },
        },
      )
      return ''
  }

  return solidToastId
}

/**
 * Dismiss a toast by its solid-toast ID
 */
export function dismissSolidToast(solidToastId: string): void {
  toast.dismiss(solidToastId)
}
