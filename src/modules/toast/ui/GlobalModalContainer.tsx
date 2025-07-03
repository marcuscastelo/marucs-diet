/**
 * Global Modal Container
 *
 * Renders all active error detail modals independently of toast lifecycle.
 * This component should be mounted at the app level to ensure modals
 * persist even when their triggering toasts are dismissed.
 */

import { For } from 'solid-js'

import { ErrorDetailModal } from '~/sections/common/components/ErrorDetailModal'
import {
  closeErrorModal,
  getOpenModals,
} from '~/shared/modal/bridges/legacyErrorModalBridge'

/**
 * Container component that renders all active error modals.
 * This should be mounted at the app level (e.g., in App.tsx).
 */
export function GlobalModalContainer() {
  const openModals = getOpenModals

  return (
    <For each={openModals()}>
      {(modal) => (
        <ErrorDetailModal
          errorDetails={modal.errorDetails}
          isOpen={modal.isOpen}
          onClose={() => closeErrorModal(modal.id)}
        />
      )}
    </For>
  )
}
