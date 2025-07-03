import { createEffect } from 'solid-js'

import { getRecipePreparedQuantity } from '~/modules/diet/recipe/domain/recipeOperations'
import { createUnifiedItemFromTemplate } from '~/modules/diet/template/application/createGroupFromTemplate'
import {
  DEFAULT_QUANTITY,
  templateToUnifiedItem,
} from '~/modules/diet/template/application/templateToItem'
import {
  isTemplateRecipe,
  type Template,
} from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { showError } from '~/modules/toast/application/toastManager'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import { handleApiError } from '~/shared/error/errorHandler'
import { formatError } from '~/shared/formatError'
import { closeModal, openEditModal } from '~/shared/modal/helpers/modalHelpers'

export type ExternalTemplateToUnifiedItemModalProps = {
  selectedTemplate: Template
  targetName: string
  onNewUnifiedItem: (
    newItem: UnifiedItem,
    originalAddedItem: TemplateItem,
  ) => Promise<void>
  onClose?: () => void
}

export function ExternalTemplateToUnifiedItemModal(
  props: ExternalTemplateToUnifiedItemModalProps,
) {
  // closeModal is now imported from modalHelpers

  createEffect(() => {
    const template = props.selectedTemplate
    const initialQuantity = isTemplateRecipe(template)
      ? getRecipePreparedQuantity(template)
      : DEFAULT_QUANTITY

    const handleApply = (templateItem: TemplateItem) => {
      const { unifiedItem } = createUnifiedItemFromTemplate(
        template,
        templateItem,
      )

      props.onNewUnifiedItem(unifiedItem, templateItem).catch((err) => {
        handleApiError(err)
        showError(err, {}, `Erro ao adicionar item: ${formatError(err)}`)
      })
    }

    const modalId = openEditModal(
      () => (
        <UnifiedItemEditModal
          targetMealName={props.targetName}
          item={() => templateToUnifiedItem(template, initialQuantity)}
          macroOverflow={() => ({ enable: true })}
          onApply={handleApply}
          onClose={() => {
            closeModal(modalId)
            props.onClose?.()
          }}
        />
      ),
      {
        title: 'Editar Item',
        targetName: props.targetName,
        onClose: () => {
          closeModal(modalId)
          props.onClose?.()
        },
      },
    )
  })

  return null
}
