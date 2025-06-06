/**
 * Toast Settings
 *
 * User-configurable settings for the toast notification system.
 * Settings are persisted in local storage.
 */

import { createSignal, createEffect } from 'solid-js'

/**
 * User-configurable toast settings
 * - showBackgroundSuccess: Whether to show success toasts for background operations
 * - showBackgroundLoading: Whether to show loading toasts for background operations
 * - autoDismissErrors: Whether to automatically dismiss error toasts
 * - defaultDuration: Default duration for toasts in milliseconds
 * - groupSimilarToasts: Whether to group similar toasts together
 * - showDetailedErrors: Whether to show detailed error information in toasts
 */
export type ToastSettings = {
  /** Show success toasts for background operations */
  showBackgroundSuccess: boolean
  /** Show loading toasts for background operations */
  showBackgroundLoading: boolean
  /** Automatically dismiss error toasts */
  autoDismissErrors: boolean
  /** Default duration for toasts in milliseconds */
  defaultDuration: number
  /** Group similar toasts together */
  groupSimilarToasts: boolean
  /** Show detailed error information in toasts */
  showDetailedErrors: boolean
}

/**
 * Default toast settings
 */
const DEFAULT_SETTINGS: ToastSettings = {
  showBackgroundSuccess: false,
  showBackgroundLoading: false,
  autoDismissErrors: false,
  defaultDuration: 5000,
  groupSimilarToasts: true,
  showDetailedErrors: true,
}

// Local storage key for persisting settings
const STORAGE_KEY = 'marucs-diet:toast-settings'

/**
 * Load settings from local storage
 */
function loadSettings(): ToastSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored != null && stored.length > 0) {
      const parsed = JSON.parse(stored) as Partial<ToastSettings>
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error('Failed to load toast settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

// Create reactive signal for settings
const [settings, setSettings] = createSignal<ToastSettings>(loadSettings())

// Persist settings to local storage when they change
createEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings()))
  } catch (error) {
    console.error('Failed to save toast settings:', error)
  }
})

/**
 * Get the current toast settings
 */
export function getToastSettings(): ToastSettings {
  return settings()
}

/**
 * Update toast settings
 */
export function updateToastSettings(updates: Partial<ToastSettings>): void {
  setSettings((current) => ({ ...current, ...updates }))
}

/**
 * Reset toast settings to defaults
 */
export function resetToastSettings(): void {
  setSettings({ ...DEFAULT_SETTINGS })
}

/**
 * Helper functions for specific settings
 */

export function setShowBackgroundSuccess(value: boolean): void {
  updateToastSettings({ showBackgroundSuccess: value })
}

export function setShowBackgroundLoading(value: boolean): void {
  updateToastSettings({ showBackgroundLoading: value })
}

export function setAutoDismissErrors(value: boolean): void {
  updateToastSettings({ autoDismissErrors: value })
}

export function setDefaultDuration(value: number): void {
  updateToastSettings({ defaultDuration: value })
}

export function setGroupSimilarToasts(value: boolean): void {
  updateToastSettings({ groupSimilarToasts: value })
}

export function setShowDetailedErrors(value: boolean): void {
  updateToastSettings({ showDetailedErrors: value })
}

// Add JSDoc for all exported types and functions for better maintainability
