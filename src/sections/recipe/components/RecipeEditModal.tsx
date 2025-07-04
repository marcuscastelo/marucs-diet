import { Accessor, createEffect, createSignal } from 'solid-js'
import { untrack } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  addItemToRecipe,
  updateItemInRecipe,
} from '~/modules/diet/recipe/domain/recipeOperations'
import { unifiedItemToItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  createUnifiedItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { showError } from '~/modules/toast/application/toastManager'
import { Button } from '~/sections/common/components/buttons/Button'
import {
  RecipeEditContent,
  RecipeEditHeader,
} from '~/sections/recipe/components/RecipeEditView'
import { RecipeEditContextProvider } from '~/sections/recipe/context/RecipeEditContext'
import { handleValidationError } from '~/shared/error/errorHandler'
import {
  openDeleteConfirmModal,
  openTemplateSearchModal,
  openUnifiedItemEditModal,
} from '~/shared/modal/helpers/specializedModalHelpers'

export type RecipeEditModalProps = {
  recipe: Accessor<Recipe>
  onSaveRecipe: (recipe: Recipe) => void
  onRefetch: () => void
  onCancel?: () => void
  onDelete: (recipeId: Recipe['id']) => void
  onClose?: () => void
}

export function RecipeEditModal(props: RecipeEditModalProps) {
  const [recipe, setRecipe] = createSignal(untrack(() => props.recipe()))

  createEffect(() => {
    setRecipe(props.recipe())
  })

  const handleNewUnifiedItem = (newItem: UnifiedItem) => {
    console.debug('onNewUnifiedItem', newItem)

    // Convert UnifiedItem to Item for adding to recipe
    try {
      // Only food items can be directly converted to Items for recipes
      if (newItem.reference.type !== 'food') {
        handleValidationError('Cannot add non-food items to recipes', {
          component: 'RecipeEditModal',
          operation: 'handleNewUnifiedItem',
          additionalData: {
            itemType: newItem.reference.type,
            itemId: newItem.id,
          },
        })
        showError(
          'Não é possível adicionar itens que não sejam alimentos a receitas.',
        )
        return
      }

      const item = unifiedItemToItem(newItem)
      const updatedRecipe = addItemToRecipe(recipe(), item)

      console.debug(
        'handleNewUnifiedItem: applying',
        JSON.stringify(updatedRecipe, null, 2),
      )

      setRecipe(updatedRecipe)
    } catch (error) {
      console.error('Error converting UnifiedItem to Item:', error)
      showError('Erro ao adicionar item à receita.')
    }
  }

  return (
    <RecipeEditContextProvider
      recipe={recipe}
      setRecipe={setRecipe}
      onSaveRecipe={props.onSaveRecipe}
    >
      <div class="space-y-4">
        <RecipeEditHeader
          onUpdateRecipe={(newRecipe) => {
            console.debug('[RecipeEditModal] onUpdateRecipe: ', newRecipe)
            setRecipe(newRecipe)
          }}
        />

        <RecipeEditContent
          onNewItem={() => {
            openTemplateSearchModal({
              targetName: recipe().name,
              onNewUnifiedItem: handleNewUnifiedItem,
              onFinish: () => {
                props.onRefetch()
              },
              onClose: () => {
                props.onRefetch()
              },
            })
          }}
          onEditItem={(item) => {
            // TODO: Allow user to edit recipes inside recipes
            if (isRecipeItem(item)) {
              showError(
                'Ainda não é possível editar receitas dentro de receitas! Funcionalidade em desenvolvimento',
              )
              return
            }

            // Use unified modal system instead of legacy pattern
            openUnifiedItemEditModal({
              item: () => createUnifiedItem(item),
              targetMealName: recipe().name,
              macroOverflow: () => ({ enable: false }),
              onApply: (unifiedItem) => {
                // Convert back to Item for recipe operations
                const convertedItem = unifiedItemToItem(unifiedItem)
                const updatedItem: Item = {
                  ...convertedItem,
                  quantity: convertedItem.quantity,
                }
                const updatedRecipe = updateItemInRecipe(
                  recipe(),
                  convertedItem.id,
                  updatedItem,
                )
                setRecipe(updatedRecipe)
              },
              title: 'Editar item',
              targetName: item.name,
            })
          }}
        />

        <Actions
          onApply={() => {
            props.onSaveRecipe(recipe())
          }}
          onCancel={props.onCancel}
          onDelete={() => {
            props.onDelete(recipe().id)
          }}
          onClose={props.onClose}
        />
      </div>
    </RecipeEditContextProvider>
  )
}

function Actions(props: {
  onApply: () => void
  onDelete: () => void
  onCancel?: () => void
  onClose?: () => void
}) {
  const handleDelete = () => {
    openDeleteConfirmModal({
      itemName: 'receita',
      itemType: 'receita',
      onConfirm: () => {
        props.onDelete()
        props.onClose?.()
      },
    })
  }

  return (
    <div class="flex flex-row gap-2">
      <Button
        class="btn-error mr-auto"
        onClick={(e) => {
          e.preventDefault()
          handleDelete()
        }}
      >
        Excluir
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault()
          props.onClose?.()
          props.onCancel?.()
        }}
      >
        Cancelar
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault()
          props.onApply()
          props.onClose?.()
        }}
      >
        Aplicar
      </Button>
    </div>
  )
}
