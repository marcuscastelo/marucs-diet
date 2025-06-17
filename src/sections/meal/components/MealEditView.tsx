import { Accessor, createEffect, type JSXElement, Show } from 'solid-js'

import { DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { itemSchema } from '~/modules/diet/item/domain/item'
import { deleteItemGroup } from '~/modules/diet/item-group/application/itemGroup'
import {
  convertToGroups,
  type GroupConvertible,
} from '~/modules/diet/item-group/application/itemGroupService'
import {
  type ItemGroup,
  itemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal, mealSchema } from '~/modules/diet/meal/domain/meal'
import {
  addGroupsToMeal,
  clearMealGroups,
} from '~/modules/diet/meal/domain/mealOperations'
import { recipeSchema } from '~/modules/diet/recipe/domain/recipe'
import { ClipboardActionButtons } from '~/sections/common/components/ClipboardActionButtons'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { ItemGroupListView } from '~/sections/item-group/components/ItemGroupListView'
import {
  MealContextProvider,
  useMealContext,
} from '~/sections/meal/context/MealContext'
import { regenerateId } from '~/shared/utils/idUtils'
import { calcMealCalories } from '~/shared/utils/macroMath'

// TODO: Remove deprecated props and their usages
export type MealEditViewProps = {
  dayDiet: Accessor<DayDiet>
  meal: Accessor<Meal>
  /**
   * @deprecated
   */
  header?:
    | JSXElement
    | ((props: { mode?: 'edit' | 'read-only' | 'summary' }) => JSXElement)
  content?:
    | JSXElement
    | ((props: { mode?: 'edit' | 'read-only' | 'summary' }) => JSXElement)
  /**
   * @deprecated
   */
  actions?:
    | JSXElement
    | ((props: { mode?: 'edit' | 'read-only' | 'summary' }) => JSXElement)
  class?: string
  mode?: 'edit' | 'read-only' | 'summary'
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
    <MealContextProvider dayDiet={props.dayDiet} meal={props.meal}>
      <div class={`bg-gray-800 p-3 ${props.class ?? ''}`}>
        {typeof props.header === 'function'
          ? props.header({ mode: props.mode })
          : props.header}
        {typeof props.content === 'function'
          ? props.content({ mode: props.mode })
          : props.content}
        {typeof props.actions === 'function'
          ? props.actions({ mode: props.mode })
          : props.actions}
      </div>
    </MealContextProvider>
  )
}

export function MealEditViewHeader(props: {
  onUpdateMeal: (meal: Meal) => void
  mode?: 'edit' | 'read-only' | 'summary'
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
        const groupsToAdd = convertToGroups(data as GroupConvertible)
          .map((group) => regenerateId(group))
          .map((g) => ({
            ...g,
            items: g.items.map((item) => regenerateId(item)),
          }))
        const newMeal = addGroupsToMeal(meal(), groupsToAdd)
        props.onUpdateMeal(newMeal)
      },
    })

  const mealCalories = () => calcMealCalories(meal())

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
            const newMeal = clearMealGroups(meal())
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
            <h5 class="text-3xl">{mealSignal().name}</h5>
            <p class="italic text-gray-400">{mealCalories().toFixed(0)}kcal</p>
          </div>
          {props.mode !== 'summary' && (
            <ClipboardActionButtons
              canCopy={
                !hasValidPastableOnClipboard() && mealSignal().groups.length > 0
              }
              canPaste={hasValidPastableOnClipboard()}
              canClear={mealSignal().groups.length > 0}
              onCopy={handleCopy}
              onPaste={handlePaste}
              onClear={onClearItems}
            />
          )}
        </div>
      )}
    </Show>
  )
}

export function MealEditViewContent(props: {
  onEditItemGroup: (item: ItemGroup) => void
  mode?: 'edit' | 'read-only' | 'summary'
}) {
  const { dayDiet, meal } = useMealContext()
  const { show: showConfirmModal } = useConfirmModalContext()
  const clipboard = useClipboard()

  console.debug('[MealEditViewContent] - Rendering')
  console.debug('[MealEditViewContent] - meal.value:', meal())

  createEffect(() => {
    console.debug('[MealEditViewContent] meal.value changed:', meal())
  })

  return (
    <ItemGroupListView
      itemGroups={() => meal().groups}
      handlers={{
        onEdit: props.onEditItemGroup,
        onCopy: (item) => {
          clipboard.write(JSON.stringify(item))
        },
        onDelete: (item) => {
          showConfirmModal({
            title: 'Excluir grupo de itens',
            body: `Tem certeza que deseja excluir o grupo de itens "${item.name}"?`,
            actions: [
              { text: 'Cancelar', onClick: () => undefined },
              {
                text: 'Excluir grupo',
                primary: true,
                onClick: () => {
                  void deleteItemGroup(dayDiet().id, meal().id, item.id)
                },
              },
            ],
          })
        },
      }}
      mode={props.mode}
    />
  )
}

export function MealEditViewActions(props: { onNewItem: () => void }) {
  return (
    <button
      class="mt-3 cursor-pointer min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={() => {
        props.onNewItem()
      }}
    >
      Adicionar item
    </button>
  )
}
