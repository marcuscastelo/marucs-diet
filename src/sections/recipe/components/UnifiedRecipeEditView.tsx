import { type Accessor, type JSXElement, type Setter } from 'solid-js'
import { z } from 'zod/v4'

import {
  convertToGroups,
  type GroupConvertible,
} from '~/modules/diet/item-group/application/itemGroupService'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'
import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type UnifiedRecipe } from '~/modules/diet/recipe/domain/recipe'
import {
  addUnifiedItemsToRecipe,
  clearUnifiedRecipeItems,
  removeUnifiedItemFromRecipe,
  updateUnifiedRecipeName,
  updateUnifiedRecipePreparedMultiplier,
} from '~/modules/diet/recipe/domain/unifiedRecipeOperations'
import {
  isTemplateItem,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { itemToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'
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
import { useUnifiedRecipeEditContext } from '~/sections/recipe/context/RecipeEditContext'
import { UnifiedItemListView } from '~/sections/unified-item/components/UnifiedItemListView'
import { openClearItemsConfirmModal } from '~/shared/modal/helpers/specializedModalHelpers'
import { regenerateId } from '~/shared/utils/idUtils'
import { calcUnifiedRecipeCalories } from '~/shared/utils/macroMath'

export type UnifiedRecipeEditViewProps = {
  recipe: Accessor<UnifiedRecipe>
  setRecipe: Setter<UnifiedRecipe>
  onSaveRecipe: (recipe: UnifiedRecipe) => void
  header?: JSXElement
  content?: JSXElement
  onNewItem: () => void
  onEditItem: (item: TemplateItem) => void
  onUpdateRecipe: (recipe: UnifiedRecipe) => void
}

export function UnifiedRecipeEditView(props: UnifiedRecipeEditViewProps) {
  const clipboard = useClipboard()

  const { recipe, setRecipe } = props

  const acceptedClipboardSchema = z.union([
    unifiedItemSchema,
    unifiedItemSchema.array(),
    itemGroupSchema,
    itemGroupSchema.array(),
    mealSchema,
  ])

  const { handleCopy, handlePaste, hasValidPastableOnClipboard } =
    useCopyPasteActions({
      acceptedClipboardSchema,
      getDataToCopy: () => [...recipe().items],
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
            .map((item) => regenerateId(item))
          const newRecipe = addUnifiedItemsToRecipe(recipe(), itemsToAdd)
          props.onUpdateRecipe(newRecipe)
          return
        }

        // Check if data is single UnifiedItem
        if (isUnifiedItem(data)) {
          if (data.reference.type === 'food') {
            const regeneratedItem = regenerateId(data)
            const newRecipe = addUnifiedItemsToRecipe(recipe(), [
              regeneratedItem,
            ])
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
        // Convert Items to UnifiedItems using conversion utility
        const unifiedItemsToAdd = groupsToAdd
          .flatMap((g) => g.items)
          .map((item) => itemToUnifiedItem(item))
        const newRecipe = addUnifiedItemsToRecipe(recipe(), unifiedItemsToAdd)
        props.onUpdateRecipe(newRecipe)
      },
    })

  const recipeCalories = calcUnifiedRecipeCalories(recipe())

  const onClearItems = (e: MouseEvent) => {
    e.preventDefault()
    openClearItemsConfirmModal({
      context: 'todos os itens da receita',
      onConfirm: () => {
        setRecipe(clearUnifiedRecipeItems(recipe()))
      },
    })
  }

  return (
    <div class="flex flex-col gap-2 w-full">
      {props.header}
      <ClipboardActionButtons
        canCopy={recipe().items.length > 0}
        canPaste={hasValidPastableOnClipboard()}
        canClear={recipe().items.length > 0}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onClear={onClearItems}
      />
      <NameInput />
      <input
        name="recipe-name"
        type="text"
        class="input w-full text-lg font-medium text-center"
        placeholder="Nome da receita"
        onInput={(e) => {
          const newRecipe = updateUnifiedRecipeName(recipe(), e.target.value)
          setRecipe(newRecipe)
        }}
        onFocus={(e) => {
          e.target.select()
        }}
        value={recipe().name}
      />
      <UnifiedItemListView
        items={() => [...recipe().items]}
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
            setRecipe(removeUnifiedItemFromRecipe(recipe(), unifiedItem.id))
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
              const newRecipe = updateUnifiedRecipePreparedMultiplier(
                recipe(),
                newMultiplier(),
              )

              setRecipe(newRecipe)
            }}
          />
          <div class="text-gray-400 ml-1">Peso (pronto)</div>
        </div>
        <div class="flex flex-col">
          <div class="input px-0 pl-5 text-md flex items-center justify-center">
            {recipeCalories.toFixed(0)} kcal
          </div>
          <div class="text-gray-400 ml-1">Calorias</div>
        </div>
      </div>
      <div class="flex justify-between gap-2">
        <div class="flex flex-col">
          <PreparedMultiplier />
          <div class="text-gray-400 ml-1">Multiplicador</div>
        </div>
      </div>
      {props.content}
    </div>
  )
}

function AddNewItemButton(props: { onClick: () => void }) {
  return (
    <button
      type="button"
      class="btn btn-outline w-full"
      onClick={() => props.onClick()}
    >
      Adicionar item
    </button>
  )
}

function NameInput() {
  const { recipe, setRecipe } = useUnifiedRecipeEditContext()

  return (
    <input
      name="recipe-name"
      type="text"
      class="input w-full text-lg font-medium text-center"
      placeholder="Nome da receita"
      onInput={(e) => {
        const newRecipe = updateUnifiedRecipeName(recipe(), e.target.value)
        setRecipe(newRecipe)
      }}
      onFocus={(e) => {
        e.target.select()
      }}
      value={recipe().name}
    />
  )
}

function RawQuantity() {
  const { recipe } = useUnifiedRecipeEditContext()

  const rawQuantity = () =>
    recipe().items.reduce((acc, item) => acc + item.quantity, 0)

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
  const { recipe, setRecipe } = useUnifiedRecipeEditContext()

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
          const newRecipe = updateUnifiedRecipePreparedMultiplier(
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
