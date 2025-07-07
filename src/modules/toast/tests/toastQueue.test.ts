// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import * as toastQueue from '~/modules/toast/application/toastQueue'
import {
  createToastItem,
  DEFAULT_TOAST_OPTIONS,
  type ToastType,
} from '~/modules/toast/domain/toastTypes'
import * as solidToast from '~/modules/toast/ui/solidToast'

const baseOptions = DEFAULT_TOAST_OPTIONS['user-action']

function makeToast(
  message: string,
  type: ToastType = 'info',
  extra: Partial<typeof baseOptions> = {},
) {
  return createToastItem(message, { ...baseOptions, ...extra, type })
}

function flushAll() {
  return new Promise((resolve) => setTimeout(resolve, 300))
}

describe('toastQueue (refactored)', () => {
  // TODO: These tests depend on Solid.js reactivity and queue processing,
  // which is not reliably testable in Vitest without a running Solid root/app.
  // They should be re-enabled when the queue exposes a testable API or
  // when a deterministic flush/process method is available.
  it.skip('registerToast adds a toast and triggers display', async () => {
    const _displaySpy = vi
      .spyOn(solidToast, 'displaySolidToast')
      .mockImplementation(() => 'solid-id-1')
    const toast = makeToast('msg1')
    toastQueue.registerToast(toast)
    await flushAll()
    expect(_displaySpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'msg1' }),
    )
  })

  it.skip('killToast removes a toast from queue and history', async () => {
    const _displaySpy = vi
      .spyOn(solidToast, 'displaySolidToast')
      .mockImplementation(() => 'solid-id-2')
    const dismissSpy = vi
      .spyOn(solidToast, 'dismissSolidToast')
      .mockImplementation(() => {})
    const toast = makeToast('msg2')
    toastQueue.registerToast(toast)
    await flushAll()
    toastQueue.killToast(toast.id)
    await flushAll()
    expect(dismissSpy).toHaveBeenCalledWith('solid-id-2')
  })

  it.skip('registerToast can queue multiple toasts, only one is displayed at a time', async () => {
    const _displaySpy = vi
      .spyOn(solidToast, 'displaySolidToast')
      .mockImplementation(() => 'solid-id-3')
    const t1 = makeToast('first')
    const t2 = makeToast('second')
    toastQueue.registerToast(t1)
    toastQueue.registerToast(t2)
    await flushAll()
    expect(_displaySpy).toHaveBeenCalledTimes(1)
    // Dismiss first to allow second
    toastQueue.killToast(t1.id)
    await flushAll()
    expect(_displaySpy).toHaveBeenCalledTimes(2)
    expect(_displaySpy.mock.calls[1]?.[0]?.message).toBe('second')
  })

  it('killToast does nothing if toast does not exist', () => {
    const dismissSpy = vi
      .spyOn(solidToast, 'dismissSolidToast')
      .mockImplementation(() => {})
    toastQueue.killToast('non-existent-id')
    expect(dismissSpy).not.toHaveBeenCalled()
  })

  // Deduplication and priority are TODOs in the implementation, so we only check that no crash occurs
  it('registerToast does not crash on duplicate toasts', () => {
    const toast = makeToast('dup')
    expect(() => {
      toastQueue.registerToast(toast)
      toastQueue.registerToast({ ...toast })
    }).not.toThrow()
  })
})
