import { type Accessor, createEffect, type Setter } from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'

export type ExternalTemplateSearchModalProps = {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onRefetch: () => void
  targetName: string
  onNewItemGroup: (newGroup: ItemGroup) => void
  onFinish?: () => void
}

/**
 * Shared ExternalTemplateSearchModal component that was previously duplicated
 * between RecipeEditModal and ItemGroupEditModal.
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
        onNewItemGroup={props.onNewItemGroup}
      />
    </ModalContextProvider>
  )
}
