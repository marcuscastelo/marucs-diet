/**
 * Helper functions for common modal patterns using the unified modal system.
 * These provide convenient APIs for frequently used modal operations.
 */

import type { JSXElement } from 'solid-js'

import type { ToastError } from '~/modules/toast/domain/toastTypes'
import { modalManager } from '~/shared/modal/core/modalManager'
import type { ModalId, ModalSize } from '~/shared/modal/types/modalTypes'

/**
 * Opens an error modal with standardized styling and behavior.
 *
 * @param error The error details to display
 * @param options Optional configuration for the error modal
 * @returns The modal ID for tracking
 */
export function openErrorModal(
  error: ToastError,
  options?: {
    title?: string
    size?: ModalSize
    priority?: 'low' | 'normal' | 'high' | 'critical'
  },
): ModalId {
  return modalManager.openModal({
    type: 'error',
    title: options?.title ?? 'Error Details',
    errorDetails: error,
    size: options?.size ?? 'large',
    priority: options?.priority ?? 'high',
    closeOnOutsideClick: true,
    closeOnEscape: true,
    showCloseButton: true,
  })
}

/**
 * Opens a confirmation modal with standardized styling and behavior.
 *
 * @param message The confirmation message to display
 * @param options Configuration for the confirmation modal
 * @returns The modal ID for tracking
 */
export function openConfirmModal(
  message: string,
  options: {
    title?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
    size?: ModalSize
    priority?: 'low' | 'normal' | 'high' | 'critical'
  },
): ModalId {
  return modalManager.openModal({
    type: 'confirmation',
    title: options.title ?? 'Confirm Action',
    message,
    confirmText: options.confirmText ?? 'Confirm',
    cancelText: options.cancelText ?? 'Cancel',
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
    size: options.size ?? 'medium',
    priority: options.priority ?? 'normal',
    closeOnOutsideClick: false, // Prevent accidental confirmation
    closeOnEscape: true,
    showCloseButton: true,
  })
}

/**
 * Opens a content modal with standardized styling and behavior.
 *
 * @param content The JSX content to display in the modal (can be element or factory function that receives modalId)
 * @param options Configuration for the content modal
 * @returns The modal ID for tracking
 */
export function openContentModal(
  content: JSXElement | ((modalId: ModalId) => JSXElement),
  options: {
    title?: string
    size?: ModalSize
    priority?: 'low' | 'normal' | 'high' | 'critical'
    closeOnOutsideClick?: boolean
    closeOnEscape?: boolean
    showCloseButton?: boolean
    footer?: JSXElement | (() => JSXElement)
    onClose?: () => void
    className?: string
  } = {},
): ModalId {
  return modalManager.openModal({
    type: 'content',
    title: options.title,
    content,
    footer: options.footer,
    size: options.size ?? 'medium',
    priority: options.priority ?? 'normal',
    closeOnOutsideClick: options.closeOnOutsideClick ?? true,
    closeOnEscape: options.closeOnEscape ?? true,
    showCloseButton: options.showCloseButton ?? true,
    onClose: options.onClose,
    className: options.className,
  })
}

/**
 * Opens an edit modal with standardized styling optimized for editing forms.
 *
 * @param content The edit form content to display (can be element or factory function that receives modalId)
 * @param options Configuration for the edit modal
 * @returns The modal ID for tracking
 */
export function openEditModal(
  content: JSXElement | ((modalId: ModalId) => JSXElement),
  options: {
    title: string
    targetName?: string // For nested editing contexts like "Day Diet > Breakfast"
    size?: ModalSize
    onClose?: () => void
    onSave?: () => void
    onCancel?: () => void
  },
): ModalId {
  const fullTitle =
    options.targetName !== undefined && options.targetName.length > 0
      ? `${options.title} - ${options.targetName}`
      : options.title

  return modalManager.openModal({
    type: 'content',
    title: fullTitle,
    content,
    size: options.size ?? 'large',
    priority: 'normal',
    closeOnOutsideClick: false, // Prevent accidental loss of edits
    closeOnEscape: false, // Require explicit save/cancel
    showCloseButton: true,
    onClose: options.onClose,
  })
}

/**
 * Closes a modal by ID with optional callback.
 *
 * @param modalId The ID of the modal to close
 * @param onClose Optional callback to execute after closing
 */
export function closeModal(modalId: ModalId, onClose?: () => void): void {
  modalManager.closeModal(modalId)
  onClose?.()
}

/**
 * Closes all open modals.
 * Useful for emergency cleanup or navigation changes.
 */
export function closeAllModals(): void {
  modalManager.closeAllModals()
}

/**
 * Checks if any modals are currently open.
 * Useful for preventing certain actions when modals are active.
 */
export function hasOpenModals(): boolean {
  return modalManager.hasOpenModals()
}

/**
 * Gets the currently active (topmost) modal.
 * Useful for modal priority management.
 */
export function getActiveModal() {
  return modalManager.getTopModal()
}
