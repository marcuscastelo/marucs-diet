/**
 * Unified Modal Context Provider for SolidJS.
 * Provides global modal state management across the application.
 */

import {
  createContext,
  type JSXElement,
  type ParentComponent,
  useContext,
} from 'solid-js'

import { modalManager, modals } from '~/shared/modal/core/modalManager'
import type { UnifiedModalContext } from '~/shared/modal/types/modalTypes'

/**
 * Modal context instance.
 */
const ModalContext = createContext<UnifiedModalContext>()

/**
 * Hook to access the unified modal context.
 * Must be used within a UnifiedModalProvider.
 */
export function useUnifiedModal(): UnifiedModalContext {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error(
      'useUnifiedModal must be used within a UnifiedModalProvider',
    )
  }

  return context
}

/**
 * Props for the UnifiedModalProvider component.
 */
export type UnifiedModalProviderProps = {
  children: JSXElement
}

/**
 * Unified Modal Provider component.
 * Provides modal context to all child components.
 */
export const UnifiedModalProvider: ParentComponent<
  UnifiedModalProviderProps
> = (props) => {
  const contextValue: UnifiedModalContext = {
    // Include all modal manager methods
    ...modalManager,
    // Add reactive signal accessor
    modals,
  }

  return (
    <ModalContext.Provider value={contextValue}>
      {props.children}
    </ModalContext.Provider>
  )
}

/**
 * Default export for convenience.
 */
export default UnifiedModalProvider
