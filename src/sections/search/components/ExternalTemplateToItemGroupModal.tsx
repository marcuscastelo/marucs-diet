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
  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <ItemEditModal
        targetName={props.targetName}
        item={() => templateToItem(props.selectedTemplate())}
        macroOverflow={() => ({
          enable: true,
        })}
        onApply={(item) => {
          const template = props.selectedTemplate()
          const { newGroup, operation, templateType } = createGroupFromTemplate(
            template,
            item,
          )

          props.onNewItemGroup(newGroup, item).catch((err) => {
            handleApiError(err, {
              component: 'ExternalTemplateToItemGroupModal',
              operation,
              additionalData: { itemName: item.name, templateType },
            })
            showError(`Erro ao adicionar item: ${formatError(err)}`)
          })
        }}
      />
    </ModalContextProvider>
  )
}
