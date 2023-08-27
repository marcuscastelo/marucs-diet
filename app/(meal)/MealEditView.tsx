'use client'

import { Meal, mealSchema } from '@/model/mealModel'
import { MealContextProvider, useMealContext } from './MealContext'
import { useCallback } from 'react'
import TrashIcon from '../(icons)/TrashIcon'
import PasteIcon from '../(icons)/PasteIcon'
import CopyIcon from '../(icons)/CopyIcon'
import { calcMealCalories } from '@/utils/macroMath'
import ItemGroupListView from '../(itemGroup)/ItemGroupListView'
import { ItemGroup, itemGroupSchema } from '@/model/foodItemGroupModel'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import useClipboard from '@/hooks/clipboard'
import { addInnerGroups } from '@/utils/mealUtils'
import { deserialize as deserializeClipboard } from '@/utils/clipboardUtils'
import { convertToGroups } from '@/utils/groupUtils'
import { renegerateId } from '@/utils/idUtils'
import { foodItemSchema } from '@/model/foodItemModel'

export type MealEditViewProps = {
  meal: Meal
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

//   return result.
// }

export default function MealEditView({
  meal,
  header,
  content,
  actions,
  className,
}: MealEditViewProps) {
  return (
    <div className={`bg-gray-800 p-3 ${className || ''}`}>
      <MealContextProvider meal={meal}>
        {header}
        {content}
        {actions}
      </MealContextProvider>
    </div>
  )
}

MealEditView.Header = MealEditViewHeader
MealEditView.Content = MealEditViewContent
MealEditView.Actions = MealEditViewActions

function MealEditViewHeader({
  onUpdateMeal,
}: {
  onUpdateMeal: (meal: Meal) => void
}) {
  const acceptedClipboardSchema = mealSchema
    .or(itemGroupSchema)
    .or(foodItemSchema)
  const { meal } = useMealContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const isClipboardValid = (clipboard: string) => {
    if (!clipboard) return false
    let parsedClipboard: unknown
    try {
      parsedClipboard = JSON.parse(clipboard)
    } catch (e) {
      // Error parsing JSON. Probably clipboard is some random text from the user
      return false
    }

    return acceptedClipboardSchema.safeParse(parsedClipboard).success
  }

  const { clipboard: clipboardText, write: writeToClipboard } = useClipboard({
    filter: isClipboardValid,
  })

  const handleCopy = useCallback(
    () => writeToClipboard(JSON.stringify(meal)),
    [meal, writeToClipboard],
  )

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

    const newMeal = addInnerGroups(meal, groupsToAdd)

    onUpdateMeal(newMeal)

    // Clear clipboard
    writeToClipboard('')
  }, [
    clipboardText,
    meal,
    onUpdateMeal,
    writeToClipboard,
    acceptedClipboardSchema,
  ])

  const handlePaste = useCallback(() => {
    showConfirmModal({
      title: 'Colar itens',
      message: 'Tem certeza que deseja colar os itens?',
      onConfirm: handlePasteAfterConfirm,
    })
  }, [handlePasteAfterConfirm, showConfirmModal])

  // TODO: Show how much of the daily target is this meal (e.g. 30% of daily calories) (maybe in a tooltip) (useContext)s
  const mealCalories = calcMealCalories(meal)

  const onClearItems = (e: React.MouseEvent) => {
    e.preventDefault()

    showConfirmModal({
      title: 'Limpar itens',
      message: 'Tem certeza que deseja limpar os itens?',
      onConfirm: () => {
        const newMeal: Meal = {
          ...meal,
          groups: [],
        }

        onUpdateMeal(newMeal)
      },
    })
  }

  const hasValidPastableOnClipboard = isClipboardValid(clipboardText)

  return (
    <div className="flex">
      <div className="my-2">
        <h5 className="text-3xl">{meal.name}</h5>
        <p className="italic text-gray-400">{mealCalories.toFixed(0)}kcal</p>
      </div>
      {/* // TODO: Remove code duplication between MealEditView and RecipeView */}
      <div className={`ml-auto flex gap-2`}>
        {!hasValidPastableOnClipboard && meal.groups.length > 0 && (
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
        {meal.groups.length > 0 && (
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

function MealEditViewContent({
  onEditItemGroup,
}: {
  onEditItemGroup: (item: ItemGroup) => void
}) {
  const { meal } = useMealContext()

  return (
    <ItemGroupListView
      itemGroups={meal.groups}
      onItemClick={(...args) => onEditItemGroup(...args)}
    />
  )
}

function MealEditViewActions({ onNewItem }: { onNewItem: () => void }) {
  return (
    <button
      className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={onNewItem}
    >
      Adicionar item
    </button>
  )
}
