import { type Meal, mealSchema } from '@/modules/diet/meal/domain/meal'
import { TrashIcon } from '@/sections/common/components/icons/TrashIcon'
import { PasteIcon } from '@/sections/common/components/icons/PasteIcon'
import { CopyIcon } from '@/sections/common/components/icons/CopyIcon'
import { calcMealCalories } from '@/legacy/utils/macroMath'
import { ItemGroupListView } from '@/sections/item-group/components/ItemGroupListView'
import {
  type ItemGroup,
  itemGroupSchema
} from '@/modules/diet/item-group/domain/itemGroup'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import {
  useClipboard,
  createClipboardSchemaFilter
} from '@/sections/common/hooks/useClipboard'
import { addInnerGroups } from '@/legacy/utils/mealUtils'
import { deserializeClipboard } from '@/legacy/utils/clipboardUtils'
import { convertToGroups } from '@/legacy/utils/groupUtils'
import { regenerateId } from '@/legacy/utils/idUtils'
import { foodItemSchema } from '@/modules/diet/food-item/domain/foodItem'
import { recipeSchema } from '@/modules/diet/recipe/domain/recipe'
import { createEffect, Show, type JSXElement } from 'solid-js'
import { MealContextProvider, useMealContext } from '@/sections/meal/context/MealContext'

export type MealEditViewProps = {
  meal: Meal
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
  header?: JSXElement
  content?: JSXElement
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
  actions?: JSXElement
  class?: string
}

// TODO: move this function
// a little function to help us with reordering the result
// const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
//   const result = Array.from(list)
//   const [removed] = result.splice(startIndex, 1)
//   result.splice(endIndex, 0, removed)

//   return result.
// }

export function MealEditView (props: MealEditViewProps) {
  return (
    <MealContextProvider meal={() => props.meal}>
    <div
      class={`bg-gray-800 p-3 ${props.class ?? ''}`} // TODO: use cn on all classes that use props.class
    >
      {props.header}
      {props.content}
      {props.actions}
    </div>
    </MealContextProvider>
  )
}

export function MealEditViewHeader (props: {
  onUpdateMeal: (meal: Meal) => void
}) {
  const acceptedClipboardSchema = mealSchema
    .or(itemGroupSchema)
    .or(foodItemSchema)
    .or(recipeSchema)
  const { show: showConfirmModal } = useConfirmModalContext()
  const { meal } = useMealContext()

  const isClipboardValid = createClipboardSchemaFilter(acceptedClipboardSchema)

  const {
    clipboard: clipboardText,
    write: writeToClipboard,
    clear: clearClipboard
  } = useClipboard({
    filter: isClipboardValid
  })

  const handleCopy =
    () => { writeToClipboard(JSON.stringify(meal())) }

  // TODO: Remove code duplication between MealEditView and RecipeView
  const handlePasteAfterConfirm = () => {
    const data = deserializeClipboard(
      clipboardText(),
      acceptedClipboardSchema
    )

    if (data === null) {
      throw new Error('Invalid clipboard data: ' + clipboardText())
    }

    const meal_ = meal()
    if (meal_ === null) {
      throw new Error('mealSignal is null!')
    }

    const groupsToAdd = convertToGroups(data)
      .map((group) => regenerateId(group))
      .map((g) => ({
        ...g,
        items: g.items.map((item) => regenerateId(item))
      }))

    // TODO: Create RecipeEditor, MealEditor, ItemGroupEditor, FoodItemEditor classes to avoid this code duplication and error proneness
    const newMeal = addInnerGroups(meal_, groupsToAdd)

    props.onUpdateMeal(newMeal)

    // Clear clipboard
    clearClipboard()
  }

  const handlePaste = () => {
    showConfirmModal({
      title: 'Colar itens',
      body: 'Tem certeza que deseja colar os itens?',
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined
        },
        { text: 'Colar', primary: true, onClick: handlePasteAfterConfirm }
      ]
    })
  }

  // TODO: Show how much of the daily target is this meal (e.g. 30% of daily calories) (maybe in a tooltip) (useContext)s
  const mealCalories = () => {
    const meal_ = meal()
    if (meal_ === null) {
      return 0
    }
    return calcMealCalories(meal_)
  }

  const onClearItems = (e: MouseEvent) => {
    e.preventDefault()

    showConfirmModal({
      title: 'Limpar itens',
      body: 'Tem certeza que deseja limpar os itens?',
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined
        },
        {
          text: 'Excluir todos os itens',
          primary: true,
          onClick: () => {
            const meal_ = meal()
            if (meal_ === null) {
              throw new Error('meal_ is null!')
            }
            // TODO: Use MealEditor
            const newMeal: Meal = {
              ...meal_,
              groups: []
            }

            props.onUpdateMeal(newMeal)
          }
        }
      ]
    })
  }

  const hasValidPastableOnClipboard = isClipboardValid(clipboardText())

  return (
    <Show when={meal()}>
      {(mealSignal) => (
    <div class="flex">
      <div class="my-2">
        <h5 class="text-3xl">{mealSignal()?.name}</h5>
        <p class="italic text-gray-400">{mealCalories().toFixed(0)}kcal</p>
      </div>
      {/* // TODO: Remove code duplication between MealEditView and RecipeView */}
      <div class={'ml-auto flex gap-2'}>
        {!hasValidPastableOnClipboard && (mealSignal()?.groups.length ?? 0) > 0 && (
          <div
            class={'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'}
            onClick={handleCopy}
          >
            <CopyIcon />
          </div>
        )}
        {hasValidPastableOnClipboard && (
          <div
            class={'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'}
            onClick={handlePaste}
          >
            <PasteIcon />
          </div>
        )}
        {(mealSignal()?.groups.length ?? 0) > 0 && (
          <div
            class={'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'}
            onClick={onClearItems}
          >
            <TrashIcon />
          </div>
        )}
      </div>
    </div>
      )}
      </Show>
  )
}

export function MealEditViewContent (props: {
  onEditItemGroup: (item: ItemGroup) => void
}) {
  const { meal } = useMealContext()

  console.debug('[MealEditViewContent] - Rendering')
  console.debug('[MealEditViewContent] - meal.value:', meal())

  createEffect(() => {
    console.debug('[MealEditViewContent] meal.value changed:', meal())
  })

  return (
    <ItemGroupListView
      itemGroups={() => meal()?.groups ?? []}
      onItemClick={(...args) => { props.onEditItemGroup(...args) }}
    />
  )
}

export function MealEditViewActions (props: { onNewItem: () => void }) {
  return (
    <button
      class="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={() => { props.onNewItem() }}
    >
      Adicionar item
    </button>
  )
}
