/**
 * Expandable Error Toast Component
 *
 * A SolidJS component for displaying error messages with a "Show Details" option
 * that opens a modal with full error information.
 */

import toast from 'solid-toast'
import { ToastError, ToastItem, ToastLevel } from './toastConfig'
import { dequeueById } from './toastQueue'
import { openErrorModal } from './modalState'
import { handleCopyErrorToClipboard } from './clipboardErrorUtils'

export type ExpandableToastProps = {
  /** The display message (potentially truncated) */
  message: string
  /** Whether the message was truncated */
  isTruncated: boolean
  /** Full error details for expansion */
  errorDetails: ToastError
  /** Optional dismiss callback */
  onDismiss?: () => void
  /** Toast type: 'error' | 'success' */
  level: ToastLevel
}

/**
 * Expandable Error Toast Component
 *
 * Shows a truncated error message with an option to open a modal with details.
 */
export function ExpandableToast(props: ExpandableToastProps) {
  const handleDismiss = () => {
    if (props.onDismiss) {
      props.onDismiss()
    }
  }
  const handleCopy = () => {
    void handleCopyErrorToClipboard(props.errorDetails, {
      component: 'ExpandableErrorToast',
      operation: 'handleCopy',
    })
  }

  const isBig = (): boolean => {
    return props.isTruncated || props.message.length > 100
  }

  const hasErrorDetails = (): boolean => {
    return (
      props.errorDetails != null &&
      (props.errorDetails.message !== '' ||
        props.errorDetails.fullError !== '' ||
        props.errorDetails.stack !== '' ||
        Object.keys(props.errorDetails.context || {}).length > 0)
    )
  }

  const isComplex = (): boolean => isBig() || hasErrorDetails()

  return (
    <div class="relative flex flex-col border-2 border-gray-600 text-gray-100 bg-gray-800 shadow-[0_3px_10px_rgba(0,0,0,0.1),_0_3px_3px_rgba(0,0,0,0.05)] max-w-[350px] pointer-events-auto px-[10px] pr-6 py-2 rounded line-height-[1.3]">
      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss"
        aria-label="Dismiss"
        class="absolute top-2 right-2 text-lg text-gray-400 hover:text-gray-200 z-10"
      >
        ✕
      </button>
      <ToastContent
        message={props.message}
        complex={isComplex()}
        onCopy={handleCopy}
        errorDetails={props.errorDetails}
        level={props.level}
      />
    </div>
  )
}

/**
 * Display an expandable error toast using solid-toast directly
 * This function is called from the toast queue system
 */
export function displayExpandableErrorToast(toastItem: ToastItem): string {
  return toast.custom(
    () => (
      <ExpandableToast
        message={toastItem.message}
        isTruncated={
          toastItem.options.expandableErrorData?.isTruncated ?? false
        }
        errorDetails={
          toastItem.options.expandableErrorData?.errorDetails ?? {
            message: 'No error details provided',
            stack: '',
            context: {},
            timestamp: Date.now(),
          }
        }
        onDismiss={() => {
          dequeueById(toastItem.id)
        }}
        level={toastItem.options.level}
      />
    ),
    {
      duration: toastItem.options.duration ?? 8000,
    },
  )
}

/**
 * Success Checkmark Icon Component
 *
 * A SolidJS component for displaying a checkmark icon with animation.
 */
function SuccessCheckmarkIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="1.25rem"
      height="1.25rem"
      class="overflow-visible"
    >
      {/* <!-- Círculo animado verde --> */}
      <circle cx="16" cy="16" r="0" fill="#34C759">
        <animate
          attributeName="opacity"
          values="0; 1; 1"
          dur="0.35s"
          begin="100ms"
          fill="freeze"
        />
        <animate
          attributeName="r"
          values="0; 17.5; 16"
          dur="0.35s"
          begin="100ms"
          fill="freeze"
        />
      </circle>
      {/* <!-- Expansão de fundo verde --> */}
      <circle cx="16" cy="16" r="12" opacity="0" fill="#34C759">
        <animate
          attributeName="opacity"
          values="1; 0"
          dur="1s"
          begin="350ms"
          fill="freeze"
        />
        <animate
          attributeName="r"
          values="12; 26"
          dur="1s"
          begin="350ms"
          fill="freeze"
        />
      </circle>
      {/* <!-- Checkmark branco --> */}
      <path
        fill="none"
        stroke-width="4"
        stroke-dasharray="22"
        stroke-dashoffset="22"
        stroke-linecap="round"
        stroke-miterlimit="10"
        d="M9.8,17.2l3.8,3.6c0.1,0.1,0.3,0.1,0.4,0l9.6-9.7"
        stroke="#FCFCFC"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="22;0"
          dur="0.25s"
          begin="250ms"
          fill="freeze"
        />
      </path>
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="1.25rem"
      height="1.25rem"
      class="overflow-visible"
    >
      <circle cx="16" cy="16" r="0" fill="#FF3B30">
        <animate
          attributeName="opacity"
          values="0; 1; 1"
          dur="0.35s"
          begin="100ms"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 0.6; 1"
          keySplines="0.25 0.71 0.4 0.88; .59 .22 .87 .63"
        />
        <animate
          attributeName="r"
          values="0; 17.5; 16"
          dur="0.35s"
          begin="100ms"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 0.6; 1"
          keySplines="0.25 0.71 0.4 0.88; .59 .22 .87 .63"
        />
      </circle>
      <circle cx="16" cy="16" r="12" opacity="0" fill="#FF3B30">
        <animate
          attributeName="opacity"
          values="1; 0"
          dur="1s"
          begin="320ms"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.0 0.0 0.2 1"
        />
        <animate
          attributeName="r"
          values="12; 26"
          dur="1s"
          begin="320ms"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.0 0.0 0.2 1"
        />
      </circle>
      <path
        fill="none"
        stroke-width="4"
        stroke-dasharray="9"
        stroke-dashoffset="9"
        stroke-linecap="round"
        d="M16,7l0,9"
        stroke="#FFFFFF"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="9;0"
          dur="0.2s"
          begin="250ms"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.0, 0.0, 0.58, 1.0"
        />
      </path>
      <circle cx="16" cy="23" r="2.5" opacity="0" fill="#FFFFFF">
        <animate
          attributeName="opacity"
          values="0;1"
          dur="0.25s"
          begin="350ms"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.0, 0.0, 0.58, 1.0"
        />
      </circle>
    </svg>
  )
}

/**
 * Toast Content Component
 *
 * A SolidJS component for displaying the content of the toast.
 */
function ToastContent(props: {
  message: string
  complex: boolean
  onCopy: () => void
  errorDetails: ToastError
  level: ToastLevel
}) {
  const handleShowDetails = () => {
    openErrorModal(props.errorDetails)
  }
  return (
    <div class="flex flex-col flex-1 mx-[10px] my-1">
      <div class="flex items-center gap-2">
        {props.level === 'error' ? <ErrorIcon /> : <SuccessCheckmarkIcon />}
        <span class="whitespace-pre-line">{props.message}</span>
      </div>
      <div class={props.complex ? 'flex gap-2 mt-2' : 'hidden'}>
        <button
          type="button"
          class="px-2 py-1 rounded bg-gray-700 text-gray-100 text-xs hover:bg-gray-600 transition-colors"
          onClick={handleShowDetails}
        >
          Mostrar detalhes
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded bg-gray-700 text-gray-100 text-xs hover:bg-gray-600 transition-colors"
          onClick={() => props.onCopy()}
        >
          Copiar erro
        </button>
      </div>
    </div>
  )
}
