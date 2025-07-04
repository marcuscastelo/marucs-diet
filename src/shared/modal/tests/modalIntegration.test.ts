/**
 * Integration tests for modal interactions and workflows.
 * Tests complex modal scenarios and user interactions.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { modalManager, modals } from '~/shared/modal/core/modalManager'
import {
  closeAllModals,
  closeModal,
  openConfirmModal,
  openContentModal,
} from '~/shared/modal/helpers/modalHelpers'

describe('Modal Integration Tests', () => {
  beforeEach(() => {
    closeAllModals()
  })

  describe('Modal Stacking and Priority', () => {
    it('should properly stack modals by creation order', () => {
      const lowPriorityModal = openContentModal('Low priority content', {
        title: 'Low Priority',
        priority: 'low',
      })

      const highPriorityModal = openContentModal('High priority content', {
        title: 'High Priority',
        priority: 'high',
      })

      const criticalModal = openContentModal('Critical content', {
        title: 'Critical Modal',
        priority: 'critical',
      })

      const modalList = modals()
      expect(modalList).toHaveLength(3)

      // Should be ordered by creation order: low, high, critical
      expect(modalList[0]?.id).toBe(lowPriorityModal)
      expect(modalList[1]?.id).toBe(highPriorityModal)
      expect(modalList[2]?.id).toBe(criticalModal)
    })

    it('should handle modal within modal scenarios', async () => {
      // Open parent modal
      const parentModal = openContentModal('Parent modal content', {
        title: 'Parent Modal',
        priority: 'normal',
      })

      // Open child modal from within parent
      const childModal = openContentModal('Child modal content', {
        title: 'Child Modal',
        priority: 'high', // Higher priority (for UI display)
      })

      const modalList = modals()
      expect(modalList).toHaveLength(2)

      // Child should be second since it was created after parent
      expect(modalList[0]?.id).toBe(parentModal)
      expect(modalList[1]?.id).toBe(childModal)

      // Close child modal and wait for async close
      closeModal(childModal)
      // Wait for async close to complete
      await new Promise((resolve) => setTimeout(resolve, 10))
      const remainingModals = modals()
      expect(remainingModals).toHaveLength(1)
      expect(remainingModals[0]?.id).toBe(parentModal)
    })
  })

  describe('Modal Lifecycle Management', () => {
    it('should handle modal opening and closing with callbacks', async () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()

      const modalId = modalManager.openModal({
        type: 'content',
        title: 'Test Modal',
        content: 'Test content',
        onOpen,
        onClose,
      })

      expect(onOpen).toHaveBeenCalledTimes(1)

      closeModal(modalId)
      // Wait for async close to complete
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should handle confirmation modal workflow', () => {
      const onConfirm = vi.fn()
      const onCancel = vi.fn()

      const modalId = openConfirmModal(
        'Are you sure you want to delete this item?',
        {
          title: 'Confirm Deletion',
          onConfirm,
          onCancel,
        },
      )

      const modalList = modals()
      const modal = modalList.find((m) => m.id === modalId)
      expect(modal?.type).toBe('confirmation')

      // Simulate confirm action
      if (modal?.type === 'confirmation') {
        expect(modal.message).toBe('Are you sure you want to delete this item?')
        void modal.onConfirm?.()
      }

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onCancel).not.toHaveBeenCalled()
    })

    it('should maintain modal state independently', () => {
      // Open content modal
      const persistentModalId = openContentModal('Persistent content', {
        title: 'Persistent Modal',
      })

      // Open and close other modals
      const temporaryModalId = openContentModal('Temporary content', {
        title: 'Temporary Modal',
      })
      closeModal(temporaryModalId)

      // Persistent modal should still exist
      const modalList = modals()
      const persistentModal = modalList.find((m) => m.id === persistentModalId)
      expect(persistentModal).toBeDefined()
      expect(persistentModal?.type).toBe('content')
    })
  })

  describe('Content Modal Integration', () => {
    it('should handle content modal with footer', () => {
      const modalId = openContentModal('Main content', {
        title: 'Content Modal',
        footer: 'Footer content',
      })

      const modalList = modals()
      const modal = modalList.find((m) => m.id === modalId)
      expect(modal?.type).toBe('content')
      expect(modal?.title).toBe('Content Modal')

      if (modal?.type === 'content') {
        expect(modal.content).toBe('Main content')
        expect(modal.footer).toBe('Footer content')
      }
    })

    it('should handle factory function content', () => {
      const contentFactory = vi.fn(
        (modalId: string) => `Content for ${modalId}`,
      )

      const modalId = openContentModal(contentFactory, {
        title: 'Factory Modal',
      })

      const modalList = modals()
      const modal = modalList.find((m) => m.id === modalId)
      if (modal?.type === 'content' && typeof modal.content === 'function') {
        const renderedContent = modal.content(modalId)
        expect(renderedContent).toBe(`Content for ${modalId}`)
      }
    })
  })

  describe('Modal Configuration Options', () => {
    it('should respect closeOnOutsideClick configuration', () => {
      const modal1 = openContentModal('Content 1', {
        title: 'Modal 1',
        closeOnOutsideClick: true,
      })

      const modal2 = openContentModal('Content 2', {
        title: 'Modal 2',
        closeOnOutsideClick: false,
      })

      const modalList = modals()
      const modalState1 = modalList.find((m) => m.id === modal1)
      const modalState2 = modalList.find((m) => m.id === modal2)

      expect(modalState1?.closeOnOutsideClick).toBe(true)
      expect(modalState2?.closeOnOutsideClick).toBe(false)
    })

    it('should respect closeOnEscape configuration', () => {
      const modal1 = openContentModal('Content 1', {
        title: 'Modal 1',
        closeOnEscape: true,
      })

      const modal2 = openContentModal('Content 2', {
        title: 'Modal 2',
        closeOnEscape: false,
      })

      const modalList = modals()
      const modalState1 = modalList.find((m) => m.id === modal1)
      const modalState2 = modalList.find((m) => m.id === modal2)

      expect(modalState1?.closeOnEscape).toBe(true)
      expect(modalState2?.closeOnEscape).toBe(false)
    })
  })

  describe('Performance and State Management', () => {
    it('should handle rapid modal opening and closing', async () => {
      // Rapidly open multiple modals
      const modalIds = []
      for (let i = 0; i < 10; i++) {
        modalIds.push(openContentModal(`Content ${i}`, { title: `Modal ${i}` }))
      }

      expect(modals()).toHaveLength(10)

      // Rapidly close half of them
      for (let i = 0; i < 5; i++) {
        closeModal(modalIds[i]!)
      }

      // Wait for async closes to complete
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(modals()).toHaveLength(5)

      // Close remaining
      closeAllModals()
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(modals()).toHaveLength(0)
    })

    it('should generate unique modal IDs', () => {
      const modalIds = new Set()

      for (let i = 0; i < 20; i++) {
        const modalId = openContentModal(`Content ${i}`, {
          title: `Modal ${i}`,
        })
        modalIds.add(modalId)
      }

      expect(modalIds.size).toBe(20) // All IDs should be unique
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle closing non-existent modal gracefully', () => {
      expect(() => closeModal('non-existent-id')).not.toThrow()
    })

    it('should handle getting non-existent modal', () => {
      const modalList = modals()
      const modal = modalList.find((m) => m.id === 'non-existent-id')
      expect(modal).toBeUndefined()
    })

    it('should handle empty modal stack operations', () => {
      expect(modals()).toHaveLength(0)
      expect(modals()[0]).toBeUndefined()
      expect(modals().length > 0).toBe(false)

      // These should not throw
      expect(() => closeAllModals()).not.toThrow()
    })
  })
})
