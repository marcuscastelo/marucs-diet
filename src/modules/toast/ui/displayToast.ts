import toast from 'solid-toast'
import { ToastItem } from '~/modules/toast/domain/toastTypes'
import { displayExpandableErrorToast } from '~/modules/toast/ui/ExpandableErrorToast'

/**
 * Display a toast in solid-toast with the appropriate styling
 * Returns the solid-toast ID for later dismissal
 */
export function displayToast(toastItem: ToastItem): string {
  const { message, options } = toastItem
  const { level, expandableErrorData, duration } = options
  let solidToastId: string

  // Check if this is an expandable error toast
  if (expandableErrorData && level === 'error') {
    // Use the displayExpandableErrorToast function directly
    solidToastId = displayExpandableErrorToast(toastItem)
    return solidToastId
  }

  // Prepare solid-toast options with duration
  const solidToastOptions = {
    duration: duration ?? 2000,
  }

  // Standard toast rendering
  switch (level) {
    case 'success':
      solidToastId = toast.success(message, solidToastOptions)
      break
    case 'error':
      solidToastId = toast.error(message, solidToastOptions)
      break
    case 'warning':
      // solid-toast doesn't have warning, use custom or error styling
      solidToastId = toast(message, {
        ...solidToastOptions,
        style: {
          background: '#f59e0b',
          color: 'white',
        },
      })
      break
    case 'info':
    default:
      solidToastId = toast(message, solidToastOptions)
      break
  }

  return solidToastId
}
