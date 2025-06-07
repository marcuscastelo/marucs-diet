import { type Accessor, type Setter } from 'solid-js'
import {
  type ItemGroup,
  type RecipedItemGroup,
  type SimpleItemGroup,
  createRecipedItemGroup,
  createSimpleItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'
import { handleApiError } from '~/shared/error/errorHandler'
import { formatError } from '~/shared/formatError'
import { templateToItem } from '~/modules/diet/template/application/templateToItem'
import { type Template } from '~/modules/diet/template/domain/template'

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
          if (item.__type === 'Item') {
            const newGroup: SimpleItemGroup = createSimpleItemGroup({
              name: item.name,
              items: [item],
            })
            props.onNewItemGroup(newGroup, item).catch((err) => {
              handleApiError(err, {
                component: 'ExternalTemplateToItemGroupModal',
                operation: 'addSimpleItem',
                additionalData: { itemName: item.name, templateType: 'Item' },
              })
              showError(`Erro ao adicionar item: ${formatError(err)}`)
            })
          } else {
            const newGroup: RecipedItemGroup = createRecipedItemGroup({
              name: item.name,
              recipe: (props.selectedTemplate() as Recipe).id,
              items: [...(props.selectedTemplate() as Recipe).items],
            })
            props.onNewItemGroup(newGroup, item).catch((err) => {
              handleApiError(err, {
                component: 'ExternalTemplateToItemGroupModal',
                operation: 'addRecipeItem',
                additionalData: { itemName: item.name, templateType: 'Recipe' },
              })
              showError(`Erro ao adicionar item: ${formatError(err)}`)
            })
          }
        }}
      />
    </ModalContextProvider>
  )
}
