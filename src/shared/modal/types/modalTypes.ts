/**
 * Core types for the unified modal system.
 * Defines interfaces and types used across all modal functionality.
 */

import type { Accessor, JSXElement } from 'solid-js'

import type { ToastError } from '~/modules/toast/domain/toastTypes'

/**
 * Unique identifier for a modal instance.
 */
export type ModalId = string

/**
 * Size variants for modals.
 */
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen'

/**
 * Priority levels for modal display order.
 */
export type ModalPriority = 'low' | 'normal' | 'high' | 'critical'

/**
 * Base configuration for all modals.
 */
export type BaseModalConfig = {
  /** Unique identifier for the modal */
  id?: ModalId
  /** Modal title */
  title?: string
  /** Priority for display order */
  priority?: ModalPriority
  /** Whether the modal can be closed by clicking outside */
  closeOnOutsideClick?: boolean
  /** Whether the modal can be closed with the ESC key */
  closeOnEscape?: boolean
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Custom CSS class names */
  className?: string
  /** Custom data attributes */
  dataAttributes?: Record<string, string>
  /** Callback fired when modal opens */
  onOpen?: () => void
  /** Callback fired when modal closes */
  onClose?: () => void
  /** Callback fired before modal closes (can prevent closing) */
  beforeClose?: () => boolean | Promise<boolean>
}

/**
 * Configuration for error detail modals.
 */
export type ErrorModalConfig = BaseModalConfig & {
  type: 'error'
  /** Error details to display - compatible with ToastError */
  errorDetails: ToastError
}

/**
 * Configuration for generic content modals.
 */
export type ContentModalConfig = BaseModalConfig & {
  type: 'content'
  /** Modal content - can be JSX element or factory function that receives modalId */
  content: JSXElement | ((modalId: ModalId) => JSXElement)
  /** Optional footer content - can be JSX element or factory function */
  footer?: JSXElement | (() => JSXElement)
}

/**
 * Configuration for confirmation modals.
 */
export type ConfirmationModalConfig = BaseModalConfig & {
  type: 'confirmation'
  /** Confirmation message */
  message: string
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Callback for confirm action */
  onConfirm?: () => void | Promise<void>
  /** Callback for cancel action */
  onCancel?: () => void
}

/**
 * Union type for all modal configurations.
 */
export type ModalConfig =
  | ErrorModalConfig
  | ContentModalConfig
  | ConfirmationModalConfig

/**
 * Runtime modal state.
 */
export type ModalState = ModalConfig & {
  /** Unique identifier (always present in state) */
  id: ModalId
  /** Whether the modal is currently open */
  isOpen: boolean
  /** Whether the modal is visible (can be closed) */
  isClosing: Accessor<boolean>
  /** Timestamp when modal was created */
  createdAt: Date
  /** Timestamp when modal was last updated */
  updatedAt: Date
}

/**
 * Modal manager interface.
 */
export type ModalManager = {
  /** Get all current modals */
  getModals: () => ModalState[]
  /** Get a specific modal by ID */
  getModal: (id: ModalId) => ModalState | undefined
  /** Open a modal with the given configuration */
  openModal: (config: ModalConfig) => ModalId
  /** Close a modal by ID */
  closeModal: (id: ModalId) => void
  /** Close all modals */
  closeAllModals: () => void
  /** Update a modal configuration */
  updateModal: (id: ModalId, updates: Partial<ModalConfig>) => void
  /** Check if any modals are open */
  hasOpenModals: () => boolean
  /** Get the topmost (highest priority) modal */
  getTopModal: () => ModalState | undefined
}
