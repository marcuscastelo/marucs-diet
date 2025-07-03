/**
 * Integration tests for modal interactions and workflows.
 * Tests complex modal scenarios and user interactions.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { modalManager } from '~/shared/modal/core/modalManager'
import {
  closeAllModals,
  closeModal,
  openConfirmModal,
  openContentModal,
  openErrorModal,
} from '~/shared/modal/helpers/modalHelpers'

const mockError = {
  message: 'Test error',
  fullError: 'Full error details',
  stack: 'stacktrace',
  context: { foo: 'bar' },
  timestamp: Date.now(),
}

describe('Modal Integration Tests', () => {
  beforeEach(() => {
    closeAllModals()
  })

  describe('Modal Stacking and Priority', () => {
    it('should properly stack modals by priority', () => {
      const lowPriorityModal = openContentModal('Low priority content', {
        title: 'Low Priority',
        priority: 'low',
      })

      const highPriorityModal = openContentModal('High priority content', {
        title: 'High Priority',
        priority: 'high',
      })

      const criticalModal = openErrorModal(mockError, {
        title: 'Critical Error',
        priority: 'critical',
      })

      const modals = modalManager.getModals()
      expect(modals).toHaveLength(3)

      // Should be ordered by priority: critical, high, low
      expect(modals[0]?.id).toBe(criticalModal)
      expect(modals[1]?.id).toBe(highPriorityModal)
      expect(modals[2]?.id).toBe(lowPriorityModal)
    })

    it('should handle modal within modal scenarios', () => {
      // Open parent modal
      const parentModal = openContentModal('Parent modal content', {
        title: 'Parent Modal',
        priority: 'normal',
      })

      // Open child modal from within parent
      const childModal = openContentModal('Child modal content', {
        title: 'Child Modal',
        priority: 'high', // Higher priority to appear on top
      })

      const modals = modalManager.getModals()
      expect(modals).toHaveLength(2)

      // Child should be on top due to higher priority
      expect(modals[0]?.id).toBe(childModal)
      expect(modals[1]?.id).toBe(parentModal)

      // Close child modal
      closeModal(childModal)
      const remainingModals = modalManager.getModals()
      expect(remainingModals).toHaveLength(1)
      expect(remainingModals[0]?.id).toBe(parentModal)
    })
  })

  describe('Modal Lifecycle Management', () => {
    it('should handle modal opening and closing with callbacks', () => {
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

      const modal = modalManager.getModal(modalId)
      expect(modal?.type).toBe('confirmation')

      // Simulate confirm action
      if (modal?.type === 'confirmation') {
        expect(modal.message).toBe('Are you sure you want to delete this item?')
        void modal.onConfirm?.()
      }

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onCancel).not.toHaveBeenCalled()
    })

    it('should maintain error modal state independently', () => {
      // Open error modal
      const errorModalId = openErrorModal(mockError)

      // Open and close other modals
      const contentModalId = openContentModal('Some content', {
        title: 'Content',
      })
      closeModal(contentModalId)

      // Error modal should still exist
      const errorModal = modalManager.getModal(errorModalId)
      expect(errorModal).toBeDefined()
      expect(errorModal?.type).toBe('error')
    })
  })

  describe('Error Modal Integration', () => {
    it('should create error modals with proper structure', () => {
      const modalId = openErrorModal(mockError, {
        title: 'Test Error',
        size: 'large',
        priority: 'high',
      })

      const modal = modalManager.getModal(modalId)
      expect(modal?.type).toBe('error')
      expect(modal?.title).toBe('Test Error')
      expect(modal?.priority).toBe('high')

      if (modal?.type === 'error') {
        expect(modal.errorDetails).toEqual(mockError)
      }
    })

    it('should handle multiple error modals', () => {
      const error1 = openErrorModal({ ...mockError, message: 'Error 1' })
      const error2 = openErrorModal(
        { ...mockError, message: 'Error 2' },
        { priority: 'critical' },
      )

      const modals = modalManager.getModals()
      expect(modals).toHaveLength(2)

      // Critical error should be first
      expect(modals[0]?.id).toBe(error2)
      expect(modals[1]?.id).toBe(error1)
    })
  })

  describe('Content Modal Integration', () => {
    it('should handle content modal with footer', () => {
      const modalId = openContentModal('Main content', {
        title: 'Content Modal',
        footer: 'Footer content',
        size: 'medium',
      })

      const modal = modalManager.getModal(modalId)
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

      const modal = modalManager.getModal(modalId)
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

      const modalState1 = modalManager.getModal(modal1)
      const modalState2 = modalManager.getModal(modal2)

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

      const modalState1 = modalManager.getModal(modal1)
      const modalState2 = modalManager.getModal(modal2)

      expect(modalState1?.closeOnEscape).toBe(true)
      expect(modalState2?.closeOnEscape).toBe(false)
    })
  })

  describe('Performance and State Management', () => {
    it('should handle rapid modal opening and closing', () => {
      // Rapidly open multiple modals
      const modalIds = []
      for (let i = 0; i < 10; i++) {
        modalIds.push(openContentModal(`Content ${i}`, { title: `Modal ${i}` }))
      }

      expect(modalManager.getModals()).toHaveLength(10)

      // Rapidly close half of them
      for (let i = 0; i < 5; i++) {
        closeModal(modalIds[i]!)
      }

      expect(modalManager.getModals()).toHaveLength(5)

      // Close remaining
      closeAllModals()
      expect(modalManager.getModals()).toHaveLength(0)
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

    it('should handle modal updates correctly', () => {
      const modalId = openContentModal('Original content', {
        title: 'Original Title',
      })

      // Update modal
      modalManager.updateModal(modalId, {
        title: 'Updated Title',
      })

      const updatedModal = modalManager.getModal(modalId)
      expect(updatedModal?.title).toBe('Updated Title')
      expect(updatedModal?.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle closing non-existent modal gracefully', () => {
      expect(() => closeModal('non-existent-id')).not.toThrow()
    })

    it('should handle getting non-existent modal', () => {
      const modal = modalManager.getModal('non-existent-id')
      expect(modal).toBeUndefined()
    })

    it('should handle updating non-existent modal gracefully', () => {
      expect(() =>
        modalManager.updateModal('non-existent-id', { title: 'New Title' }),
      ).not.toThrow()
    })

    it('should handle empty modal stack operations', () => {
      expect(modalManager.getModals()).toHaveLength(0)
      expect(modalManager.getTopModal()).toBeUndefined()
      expect(modalManager.hasOpenModals()).toBe(false)

      // These should not throw
      expect(() => closeAllModals()).not.toThrow()
    })
  })
})
