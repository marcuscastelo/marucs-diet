import { type Accessor, createEffect, type Setter } from 'solid-js'

import { type Template } from '~/modules/diet/template/domain/template'
import EANInsertModal from '~/sections/ean/components/EANInsertModal'
import { useUnifiedModal } from '~/shared/modal/context/UnifiedModalProvider'
import { openContentModal } from '~/shared/modal/helpers/modalHelpers'

export function ExternalEANInsertModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onSelect: (template: Template) => void
}) {
  const { closeModal } = useUnifiedModal()
  let modalId: string | null = null

  // Effect to manage modal based on visible state
  createEffect(() => {
    const isVisible = props.visible()

    if (isVisible && modalId === null) {
      // Open modal when visible becomes true
      modalId = openContentModal(
        <EANInsertModal
          onSelect={(food) => {
            props.onSelect(food)
            // Close modal after selection
            if (modalId !== null) {
              closeModal(modalId)
              modalId = null
            }
            props.setVisible(false)
          }}
          onClose={() => {
            // Close modal via close button
            if (modalId !== null) {
              closeModal(modalId)
              modalId = null
            }
            props.setVisible(false)
          }}
          enabled={true}
        />,
        {
          title: 'Pesquisar por código de barras',
          size: 'large',
          closeOnOutsideClick: false,
          closeOnEscape: true,
        },
      )
    } else if (!isVisible && modalId !== null) {
      // Close modal when visible becomes false
      closeModal(modalId)
      modalId = null
    }
  })

  // This component now just manages the modal lifecycle
  // The actual rendering is handled by the unified modal system
  return null
}
