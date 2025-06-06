import { type Accessor, type Setter } from 'solid-js'
import { showError } from '~/shared/toast'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'
import {
  type ItemGroup,
  type RecipedItemGroup,
  type SimpleItemGroup,
  createSimpleItemGroup,
  createRecipedItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Template } from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { formatError } from '~/shared/formatError'
import { handleApiError } from '~/shared/error/errorHandler'
import { calcRecipeMacros } from '~/legacy/utils/macroMath'

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
        item={() => {
          const template = props.selectedTemplate()
          const macros =
            template.__type === 'Food'
              ? template.macros
              : calcRecipeMacros(template)
          return {
            reference: template.id,
            name: template.name,
            macros,
            __type: template.__type === 'Food' ? 'Item' : 'RecipeItem', // TODO:   Refactor conversion from template type to group/item types
          }
        }}
        macroOverflow={() => ({
          enable: true,
        })}
        onApply={(item) => {
          // TODO:   Refactor conversion from template type to group/item types
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
              showError(`Erro ao adicionar item: ${formatError(err)}`, {
                context: 'user-action',
              })
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
              showError(`Erro ao adicionar item: ${formatError(err)}`, {
                context: 'user-action',
              })
            })
          }
        }}
      />
    </ModalContextProvider>
  )
}
