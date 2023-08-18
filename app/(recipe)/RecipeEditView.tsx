'use client'

// TODO: Unify Recipe and Recipe components into a single component?

import { Recipe, recipeSchema } from '@/model/recipeModel'
import { FoodItem, itemSchema } from '@/model/foodItemModel'
import { RecipeContextProvider, useRecipeContext } from './RecipeContext'
import { useEffect, useState } from 'react'
import TrashIcon from '../(icons)/TrashIcon'
import PasteIcon from '../(icons)/PasteIcon'
import CopyIcon from '../(icons)/CopyIcon'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import { calcRecipeCalories } from '@/utils/macroMath'
import { useConfirmModalContext } from '@/context/confirmModal.context'

export type RecipeEditViewProps = {
  recipe: Recipe
  header?: React.ReactNode
  content?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

// TODO: move this function
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
  const { recipe } = useRecipeContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  // TODO: Show how much of the daily target is this Recipe (e.g. 30% of daily calories) (maybe in a tooltip) (useContext)s
  const recipeCalories = calcRecipeCalories(recipe)

  const [clipboardText, setClipboardText] = useState('')

  const onClearItems = (e: React.MouseEvent) => {
    e.preventDefault()

    showConfirmModal({
      title: 'Limpar itens',
      message: 'Tem certeza que deseja limpar os itens?',
      onConfirm: () => {
        const newRecipe: Recipe = {
          ...recipe,
          items: [],
        }

        onUpdateRecipe(newRecipe)
      },
    })
  }
  // TODO: Remove code duplication between MealView and RecipeView
  const handleCopyRecipe = (e: React.MouseEvent) => {
    e.preventDefault()

    navigator.clipboard.writeText(JSON.stringify(recipe))
  }
  // TODO: Remove code duplication between MealView and RecipeView
  const handlePasteRecipe = (e: React.MouseEvent) => {
    e.preventDefault()

    try {
      const parsedRecipe = recipeSchema.safeParse(JSON.parse(clipboardText))

      if (parsedRecipe.success) {
        const newRecipe: Recipe = {
          ...recipe,
          items: [
            ...recipe.items,
            ...parsedRecipe.data.items.map((item) => ({
              ...item,
              id: Math.floor(Math.random() * 1000000), // TODO: Create a function to generate a unique id
            })),
          ],
        }

        onUpdateRecipe(newRecipe)

        // Clear clipboard
        navigator.clipboard.writeText('')

        return
      }

      const parsedRecipeItem = itemSchema.safeParse(JSON.parse(clipboardText))

      if (parsedRecipeItem.success) {
        const newRecipe: Recipe = {
          ...recipe,
          items: [
            ...recipe.items,
            {
              ...parsedRecipeItem.data,
              id: Math.floor(Math.random() * 1000000), // TODO: Create a function to generate a unique id
            },
          ],
        }

        onUpdateRecipe(newRecipe)

        // Clear clipboard
        navigator.clipboard.writeText('')

        return
      }
    } catch (e) {
      alert(`Erro ao colar: ${e}`)
    }

    // Clear clipboard
    navigator.clipboard.writeText('')
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Uncaught (in promise) DOMException: Document is not focused.
      navigator.clipboard
        .readText()
        .then((clipText) => setClipboardText(clipText))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  let parsedJson = {} as object // TODO: Create a type for this
  try {
    parsedJson = JSON.parse(clipboardText) as object // TODO: Create a type for this
  } catch (e) {
    // Do nothing
  }

  const hasValidPastableOnClipboard =
    clipboardText &&
    (recipeSchema.safeParse(parsedJson).success ||
      itemSchema.safeParse(parsedJson).success)

  return (
    <div className="flex">
      <div className="my-2">
        <h5 className="text-3xl text-blue-500">{recipe.name}</h5>
        <p className="italic text-gray-400">{recipeCalories}kcal</p>
      </div>
      <div className={`ml-auto flex gap-2`}>
        {!hasValidPastableOnClipboard && recipe.items.length > 0 && (
          <div
            className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
            onClick={handleCopyRecipe}
          >
            <CopyIcon />
          </div>
        )}
        {hasValidPastableOnClipboard && (
          <div
            className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
            onClick={handlePasteRecipe}
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
  onEditItem: (item: FoodItem) => void
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
