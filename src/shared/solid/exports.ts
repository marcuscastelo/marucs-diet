/**
 * SolidJS Re-exports - Centralized common imports
 * Use this for frequently used SolidJS primitives across the application
 */

// Core primitives (used in 80%+ of components)
export {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from 'solid-js'

// Less common - import directly when needed
// export { createResource, createContext, useContext } from 'solid-js'

/**
 * Usage patterns:
 *
 * ✅ Good - Common primitives
 * import { createSignal, Show } from '~/shared/solid/exports'
 *
 * ✅ Good - Specialized imports
 * import { createResource } from 'solid-js'
 *
 * ❌ Avoid - Everything centralized
 * export * from 'solid-js' // Breaks tree-shaking
 */
