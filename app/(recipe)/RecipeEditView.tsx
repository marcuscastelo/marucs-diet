'use client'

// TODO: Unify Recipe and Recipe components into a single component?

import { Recipe, recipeSchema } from '@/model/recipeModel'
import { FoodItem, foodItemSchema } from '@/model/foodItemModel'
import { RecipeContextProvider, useRecipeContext } from './RecipeContext'
import { useCallback, useEffect, useState } from 'react'
import TrashIcon from '../(icons)/TrashIcon'
import PasteIcon from '../(icons)/PasteIcon'
import CopyIcon from '../(icons)/CopyIcon'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import {
  calcGroupMacros,
  calcRecipeCalories,
  calcRecipeMacros,
} from '@/utils/macroMath'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { generateId, renegerateId } from '@/utils/idUtils'
import { TemplateItem } from '@/model/templateItemModel'
import useClipboard, { createClipboardSchemaFilter } from '@/hooks/clipboard'
import { deserializeClipboard } from '@/utils/clipboardUtils'
import { convertToGroups } from '@/utils/groupUtils'
import { mealSchema } from '@/model/mealModel'
import { itemGroupSchema } from '@/model/itemGroupModel'

export type RecipeEditViewProps = {
  recipe: Recipe
  header?: React.ReactNode
  content?: React.ReactNode
  actions?: React.ReactNode
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
  actions,
  className,
}: RecipeEditViewProps) {
  return (
    <div className={`bg-gray-800 p-3 ${className || ''}`}>
      <RecipeContextProvider recipe={recipe}>
        {header}
        {content}
        {actions}
      </RecipeContextProvider>
    </div>
  )
}

RecipeEditView.Header = RecipeEditHeader
RecipeEditView.Content = RecipeEditContent
RecipeEditView.Actions = RecipeEditActions

function RecipeEditHeader({
  onUpdateRecipe,
}: {
  onUpdateRecipe: (Recipe: Recipe) => void
}) {
  const acceptedClipboardSchema = mealSchema
    .or(itemGroupSchema)
    .or(foodItemSchema)
    .or(recipeSchema)

  const { recipe } = useRecipeContext()
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

    const newRecipe: Recipe = {
      ...recipe,
      items: [...recipe.items, ...itemsToAdd],
    }

    // TODO: Create RecipeEditor, MealEditor, ItemGroupEditor, FoodItemEditor classes to avoid this code duplication and error proneness
    newRecipe.macros = calcRecipeMacros(newRecipe)

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
      message: 'Tem certeza que deseja colar os itens?',
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined,
        },
        { text: 'Colar', primary: true, onClick: handlePasteAfterConfirm },
      ],
    })
  }, [handlePasteAfterConfirm, showConfirmModal])

  const recipeCalories = calcRecipeCalories(recipe)

  const onClearItems = (e: React.MouseEvent) => {
    e.preventDefault()

    showConfirmModal({
      title: 'Limpar itens',
      message: 'Tem certeza que deseja limpar os itens?',
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined,
        },
        {
          text: 'Excluir todos os itens',
          primary: true,
          onClick: () => {
            const newRecipe: Recipe = {
              ...recipe,
              items: [],
            }

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
        <h5 className="text-3xl text-blue-500">{recipe.name}</h5>
        <p className="italic text-gray-400">{recipeCalories.toFixed(0)}kcal</p>
      </div>
      <div className={`ml-auto flex gap-2`}>
        {!hasValidPastableOnClipboard && recipe.items.length > 0 && (
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
        {recipe.items.length > 0 && (
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
}: {
  onEditItem: (item: TemplateItem) => void
}) {
  const { recipe } = useRecipeContext()

  return <FoodItemListView foodItems={recipe.items} onItemClick={onEditItem} />
}

function RecipeEditActions({ onNewItem }: { onNewItem: () => void }) {
  return (
    <button
      className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={onNewItem}
    >
      Adicionar item
    </button>
  )
}
