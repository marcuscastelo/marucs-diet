'use client'

// TODO: Unify Recipe and Recipe components into a single component?

import { Recipe, recipeSchema } from '@/model/recipeModel'
import { foodItemSchema } from '@/model/foodItemModel'
import {
  RecipeEditContextProvider,
  useRecipeEditContext,
} from './RecipeEditContext'
import { useCallback, useEffect, useState } from 'react'
import TrashIcon from '../(icons)/TrashIcon'
import PasteIcon from '../(icons)/PasteIcon'
import CopyIcon from '../(icons)/CopyIcon'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import { calcRecipeCalories } from '@/utils/macroMath'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { renegerateId } from '@/utils/idUtils'
import { TemplateItem } from '@/model/templateItemModel'
import useClipboard, { createClipboardSchemaFilter } from '@/hooks/clipboard'
import { deserializeClipboard } from '@/utils/clipboardUtils'
import { convertToGroups } from '@/utils/groupUtils'
import { mealSchema } from '@/model/mealModel'
import { itemGroupSchema } from '@/model/itemGroupModel'
import { useFloatField } from '@/hooks/field'
import { FloatInput } from '@/components/FloatInput'
import { RecipeEditor } from '@/utils/data/recipeEditor'
import { Signal } from '@preact/signals-react'

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
    <div className={`bg-gray-800 p-3 ${className || ''}`}>
      <RecipeEditContextProvider recipe={recipe}>
        {header}
        {content}
        {actions}
      </RecipeEditContextProvider>
    </div>
  )
}

// TODO: Unify Header, Content and Actions into a single component for entire app
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
    const data = deserializeClipboard(clipboardText, acceptedClipboardSchema)

    if (!data) {
      throw new Error('Invalid clipboard data: ' + clipboardText)
    }

    const groupsToAdd = convertToGroups(data)
      .map(renegerateId)
      .map((g) => ({
        ...g,
        items: g.items.map(renegerateId),
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

  const hasValidPastableOnClipboard = isClipboardValid(clipboardText)

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
      <FoodItemListView
        foodItems={recipe.value.items}
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

  const rawQuantiy = recipe.value.items.reduce((acc, item) => {
    return acc + item.quantity
  }, 0)

  const rawQuantityField = useFloatField(rawQuantiy, {
    decimalPlaces: 0,
  })

  useEffect(() => {
    rawQuantityField.setValue(rawQuantiy)
  }, [rawQuantiy, rawQuantityField])

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

function PreparedQuantity() {
  const { recipe } = useRecipeEditContext()

  const rawQuantiy = recipe.value.items.reduce((acc, item) => {
    return acc + item.quantity
  }, 0)

  const preparedQuantity = rawQuantiy * recipe.value.prepared_multiplier

  const preparedQuantityField = useFloatField(preparedQuantity, {
    decimalPlaces: 0,
  })

  useEffect(() => {
    preparedQuantityField.setValue(preparedQuantity)
  }, [preparedQuantity, preparedQuantityField])

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

  const preparedMultiplierField = useFloatField(
    recipe.value.prepared_multiplier,
    {
      decimalPlaces: 2,
    },
  )

  useEffect(() => {
    preparedMultiplierField.setValue(recipe.value.prepared_multiplier)
  }, [recipe.value.prepared_multiplier, preparedMultiplierField])

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
