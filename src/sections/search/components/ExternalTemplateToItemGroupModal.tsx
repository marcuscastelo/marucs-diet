import { type Accessor, type Setter } from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { deleteRecipe } from '~/modules/diet/recipe/application/recipe'
import { createGroupFromTemplate } from '~/modules/diet/template/application/createGroupFromTemplate'
import { templateToItem } from '~/modules/diet/template/application/templateToItem'
import { type Template } from '~/modules/diet/template/domain/template'
import { isTemplateRecipe } from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { mutateTemplates } from '~/modules/search/application/search'
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
    const { newGroup, operation, templateType } = createGroupFromTemplate(
      template(),
      item,
    )

    props.onNewItemGroup(newGroup, item).catch((err) => {
      handleApiError(err, {
        component: 'ExternalTemplateToItemGroupModal',
        operation,
        additionalData: { itemName: item.name, templateType },
      })
      showError(err, {}, `Erro ao adicionar item: ${formatError(err)}`)
    })
  }

  const handleDeleteRecipe = () => {
    const id = template().id
    void deleteRecipe(id).then(() => {
      mutateTemplates((templates) => templates?.filter((t) => t.id !== id))
    })
  }

  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <ItemEditModal
        targetName={props.targetName}
        item={() => templateToItem(template())}
        macroOverflow={() => ({ enable: true })}
        onApply={handleApply}
        onDelete={() =>
          isTemplateRecipe(template()) ? handleDeleteRecipe() : undefined
        }
      />
    </ModalContextProvider>
  )
}
