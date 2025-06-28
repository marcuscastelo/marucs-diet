import { type Accessor, createEffect, type Setter } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'

export type ExternalTemplateSearchModalProps = {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onRefetch: () => void
  targetName: string
  onNewUnifiedItem?: (newItem: UnifiedItem) => void
  onFinish?: () => void
}

/**
 * Shared ExternalTemplateSearchModal component that can be used by different edit modals.
 *
 * @see https://github.com/marcuscastelo/marucs-diet/issues/397
 */
export function ExternalTemplateSearchModal(
  props: ExternalTemplateSearchModalProps,
) {
  const handleFinishSearch = () => {
    props.setVisible(false)
    props.onFinish?.()
  }

  // Trigger the onRefetch callback whenever the modal is closed (i.e., when visible becomes false).
  createEffect(() => {
    if (!props.visible()) {
      props.onRefetch()
    }
  })

  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <TemplateSearchModal
        targetName={props.targetName}
        onFinish={handleFinishSearch}
        onNewUnifiedItem={props.onNewUnifiedItem}
      />
    </ModalContextProvider>
  )
}
