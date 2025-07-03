/**
 * Basic test for the unified modal system.
 * Validates that the core functionality works correctly.
 */

import { describe, expect, it } from 'vitest'

import { modalManager } from '~/shared/modal/core/modalManager'

describe('Unified Modal System', () => {
  it('should create and manage modal states', () => {
    // Test opening a basic content modal
    const modalId = modalManager.openModal({
      type: 'content',
      title: 'Test Modal',
      content: 'Test content',
    })

    expect(modalId).toBeDefined()
    expect(typeof modalId).toBe('string')

    // Verify modal exists
    const modal = modalManager.getModal(modalId)
    expect(modal).toBeDefined()
    expect(modal?.type).toBe('content')
    expect(modal?.title).toBe('Test Modal')
    expect(modal?.isOpen).toBe(true)

    // Test closing modal
    modalManager.closeModal(modalId)
    const closedModal = modalManager.getModal(modalId)
    expect(closedModal).toBeUndefined()
  })

  it('should handle error modals', () => {
    const modalId = modalManager.openModal({
      type: 'error',
      title: 'Error Modal',
      errorDetails: {
        message: 'Test error message',
        fullError: 'Detailed error info',
      },
    })

    const modal = modalManager.getModal(modalId)
    expect(modal?.type).toBe('error')

    modalManager.closeModal(modalId)
  })

  it('should handle confirmation modals', () => {
    const modalId = modalManager.openModal({
      type: 'confirmation',
      title: 'Confirm Action',
      message: 'Are you sure?',
      onConfirm: () => {
        // Test callback
      },
      onCancel: () => {
        // Test callback
      },
    })

    const modal = modalManager.getModal(modalId)
    expect(modal?.type).toBe('confirmation')

    modalManager.closeModal(modalId)
  })

  it('should track multiple modals and prioritize correctly', () => {
    const modal1 = modalManager.openModal({
      type: 'content',
      title: 'Low Priority',
      content: 'Content 1',
      priority: 'low',
    })

    const modal2 = modalManager.openModal({
      type: 'content',
      title: 'High Priority',
      content: 'Content 2',
      priority: 'high',
    })

    const allModals = modalManager.getModals()
    expect(allModals).toHaveLength(2)

    // Higher priority should come first
    expect(allModals[0]?.id).toBe(modal2)
    expect(allModals[1]?.id).toBe(modal1)

    modalManager.closeAllModals()
    expect(modalManager.getModals()).toHaveLength(0)
  })

  it('should generate unique IDs', () => {
    const ids = new Set()
    for (let i = 0; i < 10; i++) {
      const modalId = modalManager.openModal({
        type: 'content',
        content: `Test ${i}`,
      })
      ids.add(modalId)
    }

    expect(ids.size).toBe(10) // All IDs should be unique
    modalManager.closeAllModals()
  })
})
