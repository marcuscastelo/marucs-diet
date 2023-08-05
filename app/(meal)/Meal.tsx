'use client'

import { MealData, mealSchema } from '@/model/mealModel'
import { MealContextProvider, useMealContext } from './MealContext'
import { useEffect, useState } from 'react'
import TrashIcon from '../(icons)/TrashIcon'
import PasteIcon from '../(icons)/PasteIcon'
import CopyIcon from '../(icons)/CopyIcon'
import { calcMealCalories } from '@/utils/macroMath'
import FoodItemGroupListView from '../(foodItemGroup)/FoodItemGroupListView'
import { FoodItemGroup, itemGroupSchema } from '@/model/foodItemGroupModel'

export type MealProps = {
  mealData: MealData
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

export default function Meal({
  mealData,
  header,
  content,
  actions,
  className,
}: MealProps) {
  return (
    <div className={`bg-gray-800 p-3 ${className || ''}`}>
      <MealContextProvider mealData={mealData}>
        {header}
        {content}
        {actions}
      </MealContextProvider>
    </div>
  )
}

Meal.Header = MealHeader
Meal.Content = MealContent
Meal.Actions = MealActions

function MealHeader({
  onUpdateMeal,
}: {
  onUpdateMeal: (meal: MealData) => void
}) {
  const { mealData } = useMealContext()

  // TODO: Show how much of the daily target is this meal (e.g. 30% of daily calories) (maybe in a tooltip) (useContext)s
  const mealCalories = calcMealCalories(mealData)

  const [clipboardText, setClipboardText] = useState('')

  const onClearItems = (e: React.MouseEvent) => {
    e.preventDefault()
    // Confirm
    if (!confirm('Tem certeza que deseja limpar os itens?')) {
      return
    }

    const newMealData = {
      ...mealData,
      items: [],
    }

    onUpdateMeal(newMealData)
  }

  const handleCopyMeal = (e: React.MouseEvent) => {
    e.preventDefault()

    navigator.clipboard.writeText(JSON.stringify(mealData))
  }

  const handlePasteMeal = (e: React.MouseEvent) => {
    e.preventDefault()

    try {
      const parsedMeal = mealSchema.safeParse(JSON.parse(clipboardText))

      if (parsedMeal.success) {
        const newMealData: MealData = {
          ...mealData,
          groups: [
            ...mealData.groups,
            ...parsedMeal.data.groups.map(
              (item): FoodItemGroup => ({
                ...item,
                id: Math.floor(Math.random() * 1000000), // TODO: Create a function to generate a unique id
              }),
            ),
          ],
        }

        onUpdateMeal(newMealData)

        // Clear clipboard
        navigator.clipboard.writeText('')

        return
      }

      const parsedGroup = itemGroupSchema.safeParse(JSON.parse(clipboardText))

      if (parsedGroup.success) {
        const newMealData: MealData = {
          ...mealData,
          groups: [
            ...mealData.groups,
            {
              ...parsedGroup.data,
              id: Math.floor(Math.random() * 1000000), // TODO: Create a function to generate a unique id
            },
          ],
        }

        onUpdateMeal(newMealData)

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
    (mealSchema.safeParse(parsedJson).success ||
      itemGroupSchema.safeParse(parsedJson).success)

  return (
    <div className="flex">
      <div className="my-2">
        <h5 className="text-3xl">{mealData.name}</h5>
        <p className="italic text-gray-400">{mealCalories}kcal</p>
      </div>
      <div className={`ml-auto flex gap-2`}>
        {!hasValidPastableOnClipboard && mealData.groups.length > 0 && (
          <div
            className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
            onClick={handleCopyMeal}
          >
            <CopyIcon />
          </div>
        )}
        {hasValidPastableOnClipboard && (
          <div
            className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
            onClick={handlePasteMeal}
          >
            <PasteIcon />
          </div>
        )}
        {mealData.groups.length > 0 && (
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

function MealContent({
  onEditItemGroup,
}: {
  onEditItemGroup: (item: FoodItemGroup) => void
}) {
  const { mealData } = useMealContext()

  return (
    <FoodItemGroupListView
      foodItems={mealData.groups}
      onItemClick={onEditItemGroup}
    />
  )
}

function MealActions({ onNewItem }: { onNewItem: () => void }) {
  return (
    <button
      className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={onNewItem}
    >
      Adicionar item
    </button>
  )
}
