import { type Accessor, type Setter } from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createGroupFromTemplate } from '~/modules/diet/template/application/createGroupFromTemplate'
import { templateToItem } from '~/modules/diet/template/application/templateToItem'
import { type Template } from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'
import { handleApiError } from '~/shared/error/errorHandler'
import { formatError } from '~/shared/formatError'

export type ExternalTemplateToItemGroupModalProps = {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  selectedTemplate: Accessor<Template>
  targetName: string
  onNewItemGroup: (
    newGroup: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => Promise<void>
}

export function ExternalTemplateToItemGroupModal(
  props: ExternalTemplateToItemGroupModalProps,
) {
  const template = () => props.selectedTemplate()

  const handleApply = (item: TemplateItem) => {
    const { newGroup } = createGroupFromTemplate(template(), item)

    props.onNewItemGroup(newGroup, item).catch((err) => {
      handleApiError(err)
      showError(err, {}, `Erro ao adicionar item: ${formatError(err)}`)
    })
  }

  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <ItemEditModal
        targetName={props.targetName}
        item={() => templateToItem(template(), 100)} // Start with default 100g
        macroOverflow={() => ({ enable: true })}
        onApply={handleApply}
      />
    </ModalContextProvider>
  )
}
