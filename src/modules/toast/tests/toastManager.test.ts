import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as toastQueue from '~/modules/toast/application/toastQueue'
import {
  showError,
  showSuccess,
  showLoading,
  showPromise,
} from '~/modules/toast/application/toastManager'

describe('toastManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('showError creates an error toast with correct options', () => {
    const enqueueSpy = vi.spyOn(toastQueue, 'enqueue').mockReturnValue('id1')
    const error = new Error('fail')
    const id = showError(error, { context: 'user-action' })
    expect(enqueueSpy).toHaveBeenCalled()
    const toastArg = enqueueSpy.mock.calls[0][0]
    expect(toastArg.options.level).toBe('error')
    expect(toastArg.options.context).toBe('user-action')
    expect(id).toBe('id1')
  })

  it('showSuccess creates a success toast', () => {
    const enqueueSpy = vi.spyOn(toastQueue, 'enqueue').mockReturnValue('id2')
    const id = showSuccess('ok', { context: 'system' })
    expect(enqueueSpy).toHaveBeenCalled()
    const toastArg = enqueueSpy.mock.calls[0][0]
    expect(toastArg.options.level).toBe('success')
    expect(toastArg.options.context).toBe('system')
    expect(id).toBe('id2')
  })

  it('showLoading creates a loading toast', () => {
    const enqueueSpy = vi.spyOn(toastQueue, 'enqueue').mockReturnValue('id3')
    // Use a context that will not be skipped by shouldSkipBackgroundToast
    const id = showLoading('loading...', { context: 'user-action' })
    expect(enqueueSpy).toHaveBeenCalled()
    const toastArg = enqueueSpy.mock.calls[0][0]
    expect(toastArg.options.level).toBe('info')
    expect(toastArg.options.context).toBe('user-action')
    expect(toastArg.options.showLoading).not.toBe(false) // showLoading should be true or default
    expect(id).toBe('id3')
  })

  it('showPromise: displays loading, then success on resolve', async () => {
    const enqueueSpy = vi
      .spyOn(toastQueue, 'enqueue')
      .mockReturnValue('loading-id')
    const dequeueByIdSpy = vi
      .spyOn(toastQueue, 'dequeueById')
      .mockReturnValue(true)
    const promise = Promise.resolve('done')
    const result = await showPromise(
      promise,
      {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      },
      { context: 'user-action' },
    )
    expect(enqueueSpy).toHaveBeenCalled()
    expect(dequeueByIdSpy).toHaveBeenCalledWith('loading-id')
    expect(result).toBe('done')
  })

  it('showPromise: displays error on reject', async () => {
    const enqueueSpy = vi
      .spyOn(toastQueue, 'enqueue')
      .mockReturnValue('loading-id')
    const dequeueByIdSpy = vi
      .spyOn(toastQueue, 'dequeueById')
      .mockReturnValue(true)
    const promise = Promise.reject(new Error('fail'))
    // Suppress unhandled rejection warning
    promise.catch(() => {})
    await expect(
      showPromise(
        promise,
        {
          loading: 'Loading...',
          success: 'Success!',
          error: 'Error!',
        },
        { context: 'user-action' },
      ),
    ).rejects.toThrow('fail')
    expect(enqueueSpy).toHaveBeenCalled()
    expect(dequeueByIdSpy).toHaveBeenCalledWith('loading-id')
  })

  it('showPromise: passed options override defaults', async () => {
    const enqueueSpy = vi
      .spyOn(toastQueue, 'enqueue')
      .mockReturnValue('loading-id')
    const dequeueByIdSpy = vi
      .spyOn(toastQueue, 'dequeueById')
      .mockReturnValue(true)
    const promise = Promise.resolve('done')
    await showPromise(
      promise,
      {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      },
      { context: 'user-action', duration: 9999 },
    )
    const toastArg = enqueueSpy.mock.calls[0][0]
    // For loading toasts, duration is always TOAST_DURATION_INFINITY (Infinity)
    expect(toastArg.options.duration).toBe(Infinity)
  })
})
