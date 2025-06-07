import { type Accessor, type Setter } from 'solid-js'
import { calcRecipeMacros } from '~/legacy/utils/macroMath'
import {
  type ItemGroup,
  type RecipedItemGroup,
  type SimpleItemGroup,
  createRecipedItemGroup,
  createSimpleItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import {
  type Template,
  isTemplateFood,
  isTemplateRecipe,
} from '~/modules/diet/template/domain/template'
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
        item={() => {
          const template = props.selectedTemplate()
          const macros = isTemplateFood(template)
            ? template.macros
            : calcRecipeMacros(template)
          return {
            reference: template.id,
            name: template.name,
            macros,
            __type: isTemplateFood(template) ? 'Item' : 'RecipeItem', // TODO:   Refactor conversion from template type to group/item types
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
