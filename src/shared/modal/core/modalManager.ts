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
 * Gets the priority order for modals.
 */
function getPriorityOrder(priority: ModalState['priority']): number {
  switch (priority) {
    case 'critical':
      return 4
    case 'high':
      return 3
    case 'normal':
      return 2
    case 'low':
      return 1
    default:
      return 2 // default to normal
  }
}

/**
 * Sorts modals by priority (highest first).
 */
function sortModalsByPriority(modalList: ModalState[]): ModalState[] {
  return [...modalList].sort((a, b) => {
    const priorityA = getPriorityOrder(a.priority)
    const priorityB = getPriorityOrder(b.priority)

    if (priorityA !== priorityB) {
      return priorityB - priorityA // Higher priority first
    }

    // Same priority, sort by creation time (older first)
    return a.createdAt.getTime() - b.createdAt.getTime()
  })
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
  getModals(): ModalState[] {
    return sortModalsByPriority(modals())
  },

  getModal(id: ModalId): ModalState | undefined {
    return modals().find((modal) => modal.id === id)
  },

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
        await new Promise((resolve) => setTimeout(resolve, 100))
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

  updateModal(id: ModalId, updates: Partial<ModalConfig>): void {
    setModals((prev) =>
      prev.map((modal) => {
        if (modal.id === id) {
          return {
            ...modal,
            ...updates,
            updatedAt: new Date(),
          } as ModalState
        }
        return modal
      }),
    )
  },

  hasOpenModals(): boolean {
    return modals().some((modal) => modal.isOpen)
  },

  getTopModal(): ModalState | undefined {
    const sortedModals = this.getModals()
    return sortedModals.find((modal) => modal.isOpen)
  },
}

/**
 * Signal accessor for reactive modal state.
 */
export { modals }

/**
 * Default export for the modal manager.
 */
export default modalManager
