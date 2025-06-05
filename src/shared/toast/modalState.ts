/**
 * Global Modal State Manager
 *
 * Manages modal state independently of toast lifecycle to prevent
 * modals from closing when their parent toast disappears.
 */

import { createSignal } from 'solid-js'
import { ToastError } from './toastConfig'

type ModalState = {
  id: string
  errorDetails: ToastError
  isOpen: boolean
}

// Global state for managing modals
const [modals, setModals] = createSignal<ModalState[]>([])

/**
 * Opens a modal with the specified error details
 * Returns the modal ID for tracking
 */
export function openErrorModal(errorDetails: ToastError): string {
  const modalId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  setModals((prev) => [
    ...prev,
    {
      id: modalId,
      errorDetails,
      isOpen: true,
    },
  ])

  return modalId
}

/**
 * Closes a modal by ID
 */
export function closeErrorModal(modalId: string): void {
  setModals((prev) => prev.filter((modal) => modal.id !== modalId))
}

/**
 * Gets all currently open modals
 */
export function getOpenModals(): ModalState[] {
  return modals()
}

/**
 * Gets a specific modal by ID
 */
export function getModal(modalId: string): ModalState | undefined {
  return modals().find((modal) => modal.id === modalId)
}

/**
 * Closes all open modals
 */
export function closeAllModals(): void {
  setModals([])
}
