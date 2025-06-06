import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import {
  getToastSettings,
  updateToastSettings,
  resetToastSettings,
  setShowBackgroundSuccess,
  setShowBackgroundLoading,
  setAutoDismissErrors,
  setDefaultDuration,
  setGroupSimilarToasts,
  setShowDetailedErrors,
} from './toastSettings'

const DEFAULTS = {
  showBackgroundSuccess: false,
  showBackgroundLoading: false,
  autoDismissErrors: false,
  defaultDuration: 5000,
  groupSimilarToasts: true,
  showDetailedErrors: true,
}

const STORAGE_KEY = 'marucs-diet:toast-settings'

let localStorageMock: Record<string, string> = {}

function setMockLocalStorage() {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock[key]
    }),
  })
}

describe('toastSettings', () => {
  beforeEach(() => {
    localStorageMock = {}
    setMockLocalStorage()
    resetToastSettings()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('getToastSettings returns defaults on first run', () => {
    expect(getToastSettings()).toEqual(DEFAULTS)
  })

  it('updateToastSettings only updates provided properties', () => {
    updateToastSettings({ showBackgroundSuccess: true })
    expect(getToastSettings()).toEqual({
      ...DEFAULTS,
      showBackgroundSuccess: true,
    })
    updateToastSettings({ defaultDuration: 1234 })
    expect(getToastSettings().defaultDuration).toBe(1234)
    expect(getToastSettings().showBackgroundSuccess).toBe(true)
  })

  it('setters update only their value', () => {
    setShowBackgroundSuccess(true)
    expect(getToastSettings().showBackgroundSuccess).toBe(true)
    setShowBackgroundLoading(true)
    expect(getToastSettings().showBackgroundLoading).toBe(true)
    setAutoDismissErrors(true)
    expect(getToastSettings().autoDismissErrors).toBe(true)
    setDefaultDuration(9999)
    expect(getToastSettings().defaultDuration).toBe(9999)
    setGroupSimilarToasts(false)
    expect(getToastSettings().groupSimilarToasts).toBe(false)
    setShowDetailedErrors(false)
    expect(getToastSettings().showDetailedErrors).toBe(false)
  })

  it('resetToastSettings restores defaults', () => {
    updateToastSettings({ showBackgroundSuccess: true, defaultDuration: 1234 })
    resetToastSettings()
    expect(getToastSettings()).toEqual(DEFAULTS)
  })

  it('persists to localStorage and loads from it', async () => {
    // Simula valor já persistido no localStorage
    localStorageMock[STORAGE_KEY] = JSON.stringify({
      showBackgroundSuccess: true,
      defaultDuration: 1234,
    })
    vi.resetModules()
    setMockLocalStorage()
    const toastSettingsModule = await import('./toastSettings')
    expect(toastSettingsModule.getToastSettings().showBackgroundSuccess).toBe(
      true,
    )
    expect(toastSettingsModule.getToastSettings().defaultDuration).toBe(1234)
  })

  it('invalid localStorage values are ignored and defaults used', async () => {
    localStorageMock[STORAGE_KEY] = '{ invalid json'
    vi.resetModules()
    setMockLocalStorage()
    const toastSettingsModule = await import('./toastSettings')
    expect(toastSettingsModule.getToastSettings()).toEqual(DEFAULTS)
  })
})
