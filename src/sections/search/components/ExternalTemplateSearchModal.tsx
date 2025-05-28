import {
  type Accessor,
  createEffect,
  type Setter,
} from 'solid-js'
import { 
  ModalContextProvider 
} from '~/sections/common/context/ModalContext'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'

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
export function ExternalTemplateSearchModal(props: ExternalTemplateSearchModalProps) {
  const handleFinishSearch = () => {
    props.setVisible(false)
    props.onFinish?.()
  }

  createEffect(() => {
    // Refetch on modal close
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
