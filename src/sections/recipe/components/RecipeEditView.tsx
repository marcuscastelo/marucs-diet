// TODO:   Unify Recipe and Recipe components into a single component?

import { type Accessor, type JSXElement, type Setter } from 'solid-js'
import { z } from 'zod'

import { itemSchema } from '~/modules/diet/item/domain/item'
import {
  convertToGroups,
  type GroupConvertible,
} from '~/modules/diet/item-group/application/itemGroupService'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'
import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type Recipe, recipeSchema } from '~/modules/diet/recipe/domain/recipe'
import {
  addItemsToRecipe,
  clearRecipeItems,
  removeItemFromRecipe,
  updateRecipeName,
  updateRecipePreparedMultiplier,
} from '~/modules/diet/recipe/domain/recipeOperations'
import {
  isTemplateItem,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import {
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  type UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { ClipboardActionButtons } from '~/sections/common/components/ClipboardActionButtons'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { PreparedQuantity } from '~/sections/common/components/PreparedQuantity'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { useFloatField } from '~/sections/common/hooks/useField'
import { useRecipeEditContext } from '~/sections/recipe/context/RecipeEditContext'
import { UnifiedItemListView } from '~/sections/unified-item/components/UnifiedItemListView'
import { openConfirmModal } from '~/shared/modal/helpers/modalHelpers'
import { regenerateId } from '~/shared/utils/idUtils'
import { calcRecipeCalories } from '~/shared/utils/macroMath'

export type RecipeEditViewProps = {
  recipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
  onSaveRecipe: (recipe: Recipe) => void
  header?: JSXElement
  content?: JSXElement
  footer?: JSXElement
  className?: string
}

// TODO:   Reenable drag and drop
// a little function to help us with reordering the result
// const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
//   const result = Array.from(list)
//   const [removed] = result.splice(startIndex, 1)
//   result.splice(endIndex, 0, removed)

//   return result
// }

export function RecipeEditHeader(props: {
  onUpdateRecipe: (Recipe: Recipe) => void
}) {
  const acceptedClipboardSchema = mealSchema
    .or(itemGroupSchema)
    .or(itemSchema)
    .or(recipeSchema)
    .or(unifiedItemSchema)
    .or(z.array(unifiedItemSchema))

  const { recipe } = useRecipeEditContext()

  const { handleCopy, handlePaste, hasValidPastableOnClipboard } =
    useCopyPasteActions({
      acceptedClipboardSchema,
      getDataToCopy: () => recipe(),
      onPaste: (data) => {
        // Helper function to check if an object is a UnifiedItem
        const isUnifiedItem = (obj: unknown): obj is UnifiedItem => {
          return (
            typeof obj === 'object' &&
            obj !== null &&
            '__type' in obj &&
            obj.__type === 'UnifiedItem'
          )
        }

        // Check if data is array of UnifiedItems
        if (Array.isArray(data) && data.every(isUnifiedItem)) {
          const itemsToAdd = data
            .filter((item) => item.reference.type === 'food') // Only food items in recipes
            .map((item) => unifiedItemToItem(item))
            .map((item) => regenerateId(item))
          const newRecipe = addItemsToRecipe(recipe(), itemsToAdd)
          props.onUpdateRecipe(newRecipe)
          return
        }

        // Check if data is single UnifiedItem
        if (isUnifiedItem(data)) {
          if (data.reference.type === 'food') {
            const item = unifiedItemToItem(data)
            const regeneratedItem = regenerateId(item)
            const newRecipe = addItemsToRecipe(recipe(), [regeneratedItem])
            props.onUpdateRecipe(newRecipe)
          }
          return
        }

        // Fallback to legacy conversion
        const groupsToAdd = convertToGroups(data as GroupConvertible)
          .map((group) => regenerateId(group))
          .map((g) => ({
            ...g,
            items: g.items.map((item) => regenerateId(item)),
          }))
        const itemsToAdd = groupsToAdd.flatMap((g) => g.items)
        const newRecipe = addItemsToRecipe(recipe(), itemsToAdd)
        props.onUpdateRecipe(newRecipe)
      },
    })

  const recipeCalories = calcRecipeCalories(recipe())

  const onClearItems = (e: MouseEvent) => {
    e.preventDefault()
    openConfirmModal('Tem certeza que deseja limpar os itens?', {
      title: 'Limpar itens',
      confirmText: 'Excluir todos os itens',
      cancelText: 'Cancelar',
      onConfirm: () => {
        const newRecipe = clearRecipeItems(recipe())
        props.onUpdateRecipe(newRecipe)
      },
    })
  }

  return (
    <div class="flex">
      <div class="my-2">
        <h5 class="text-3xl text-blue-500">{recipe().name}</h5>
        <p class="italic text-gray-400">{recipeCalories.toFixed(0)}kcal</p>
      </div>
      <ClipboardActionButtons
        canCopy={!hasValidPastableOnClipboard() && recipe().items.length > 0}
        canPaste={hasValidPastableOnClipboard()}
        canClear={recipe().items.length > 0}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onClear={onClearItems}
      />
    </div>
  )
}

export function RecipeEditContent(props: {
  onEditItem: (item: TemplateItem) => void
  onNewItem: () => void
}) {
  const { recipe, setRecipe } = useRecipeEditContext()
  const clipboard = useClipboard()

  return (
    <>
      <input
        class="input w-full"
        type="text"
        onChange={(e) => {
          setRecipe(updateRecipeName(recipe(), e.target.value))
        }}
        onFocus={(e) => {
          e.target.select()
        }}
        value={recipe().name}
      />
      <UnifiedItemListView
        items={() => recipe().items.map(itemToUnifiedItem)}
        mode="edit"
        handlers={{
          onEdit: (unifiedItem: UnifiedItem) => {
            if (!isTemplateItem(unifiedItem)) {
              console.warn('Item does not have a reference, cannot edit')
              return
            }
            props.onEditItem(unifiedItem)
          },
          onCopy: (unifiedItem: UnifiedItem) => {
            clipboard.write(JSON.stringify(unifiedItem))
          },
          onDelete: (unifiedItem: UnifiedItem) => {
            // Convert back to Item for the legacy operation
            const item = unifiedItemToItem(unifiedItem)
            setRecipe(removeItemFromRecipe(recipe(), item.id))
          },
        }}
      />
      <AddNewItemButton onClick={props.onNewItem} />
      <div class="flex justify-between gap-2 mt-2">
        <div class="flex flex-col">
          <RawQuantity />
          <div class="text-gray-400 ml-1">Peso (cru)</div>
        </div>
        <div class="flex flex-col">
          <PreparedQuantity
            rawQuantity={recipe().items.reduce(
              (acc, item) => acc + item.quantity,
              0,
            )}
            preparedMultiplier={recipe().prepared_multiplier}
            onPreparedQuantityChange={({ newMultiplier }) => {
              const newRecipe = updateRecipePreparedMultiplier(
                recipe(),
                newMultiplier(),
              )

              setRecipe(newRecipe)
            }}
          />
          <div class="text-gray-400 ml-1">Peso (pronto)</div>
        </div>
        <div class="flex flex-col">
          <PreparedMultiplier />
          <div class="text-gray-400 ml-1">Mult.</div>
        </div>
      </div>
    </>
  )
}

function AddNewItemButton(props: { onClick: () => void }) {
  return (
    <button
      class="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={() => {
        props.onClick()
      }}
    >
      Adicionar item
    </button>
  )
}

function RawQuantity() {
  const { recipe } = useRecipeEditContext()

  const rawQuantity = () =>
    recipe().items.reduce((acc, item) => {
      return acc + item.quantity
    }, 0)

  const rawQuantityField = useFloatField(rawQuantity, {
    decimalPlaces: 0,
  })

  return (
    <div class="flex gap-2">
      <FloatInput
        field={rawQuantityField}
        disabled
        class="input px-0 pl-5 text-md"
        style={{ width: '100%' }}
      />
    </div>
  )
}

function PreparedMultiplier() {
  const { recipe, setRecipe } = useRecipeEditContext()

  const preparedMultiplier = () => recipe().prepared_multiplier

  const preparedMultiplierField = useFloatField(preparedMultiplier, {
    decimalPlaces: 2,
  })

  return (
    <div class="flex gap-2">
      <FloatInput
        field={preparedMultiplierField}
        commitOn="change"
        class="input px-0 pl-5 text-md"
        onFocus={(event) => {
          event.target.select()
        }}
        onFieldCommit={(newMultiplier) => {
          const newRecipe = updateRecipePreparedMultiplier(
            recipe(),
            newMultiplier ?? 1,
          )

          setRecipe(newRecipe)
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}
