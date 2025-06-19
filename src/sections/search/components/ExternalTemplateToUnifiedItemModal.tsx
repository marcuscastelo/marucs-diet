import { type Accessor, type Setter } from 'solid-js'

import { createUnifiedItemFromTemplate } from '~/modules/diet/template/application/createGroupFromTemplate'
import { templateToItem } from '~/modules/diet/template/application/templateToItem'
import { type Template } from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { showError } from '~/modules/toast/application/toastManager'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import { handleApiError } from '~/shared/error/errorHandler'
import { formatError } from '~/shared/formatError'
import { convertTemplateItemToUnifiedItem } from '~/shared/utils/itemViewConversion'

export type ExternalTemplateToUnifiedItemModalProps = {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  selectedTemplate: Accessor<Template>
  targetName: string
  onNewUnifiedItem: (
    newItem: UnifiedItem,
    originalAddedItem: TemplateItem,
  ) => Promise<void>
}

export function ExternalTemplateToUnifiedItemModal(
  props: ExternalTemplateToUnifiedItemModalProps,
) {
  const template = () => props.selectedTemplate()

  const handleApply = (item: UnifiedItem) => {
    // Convert UnifiedItem to TemplateItem for the second parameter
    const templateItem: TemplateItem = {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      reference: item.reference.type === 'food' ? item.reference.id : 0,
      macros:
        item.reference.type === 'food'
          ? item.reference.macros
          : { carbs: 0, protein: 0, fat: 0 },
      __type: 'Item',
    }

    const { unifiedItem } = createUnifiedItemFromTemplate(
      template(),
      templateItem,
    )

    props.onNewUnifiedItem(unifiedItem, templateItem).catch((err) => {
      handleApiError(err)
      showError(err, {}, `Erro ao adicionar item: ${formatError(err)}`)
    })
  }

  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <UnifiedItemEditModal
        targetMealName={props.targetName}
        item={() =>
          convertTemplateItemToUnifiedItem(
            templateToItem(template(), 100),
            template(),
          )
        } // Start with default 100g
        macroOverflow={() => ({ enable: true })}
        onApply={handleApply}
      />
    </ModalContextProvider>
  )
}
