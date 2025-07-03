/**
 * Legacy Error Modal Bridge
 *
 * Provides backward compatibility for the existing error modal API
 * while using the unified modal system underneath.
 */

// Import legacy functions for fallback

import type { ToastError } from '~/modules/toast/domain/toastTypes'
import { modalManager } from '~/shared/modal/core/modalManager'

/**
 * Opens an error modal with the specified error details.
 *
 * This function maintains backward compatibility with the existing API
 * while using the unified modal system internally when feature flag is enabled.
 *
 * @param errorDetails Error details to display in the modal.
 * @returns The modal ID for tracking.
 */
export function openErrorModal(errorDetails: ToastError): string {
  return modalManager.openModal({
    type: 'error',
    title: 'Error Details',
    errorDetails,
    priority: 'high',
    size: 'large',
    closeOnOutsideClick: true,
    closeOnEscape: true,
    showCloseButton: true,
  })
}

/**
 * Closes an error modal by ID.
 *
 * @param modalId The ID of the modal to close.
 */
export function closeErrorModal(modalId: string): void {
  modalManager.closeModal(modalId)
}

/**
 * Gets all open error modals.
 *
 * @returns Array of open modal states.
 */
export function getOpenModals() {
  return modalManager.getModals().filter((modal) => modal.type === 'error')
}

/**
 * Gets all open modals as a signal (for reactive usage).
 * This maintains compatibility with the old API structure.
 */
export function getOpenModalsSignal() {
  // Return a function that filters for error modals
  return () =>
    modalManager.getModals().filter((modal) => modal.type === 'error')
}

/**
 * Closes all modals.
 *
 * This function provides a way to close all modals at once,
 * maintaining compatibility with the legacy API.
 */
export function closeAllModals(): void {
  // Close all error modals specifically
  const errorModals = modalManager
    .getModals()
    .filter((modal) => modal.type === 'error')
  errorModals.forEach((modal) => modalManager.closeModal(modal.id))
}

/**
 * Gets a specific modal by ID.
 *
 * @param modalId The ID of the modal to retrieve.
 * @returns The modal state or undefined if not found.
 */
export function getModal(modalId: string) {
  return modalManager.getModals().find((modal) => modal.id === modalId)
}
