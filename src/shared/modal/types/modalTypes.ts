import type { Accessor, JSXElement } from 'solid-js'

import type { ToastError } from '~/modules/toast/domain/toastTypes'

export type ModalId = string
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen'
export type ModalPriority = 'low' | 'normal' | 'high' | 'critical'

export type BaseModalConfig = {
  id?: ModalId
  title?: string
  priority?: ModalPriority
  closeOnOutsideClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  onOpen?: () => void
  onClose?: () => void
  beforeClose?: () => boolean | Promise<boolean>
}

export type ErrorModalConfig = BaseModalConfig & {
  type: 'error'
  errorDetails: ToastError
}

export type ContentModalConfig = BaseModalConfig & {
  type: 'content'
  content: JSXElement | ((modalId: ModalId) => JSXElement)
  footer?: JSXElement | (() => JSXElement)
}

export type ConfirmationModalConfig = BaseModalConfig & {
  type: 'confirmation'
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export type ModalConfig =
  | ErrorModalConfig
  | ContentModalConfig
  | ConfirmationModalConfig

export type ModalState = ModalConfig & {
  id: ModalId
  isOpen: boolean
  isClosing: Accessor<boolean>
  createdAt: Date
  updatedAt: Date
}

export type ModalManager = {
  getModals: () => ModalState[]
  getModal: (id: ModalId) => ModalState | undefined
  openModal: (config: ModalConfig) => ModalId
  closeModal: (id: ModalId) => void
  closeAllModals: () => void
  updateModal: (id: ModalId, updates: Partial<ModalConfig>) => void
  hasOpenModals: () => boolean
  getTopModal: () => ModalState | undefined
}
