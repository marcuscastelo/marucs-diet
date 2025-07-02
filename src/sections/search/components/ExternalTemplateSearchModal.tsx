import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
} from 'solid-js'

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
 * @see https://github.com/marcuscastelo/macroflows/issues/397
 */
export function ExternalTemplateSearchModal(
  props: ExternalTemplateSearchModalProps,
) {
  const [isFinishing, setIsFinishing] = createSignal(false)

  const handleFinishSearch = () => {
    console.debug('[ExternalTemplateSearchModal] handleFinishSearch called')
    if (isFinishing()) {
      console.debug('[ExternalTemplateSearchModal] Already finishing, ignoring')
      return // Prevent multiple calls
    }
    setIsFinishing(true)
    console.debug('[ExternalTemplateSearchModal] Setting isFinishing to true')

    // Immediately close the modal to prevent any re-opening
    console.debug(
      '[ExternalTemplateSearchModal] Closing modal, current visible:',
      props.visible(),
    )
    props.setVisible(false)

    // Call onFinish immediately in the next tick to ensure modal closure is processed
    setTimeout(() => {
      console.debug('[ExternalTemplateSearchModal] Calling props.onFinish')
      props.onFinish?.()
      console.debug(
        '[ExternalTemplateSearchModal] Setting isFinishing to false',
      )
      setIsFinishing(false)
    }, 0)
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
