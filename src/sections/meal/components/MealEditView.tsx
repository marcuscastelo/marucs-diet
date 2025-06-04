import { type Meal, mealSchema } from '~/modules/diet/meal/domain/meal'
import { calcMealCalories } from '~/legacy/utils/macroMath'
import { ItemGroupListView } from '~/sections/item-group/components/ItemGroupListView'
import {
  type ItemGroup,
  itemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import {
  convertToGroups,
  type GroupConvertible,
} from '~/modules/diet/item-group/application/itemGroupService'
import { regenerateId } from '~/legacy/utils/idUtils'
import { itemSchema } from '~/modules/diet/item/domain/item'
import { recipeSchema } from '~/modules/diet/recipe/domain/recipe'
import { createEffect, Show, type JSXElement } from 'solid-js'
import {
  MealContextProvider,
  useMealContext,
} from '~/sections/meal/context/MealContext'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  addGroupsToMeal,
  clearMealGroups,
} from '~/modules/diet/meal/domain/mealOperations'
import { ClipboardActionButtons } from '~/sections/common/components/ClipboardActionButtons'

export type MealEditViewProps = {
  meal: Meal
  /**
   * @deprecated
   */
  header?: JSXElement
  content?: JSXElement
  /**
   * @deprecated
   */
  actions?: JSXElement
  class?: string
}

// TODO:   move this function
// a little function to help us with reordering the result
// const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
//   const result = Array.from(list)
//   const [removed] = result.splice(startIndex, 1)
//   result.splice(endIndex, 0, removed)

//   return result.
// }

export function MealEditView(props: MealEditViewProps) {
  return (
    <MealContextProvider meal={() => props.meal}>
      <div
        class={`bg-gray-800 p-3 ${props.class ?? ''}`} // TODO:   use cn on all classes that use props.class
      >
        {props.header}
        {props.content}
        {props.actions}
      </div>
    </MealContextProvider>
  )
}

export function MealEditViewHeader(props: {
  onUpdateMeal: (meal: Meal) => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()
  const { meal } = useMealContext()
  const acceptedClipboardSchema = mealSchema
    .or(itemGroupSchema)
    .or(itemSchema)
    .or(recipeSchema)

  const { handleCopy, handlePaste, hasValidPastableOnClipboard } =
    useCopyPasteActions({
      acceptedClipboardSchema,
      getDataToCopy: () => meal(),
      onPaste: (data) => {
        const meal_ = meal()
        if (meal_ === null) {
          throw new Error('mealSignal is null!')
        }
        const groupsToAdd = convertToGroups(data as GroupConvertible)
          .map((group) => regenerateId(group))
          .map((g) => ({
            ...g,
            items: g.items.map((item) => regenerateId(item)),
          }))
        const newMeal = addGroupsToMeal(meal_, groupsToAdd)
        props.onUpdateMeal(newMeal)
      },
    })

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
        { text: 'Cancelar', onClick: () => undefined },
        {
          text: 'Excluir todos os itens',
          primary: true,
          onClick: () => {
            const meal_ = meal()
            if (meal_ === null) {
              throw new Error('meal_ is null!')
            }
            const newMeal = clearMealGroups(meal_)
            props.onUpdateMeal(newMeal)
          },
        },
      ],
    })
  }

  return (
    <Show when={meal()}>
      {(mealSignal) => (
        <div class="flex">
          <div class="my-2">
            <h5 class="text-3xl">{mealSignal()?.name}</h5>
            <p class="italic text-gray-400">{mealCalories().toFixed(0)}kcal</p>
          </div>
          <ClipboardActionButtons
            canCopy={
              !hasValidPastableOnClipboard() &&
              (mealSignal()?.groups.length ?? 0) > 0
            }
            canPaste={hasValidPastableOnClipboard()}
            canClear={(mealSignal()?.groups.length ?? 0) > 0}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onClear={onClearItems}
          />
        </div>
      )}
    </Show>
  )
}

export function MealEditViewContent(props: {
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
      onItemClick={(...args) => {
        props.onEditItemGroup(...args)
      }}
    />
  )
}

export function MealEditViewActions(props: { onNewItem: () => void }) {
  return (
    <button
      class="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={() => {
        props.onNewItem()
      }}
    >
      Adicionar item
    </button>
  )
}
