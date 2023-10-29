'use client'

// TODO: Unify Recipe and Recipe components into a single component?

import { Recipe, recipeSchema } from '@/src/modules/diet/recipe/domain/recipe'
import { foodItemSchema } from '@/src/modules/diet/food-item/domain/foodItem'
import {
  RecipeEditContextProvider,
  useRecipeEditContext,
} from '@/sections/recipe/context/RecipeEditContext'
import { useCallback } from 'react'
import TrashIcon from '@/sections/common/components/icons/TrashIcon'
import PasteIcon from '@/sections/common/components/icons/PasteIcon'
import CopyIcon from '@/sections/common/components/icons/CopyIcon'
import FoodItemListView from '@/sections/food-item/components/FoodItemListView'
import { calcRecipeCalories } from '@/legacy/utils/macroMath'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { regenerateId } from '@/legacy/utils/idUtils'
import { TemplateItem } from '@/src/modules/diet/template-item/domain/templateItem'
import useClipboard, {
  createClipboardSchemaFilter,
} from '@/sections/common/hooks/useClipboard'
import { deserializeClipboard } from '@/legacy/utils/clipboardUtils'
import { convertToGroups } from '@/legacy/utils/groupUtils'
import { mealSchema } from '@/src/modules/diet/meal/domain/meal'
import { itemGroupSchema } from '@/modules/diet/item-group/domain/itemGroup'
import { useFloatField } from '@/sections/common/hooks/useField'
import { FloatInput } from '@/sections/common/components/FloatInput'
import { RecipeEditor } from '@/legacy/utils/data/recipeEditor'
import { Signal, computed } from '@preact/signals-react'
import { cn } from '@/legacy/utils/cn'

export type RecipeEditViewProps = {
  recipe: Signal<Recipe>
  header?: React.ReactNode
  content?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

// TODO: Reenable drag and drop
// a little function to help us with reordering the result
// const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
//   const result = Array.from(list)
//   const [removed] = result.splice(startIndex, 1)
//   result.splice(endIndex, 0, removed)

//   return result
// }

export default function RecipeEditView({
  recipe,
  header,
  content,
  footer: actions,
  className,
}: RecipeEditViewProps) {
  // TODO: implement setRecipe
  return (
    <div className={cn('p-3', className)}>
      <RecipeEditContextProvider recipe={recipe}>
        {header}
        {content}
        {actions}
      </RecipeEditContextProvider>
    </div>
  )
}

// TODO: Unify Header, Content and Actions for each component in the entire app
RecipeEditView.Header = RecipeEditHeader
RecipeEditView.Content = RecipeEditContent

function RecipeEditHeader({
  onUpdateRecipe,
}: {
  onUpdateRecipe: (Recipe: Recipe) => void
}) {
  const acceptedClipboardSchema = mealSchema
    .or(itemGroupSchema)
    .or(foodItemSchema)
    .or(recipeSchema)

  const { recipe } = useRecipeEditContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const isClipboardValid = createClipboardSchemaFilter(acceptedClipboardSchema)

  const {
    clipboard: clipboardText,
    write: writeToClipboard,
    clear: clearClipboard,
  } = useClipboard({
    filter: isClipboardValid,
  })

  const handleCopy = useCallback(
    () => writeToClipboard(JSON.stringify(recipe)),
    [recipe, writeToClipboard],
  )

  // TODO: Remove code duplication between MealEditView and RecipeView
  const handlePasteAfterConfirm = useCallback(() => {
    const data = deserializeClipboard(
      clipboardText.value,
      acceptedClipboardSchema,
    )

    if (!data) {
      throw new Error('Invalid clipboard data: ' + clipboardText)
    }

    const groupsToAdd = convertToGroups(data)
      .map((group) => regenerateId(group))
      .map((g) => ({
        ...g,
        items: g.items.map((item) => regenerateId(item)),
      }))

    const itemsToAdd = groupsToAdd.flatMap((g) => g.items)

    const newRecipe = new RecipeEditor(recipe.value)
      .addItems(itemsToAdd)
      .finish()

    onUpdateRecipe(newRecipe)

    // Clear clipboard
    clearClipboard()
  }, [
    clipboardText,
    clearClipboard,
    recipe,
    onUpdateRecipe,
    acceptedClipboardSchema,
  ])

  const handlePaste = useCallback(() => {
    showConfirmModal({
      title: 'Colar itens',
      body: 'Tem certeza que deseja colar os itens?',
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined,
        },
        { text: 'Colar', primary: true, onClick: handlePasteAfterConfirm },
      ],
    })
  }, [handlePasteAfterConfirm, showConfirmModal])

  const recipeCalories = calcRecipeCalories(recipe.value)

  const onClearItems = (e: React.MouseEvent) => {
    e.preventDefault()

    showConfirmModal({
      title: 'Limpar itens',
      body: 'Tem certeza que deseja limpar os itens?',
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined,
        },
        {
          text: 'Excluir todos os itens',
          primary: true,
          onClick: () => {
            const newRecipe = new RecipeEditor(recipe.value)
              .clearItems()
              .finish()

            onUpdateRecipe(newRecipe)
          },
        },
      ],
    })
  }

  const hasValidPastableOnClipboard = isClipboardValid(clipboardText.value)

  return (
    <div className="flex">
      <div className="my-2">
        <h5 className="text-3xl text-blue-500">{recipe.value.name}</h5>
        <p className="italic text-gray-400">{recipeCalories.toFixed(0)}kcal</p>
      </div>
      <div className={`ml-auto flex gap-2`}>
        {!hasValidPastableOnClipboard && recipe.value.items.length > 0 && (
          <div
            className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
            onClick={handleCopy}
          >
            <CopyIcon />
          </div>
        )}
        {hasValidPastableOnClipboard && (
          <div
            className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
            onClick={handlePaste}
          >
            <PasteIcon />
          </div>
        )}
        {recipe.value.items.length > 0 && (
          <div
            className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
            onClick={onClearItems}
          >
            <TrashIcon />
          </div>
        )}
      </div>
    </div>
  )
}

function RecipeEditContent({
  onEditItem,
  onNewItem,
}: {
  onEditItem: (item: TemplateItem) => void
  onNewItem: () => void
}) {
  const { recipe } = useRecipeEditContext()

  return (
    <>
      <input
        className="input w-full"
        type="text"
        onChange={(e) => {
          if (recipe.value === null) {
            console.error('group is null')
            throw new Error('group is null')
          }
          recipe.value = new RecipeEditor(recipe.value)
            .setName(e.target.value)
            .finish()
        }}
        onFocus={(e) => e.target.select()}
        value={recipe.value.name ?? ''}
      />
      <FoodItemListView
        foodItems={computed(() => recipe.value.items)}
        onItemClick={onEditItem}
      />
      <AddNewItemButton onClick={onNewItem} />
      <div className="flex justify-between gap-2 mt-2">
        <div className="flex flex-col">
          <RawQuantity />
          <div className="text-gray-400 ml-1">Peso (cru)</div>
        </div>
        <div className="flex flex-col">
          <PreparedQuantity />
          <div className="text-gray-400 ml-1">Peso (pronto)</div>
        </div>
        <div className="flex flex-col">
          <PreparedMultiplier />
          <div className="text-gray-400 ml-1">Mult.</div>
        </div>
      </div>
    </>
  )
}

function AddNewItemButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={onClick}
    >
      Adicionar item
    </button>
  )
}

function RawQuantity() {
  const { recipe } = useRecipeEditContext()

  const rawQuantiy = computed(() =>
    recipe.value.items.reduce((acc, item) => {
      return acc + item.quantity
    }, 0),
  )

  const rawQuantityField = useFloatField(rawQuantiy, {
    decimalPlaces: 0,
  })

  return (
    <div className="flex gap-2">
      <FloatInput
        field={rawQuantityField}
        disabled
        className="input px-0 pl-5 text-md"
        style={{ width: '100%' }}
      />
    </div>
  )
}

// TODO: Deduplicate PreparedQuantity between RecipeEditView and ItemGroupEditModal
function PreparedQuantity() {
  const { recipe } = useRecipeEditContext()

  const rawQuantiy = recipe.value.items.reduce((acc, item) => {
    return acc + item.quantity
  }, 0)

  const preparedQuantity = computed(
    () => rawQuantiy * recipe.value.prepared_multiplier,
  )

  const preparedQuantityField = useFloatField(preparedQuantity, {
    decimalPlaces: 0,
  })

  return (
    <div className="flex gap-2">
      <FloatInput
        field={preparedQuantityField}
        commitOn="change"
        className="input px-0 pl-5 text-md"
        onFocus={(event) => event.target.select()}
        onFieldCommit={(newPreparedQuantity) => {
          const newMultiplier = (newPreparedQuantity ?? rawQuantiy) / rawQuantiy

          const newRecipe = new RecipeEditor(recipe.value)
            .setPreparedMultiplier(newMultiplier ?? 1)
            .finish()

          recipe.value = newRecipe
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}

function PreparedMultiplier() {
  const { recipe } = useRecipeEditContext()

  const preparedMultiplier = computed(() => recipe.value.prepared_multiplier)

  const preparedMultiplierField = useFloatField(preparedMultiplier, {
    decimalPlaces: 2,
  })

  return (
    <div className="flex gap-2">
      <FloatInput
        field={preparedMultiplierField}
        commitOn="change"
        className="input px-0 pl-5 text-md"
        onFocus={(event) => event.target.select()}
        onFieldCommit={(newMultiplier) => {
          const newRecipe = new RecipeEditor(recipe.value)
            .setPreparedMultiplier(newMultiplier ?? 1)
            .finish()

          recipe.value = newRecipe
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}
