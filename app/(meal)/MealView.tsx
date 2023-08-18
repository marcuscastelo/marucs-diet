'use client'

import { MealData, mealSchema } from '@/model/mealModel'
import { MealContextProvider, useMealContext } from './MealContext'
import { useCallback, useEffect, useState } from 'react'
import TrashIcon from '../(icons)/TrashIcon'
import PasteIcon from '../(icons)/PasteIcon'
import CopyIcon from '../(icons)/CopyIcon'
import { calcMealCalories } from '@/utils/macroMath'
import ItemGroupListView from '../(itemGroup)/ItemGroupListView'
import { ItemGroup, itemGroupSchema } from '@/model/foodItemGroupModel'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import useClipboard from '@/hooks/clipboard'

export type MealViewProps = {
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

// TODO: Rename MealView to MealEditView
export default function MealView({
  mealData,
  header,
  content,
  actions,
  className,
}: MealViewProps) {
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

MealView.Header = MealViewHeader
MealView.Content = MealViewContent
MealView.Actions = MealViewActions

function MealViewHeader({
  onUpdateMeal,
}: {
  onUpdateMeal: (meal: MealData) => void
}) {
  const acceptedClipboardSchema = mealSchema.or(itemGroupSchema)
  const { mealData } = useMealContext()
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
    () => writeToClipboard(JSON.stringify(mealData)),
    [mealData, writeToClipboard],
  )

  const handlePasteAfterConfirm = useCallback(() => {
    const parsedClipboard = JSON.parse(clipboardText)
    const result = acceptedClipboardSchema.safeParse(parsedClipboard)

    if (!result.success) return

    const data = result.data

    let groupsToAdd: ItemGroup[] = []
    if ('' in data && data[''] === 'Meal') {
      groupsToAdd = data.groups
    } else if ('type' in data) {
      groupsToAdd = [
        {
          ...data,
        } satisfies ItemGroup,
      ] satisfies ItemGroup[]
    } else {
      throw new Error('Invalid clipboard data: ' + clipboardText)
    }

    const groupsWithNewIds = groupsToAdd.map(
      (item: ItemGroup): ItemGroup => ({
        ...item,
        id: Math.floor(Math.random() * 1000000), // TODO: Create a function to generate a unique id
      }),
    )

    const newMealData: MealData = {
      ...mealData,
      groups: [...mealData.groups, ...groupsWithNewIds],
    }

    onUpdateMeal(newMealData)

    // Clear clipboard
    writeToClipboard('')
  }, [
    clipboardText,
    mealData,
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
  const mealCalories = calcMealCalories(mealData)

  const onClearItems = (e: React.MouseEvent) => {
    e.preventDefault()

    showConfirmModal({
      title: 'Limpar itens',
      message: 'Tem certeza que deseja limpar os itens?',
      onConfirm: () => {
        const newMealData: MealData = {
          ...mealData,
          groups: [],
        }

        onUpdateMeal(newMealData)
      },
    })
  }

  const hasValidPastableOnClipboard = isClipboardValid(clipboardText)

  return (
    <div className="flex">
      <div className="my-2">
        <h5 className="text-3xl">{mealData.name}</h5>
        <p className="italic text-gray-400">{mealCalories}kcal</p>
      </div>
      {/* // TODO: Remove code duplication between MealView and RecipeView */}
      <div className={`ml-auto flex gap-2`}>
        {!hasValidPastableOnClipboard && mealData.groups.length > 0 && (
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

function MealViewContent({
  onEditItemGroup,
}: {
  onEditItemGroup: (item: ItemGroup) => void
}) {
  const { mealData } = useMealContext()

  return (
    <ItemGroupListView
      itemGroups={mealData.groups}
      onItemClick={(...args) => onEditItemGroup(...args)}
    />
  )
}

function MealViewActions({ onNewItem }: { onNewItem: () => void }) {
  return (
    <button
      className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={onNewItem}
    >
      Adicionar item
    </button>
  )
}
