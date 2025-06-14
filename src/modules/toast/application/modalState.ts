/**
 * Global Modal State Manager
 *
 * Manages modal state independently of toast lifecycle to prevent
 * modals from closing when their parent toast disappears.
 */

import { createSignal } from 'solid-js'

import { ToastError } from '~/modules/toast/domain/toastTypes'

type ModalState = {
  id: string
  errorDetails: ToastError
  isOpen: boolean
}

// Global state for managing modals
const [modals, setModals] = createSignal<ModalState[]>([])

/**
 * Opens a modal with the specified error details.
 * @param errorDetails Error details to display in the modal.
 * @returns The modal ID for tracking.
 */
export function openErrorModal(errorDetails: ToastError): string {
  const modalId = `modal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

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
 * Closes a modal by ID.
 * @param modalId The ID of the modal to close.
 */
export function closeErrorModal(modalId: string): void {
  setModals((prev) => prev.filter((modal) => modal.id !== modalId))
}

/**
 * Gets all currently open modals.
 * @returns Array of open modals.
 */
export function getOpenModals(): ModalState[] {
  return modals()
}

/**
 * Gets a specific modal by ID.
 * @param modalId The ID of the modal to retrieve.
 * @returns The modal state or undefined if not found.
 */
export function getModal(modalId: string): ModalState | undefined {
  return modals().find((modal) => modal.id === modalId)
}

/**
 * Closes all open modals.
 */
export function closeAllModals(): void {
  setModals([])
}
