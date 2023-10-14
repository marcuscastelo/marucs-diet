'use client'

import { Meal, mealSchema } from '@/legacy/model/mealModel'
import {
  MealContextProvider,
  useMealContext,
} from '@/sections/meal/context/MealContext'
import { useCallback } from 'react'
import TrashIcon from '@/sections/common/components/icons/TrashIcon'
import PasteIcon from '@/sections/common/components/icons/PasteIcon'
import CopyIcon from '@/sections/common/components/icons/CopyIcon'
import { calcMealCalories } from '@/legacy/utils/macroMath'
import ItemGroupListView from '@/sections/template/group/components/ItemGroupListView'
import { ItemGroup, itemGroupSchema } from '@/legacy/model/itemGroupModel'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import useClipboard, {
  createClipboardSchemaFilter,
} from '@/sections/common/hooks/useClipboard'
import { addInnerGroups } from '@/legacy/utils/mealUtils'
import { deserializeClipboard } from '@/legacy/utils/clipboardUtils'
import { convertToGroups } from '@/legacy/utils/groupUtils'
import { regenerateId } from '@/legacy/utils/idUtils'
import { foodItemSchema } from '@/legacy/model/foodItemModel'
import { recipeSchema } from '@/legacy/model/recipeModel'
import {
  ReadonlySignal,
  computed,
  useSignalEffect,
} from '@preact/signals-react'

export type MealEditViewProps = {
  meal: ReadonlySignal<Meal>
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
  header?: React.ReactNode
  content?: React.ReactNode
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
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
    <div
      className={`bg-gray-800 p-3 ${className === undefined ? '' : className}`}
    >
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
    .or(recipeSchema)
  const { meal } = useMealContext()
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
    () => writeToClipboard(JSON.stringify(meal)),
    [meal, writeToClipboard],
  )

  // TODO: Remove code duplication between MealEditView and RecipeView
  const handlePasteAfterConfirm = useCallback(() => {
    const data = deserializeClipboard(clipboardText, acceptedClipboardSchema)

    if (!data) {
      throw new Error('Invalid clipboard data: ' + clipboardText)
    }

    const groupsToAdd = convertToGroups(data)
      .map(regenerateId)
      .map((g) => ({
        ...g,
        items: g.items.map(regenerateId),
      }))

    // TODO: Create RecipeEditor, MealEditor, ItemGroupEditor, FoodItemEditor classes to avoid this code duplication and error proneness
    const newMeal = addInnerGroups(meal.value, groupsToAdd)

    onUpdateMeal(newMeal)

    // Clear clipboard
    clearClipboard()
  }, [
    clipboardText,
    clearClipboard,
    meal,
    onUpdateMeal,
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

  // TODO: Show how much of the daily target is this meal (e.g. 30% of daily calories) (maybe in a tooltip) (useContext)s
  const mealCalories = calcMealCalories(meal.value)

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
            // TODO: Use MealEditor
            const newMeal: Meal = {
              ...meal.value,
              groups: [],
            }

            onUpdateMeal(newMeal)
          },
        },
      ],
    })
  }

  const hasValidPastableOnClipboard = isClipboardValid(clipboardText)

  return (
    <div className="flex">
      <div className="my-2">
        <h5 className="text-3xl">{meal.value.name}</h5>
        <p className="italic text-gray-400">{mealCalories.toFixed(0)}kcal</p>
      </div>
      {/* // TODO: Remove code duplication between MealEditView and RecipeView */}
      <div className={`ml-auto flex gap-2`}>
        {!hasValidPastableOnClipboard && meal.value.groups.length > 0 && (
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
        {meal.value.groups.length > 0 && (
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

  useSignalEffect(() => {
    console.debug(`[MealEditViewContent] meal.value changed:`, meal.value)
  })

  return (
    <ItemGroupListView
      itemGroups={computed(() => meal.value?.groups ?? [])}
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
