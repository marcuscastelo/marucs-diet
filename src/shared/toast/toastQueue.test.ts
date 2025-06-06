// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  enqueue,
  dequeue,
  dequeueById,
  clear,
  getCurrentToast,
  updateConfig,
  createToastItem,
  initQueue,
  disposeQueue,
} from './toastQueue'
import { DEFAULT_TOAST_OPTIONS, TOAST_PRIORITY } from './toastConfig'

const baseOptions = DEFAULT_TOAST_OPTIONS['user-action']

function makeToast(
  message: string,
  level: keyof typeof TOAST_PRIORITY = 'info',
  extra: Partial<typeof baseOptions> = {},
) {
  return createToastItem(message, { ...baseOptions, ...extra, level })
}

describe('toastQueue', () => {
  beforeEach(() => {
    clear()
    disposeQueue()
    initQueue()
  })

  it('enqueue adds a toast and returns an id', () => {
    const toast = makeToast('msg1')
    const id = enqueue(toast)
    expect(typeof id).toBe('string')
    expect(getCurrentToast()?.id).toBe(id)
  })

  it('deduplication: does not add identical toasts', () => {
    const toast = makeToast('msg-dup')
    enqueue(toast)
    const id2 = enqueue({ ...toast })
    expect(id2).toBeDefined()
    // Só um toast deve estar na fila (o dedup pode ser por mensagem ou id, depende da implementação)
    expect(getCurrentToast()?.message).toBe('msg-dup')
    dequeue()
    expect(getCurrentToast()).toBeNull()
  })

  it('priority: higher priority toasts appear first', () => {
    const t1 = makeToast('low', 'info')
    const t2 = makeToast('high', 'error')
    enqueue(t1)
    enqueue(t2)
    expect(getCurrentToast()?.message).toBe('high')
  })

  it('dequeue removes the current toast', () => {
    const t1 = makeToast('to-remove')
    enqueue(t1)
    expect(getCurrentToast()?.message).toBe('to-remove')
    dequeue()
    expect(getCurrentToast()).toBeNull()
  })

  it('dequeueById removes the correct toast', () => {
    const t1 = makeToast('a')
    const t2 = makeToast('b')
    const id1 = enqueue(t1)
    const id2 = enqueue(t2)
    // Remove o segundo
    const removed = dequeueById(id2)
    expect(removed).toBe(true)
    // O primeiro ainda está lá
    expect(getCurrentToast()?.id).toBe(id1)
  })

  it('clear empties the queue', () => {
    enqueue(makeToast('x'))
    enqueue(makeToast('y'))
    clear()
    expect(getCurrentToast()).toBeNull()
  })

  it('getCurrentToast returns the correct toast', () => {
    const t = makeToast('current')
    enqueue(t)
    expect(getCurrentToast()?.message).toBe('current')
  })

  it('updateConfig changes the queue config', () => {
    updateConfig({ transitionDelay: 999 })
    // Não há getter, mas não deve lançar erro
    expect(() => updateConfig({ transitionDelay: 123 })).not.toThrow()
  })

  it('createToastItem creates a toast item with correct data', () => {
    const item = createToastItem('oi', { ...baseOptions, level: 'success' })
    expect(item.message).toBe('oi')
    expect(item.options.level).toBe('success')
    expect(typeof item.id).toBe('string')
    expect(typeof item.timestamp).toBe('number')
    expect(typeof item.priority).toBe('number')
  })

  it('initQueue and disposeQueue do not throw', () => {
    expect(() => {
      disposeQueue()
      initQueue()
    }).not.toThrow()
  })
})
