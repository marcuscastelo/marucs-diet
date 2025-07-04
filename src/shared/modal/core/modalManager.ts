/**
 * Core modal manager implementation using SolidJS signals.
 * Provides centralized state management for all modals in the application.
 */

import { createSignal } from 'solid-js'

import type {
  ModalConfig,
  ModalId,
  ModalManager,
  ModalState,
} from '~/shared/modal/types/modalTypes'
import { createDebug } from '~/shared/utils/createDebug'

const debug = createDebug()

/**
 * Global signal for managing all modal states.
 */
const [modals, setModals] = createSignal<ModalState[]>([])

/**
 * Generates a unique modal ID.
 */
function generateModalId(): ModalId {
  return `modal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Internal method for performing the actual close operation.
 */
function performClose(id: ModalId, modal: ModalState): void {
  debug(`Performing close for modal: ${id}`)
  setModals((prev) => prev.filter((m) => m.id !== id))
  modal.onClose?.()
}

/**
 * Core modal manager implementation.
 */
export const modalManager: ModalManager = {
  openModal(config: ModalConfig): ModalId {
    let modalId: string
    if (config.id !== undefined && config.id.trim() !== '') {
      modalId = config.id.trim()
    } else {
      modalId = generateModalId()
    }
    const now = new Date()

    const [closing, setClosing] = createSignal(false)

    const modalState: ModalState = {
      ...config,
      id: modalId,
      isOpen: true,
      isClosing: closing,
      createdAt: now,
      updatedAt: now,
      // Set default values
      priority: config.priority || 'normal',
      closeOnOutsideClick: config.closeOnOutsideClick ?? true,
      closeOnEscape: config.closeOnEscape ?? true,
      showCloseButton: config.showCloseButton ?? true,
      async beforeClose() {
        setClosing(true)
        // Use shorter timeout in test environment to avoid breaking tests
        const animationDelay =
          typeof window === 'undefined' || import.meta.env.MODE === 'test'
            ? 0
            : 100
        await new Promise((resolve) => setTimeout(resolve, animationDelay))
        return config.beforeClose?.() ?? true
      },
    }

    setModals((prev) => {
      // Remove existing modal with same ID if it exists
      const filtered = prev.filter((modal) => modal.id !== modalId)
      return [...filtered, modalState]
    })

    // Call onOpen callback if provided
    if (typeof window !== 'undefined') {
      // Log every modal open and print stack trace using createDebug
      debug('[modalManager] Modal opened:', {
        id: modalId,
        type: config.type,
        title: config.title,
      })
      debug(new Error('[modalManager] Modal open stack trace').stack)
    }
    config.onOpen?.()

    return modalId
  },

  closeModal(id: ModalId): void {
    const modal = modals().find((m) => m.id === id)
    if (!modal) return

    debug(`Closing modal: ${id}`)
    // Call beforeClose callback if provided
    const beforeCloseResult = modal.beforeClose?.()
    debug(`beforeClose result for modal ${id}:`, beforeCloseResult)

    if (beforeCloseResult instanceof Promise) {
      beforeCloseResult
        .then((shouldClose) => {
          if (shouldClose !== false) {
            performClose(id, modal)
          }
        })
        .catch(() => {
          // If beforeClose throws, still close the modal
          performClose(id, modal)
        })
    } else if (beforeCloseResult !== false) {
      performClose(id, modal)
    }
  },

  closeAllModals(): void {
    const currentModals = modals()
    const modalsToKeep: ModalState[] = []

    currentModals.forEach((modal) => {
      const beforeCloseResult = modal.beforeClose?.()

      if (beforeCloseResult instanceof Promise) {
        beforeCloseResult
          .then((shouldClose) => {
            if (shouldClose !== false) {
              modal.onClose?.()
            } else {
              modalsToKeep.push(modal)
            }
          })
          .catch(() => {
            modal.onClose?.()
          })
      } else if (beforeCloseResult !== false) {
        modal.onClose?.()
      } else {
        modalsToKeep.push(modal)
      }
    })

    // Update the state to keep only the modals that should not be closed
    setModals(modalsToKeep)
  },
}

/**
 * Signal accessor for reactive modal state.
 */
export { modals }
