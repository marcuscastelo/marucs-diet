import { type Accessor, type Setter } from 'solid-js'

import { createUnifiedItemFromTemplate } from '~/modules/diet/template/application/createGroupFromTemplate'
import {
  templateToItem,
  templateToUnifiedItem,
} from '~/modules/diet/template/application/templateToItem'
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

  const handleApply = (templateItem: TemplateItem) => {
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
            templateToUnifiedItem(template(), 100),
            template(),
          )
        } // Start with default 100g
        macroOverflow={() => ({ enable: true })}
        onApply={handleApply}
      />
    </ModalContextProvider>
  )
}
