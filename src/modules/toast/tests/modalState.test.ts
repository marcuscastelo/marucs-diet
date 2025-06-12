import { beforeEach, describe, expect, it } from 'vitest'

import {
  closeAllModals,
  closeErrorModal,
  getModal,
  getOpenModals,
  openErrorModal,
} from '~/modules/toast/application/modalState'
import type { ToastError } from '~/modules/toast/domain/toastTypes'

const mockError: ToastError = {
  message: 'Test error',
  fullError: 'Full error details',
  stack: 'stacktrace',
  context: { foo: 'bar' },
  timestamp: Date.now(),
}

describe('modalState', () => {
  beforeEach(() => {
    closeAllModals()
  })

  it('should open a modal and return its id', () => {
    const id = openErrorModal(mockError)
    expect(typeof id).toBe('string')
    const modals = getOpenModals()
    expect(modals.length).toBe(1)
    expect(modals[0]?.id).toBe(id)
    expect(modals[0]?.isOpen).toBe(true)
    expect(modals[0]?.errorDetails).toEqual(mockError)
  })

  it('should get a modal by id', () => {
    const id = openErrorModal(mockError)
    const modal = getModal(id)
    expect(modal).toBeDefined()
    expect(modal?.id).toBe(id)
  })

  it('should return undefined for unknown id', () => {
    expect(getModal('unknown-id')).toBeUndefined()
  })

  it('should close a modal by id', () => {
    const id = openErrorModal(mockError)
    expect(getOpenModals().length).toBe(1)
    closeErrorModal(id)
    expect(getOpenModals().length).toBe(0)
  })

  it('should close all modals', () => {
    openErrorModal(mockError)
    openErrorModal(mockError)
    expect(getOpenModals().length).toBe(2)
    closeAllModals()
    expect(getOpenModals().length).toBe(0)
  })
})
