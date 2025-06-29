import { createEffect, createSignal, onMount } from 'solid-js'

type UseHashTabsOptions<T extends string> = {
  validTabs: readonly T[]
  defaultTab: T
  storageKey?: string
}

/**
 * Hook for managing tab state with URL hash synchronization and localStorage persistence.
 * @param options - Configuration options for tab management
 * @returns Tab state and setter with automatic hash/storage sync
 */
export function useHashTabs<T extends string>(options: UseHashTabsOptions<T>) {
  const { validTabs, defaultTab, storageKey } = options

  const getInitialTab = (): T => {
    if (typeof window !== 'undefined') {
      // Check URL hash first
      const hash = window.location.hash.slice(1) as T
      if (validTabs.includes(hash)) {
        return hash
      }

      // Check localStorage if storageKey provided
      if (storageKey !== undefined && storageKey.length > 0) {
        const stored = localStorage.getItem(storageKey)
        if (
          stored !== null &&
          stored.length > 0 &&
          validTabs.includes(stored as T)
        ) {
          return stored as T
        }
      }
    }
    return defaultTab
  }

  const [activeTab, setActiveTab] = createSignal<T>(getInitialTab())

  // Update localStorage when tab changes
  createEffect(() => {
    if (
      typeof window !== 'undefined' &&
      storageKey !== undefined &&
      storageKey.length > 0
    ) {
      localStorage.setItem(storageKey, activeTab())
    }
  })

  // Update hash when tab changes
  createEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.slice(1)
      if (currentHash !== activeTab()) {
        window.location.hash = activeTab()
      }
    }
  })

  // Set initial hash and listen for hash changes from browser navigation
  onMount(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as T
      const current = activeTab()
      if (validTabs.includes(hash) && hash !== current) {
        setActiveTab(() => hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  })

  // Set initial hash if none exists (in effect to track activeTab reactively)
  createEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.location.hash = activeTab()
    }
  })

  return [activeTab, setActiveTab] as const
}
