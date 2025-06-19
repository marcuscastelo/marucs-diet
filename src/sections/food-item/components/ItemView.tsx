import {
  type Accessor,
  createEffect,
  createSignal,
  type JSXElement,
  Show,
  untrack,
} from 'solid-js'

import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { fetchFoodById } from '~/modules/diet/food/application/food'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type Template } from '~/modules/diet/template/domain/template'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import {
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import { ContextMenu } from '~/sections/common/components/ContextMenu'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import { MoreVertIcon } from '~/sections/common/components/icons/MoreVertIcon'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import {
  ItemContextProvider,
  useItemContext,
} from '~/sections/food-item/context/ItemContext'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import { cn } from '~/shared/cn'
import {
  handleApiError,
  handleValidationError,
} from '~/shared/error/errorHandler'
import { createDebug } from '~/shared/utils/createDebug'
import { stringToDate } from '~/shared/utils/date'
import { calcItemCalories, calcItemMacros } from '~/shared/utils/macroMath'
import { isOverflow } from '~/shared/utils/macroOverflow'

const debug = createDebug()

// TODO:   Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

export type ItemViewProps = {
  item: Accessor<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
  header?: JSXElement | (() => JSXElement)
  nutritionalInfo?: JSXElement | (() => JSXElement)
  class?: string
  mode: 'edit' | 'read-only' | 'summary'
  handlers: {
    onClick?: (item: TemplateItem) => void
    onEdit?: (item: TemplateItem) => void
    onCopy?: (item: TemplateItem) => void
    onDelete?: (item: TemplateItem) => void
  }
}

export function ItemView(props: ItemViewProps) {
  debug('ItemView called', { props })

  const handleMouseEvent = (callback?: () => void) => {
    if (callback === undefined) {
      return undefined
    }

    return (e: MouseEvent) => {
      debug('ItemView handleMouseEvent', { e })
      e.stopPropagation()
      e.preventDefault()
      callback()
    }
  }

  const handlers = () => {
    const callHandler = (handler?: (item: TemplateItem) => void) =>
      handler ? () => handler(untrack(() => props.item())) : undefined

    const handleClick = callHandler(props.handlers.onClick)
    const handleEdit = callHandler(props.handlers.onEdit)
    const handleCopy = callHandler(props.handlers.onCopy)
    const handleDelete = callHandler(props.handlers.onDelete)
    return {
      onClick: handleMouseEvent(handleClick),
      onEdit: handleMouseEvent(handleEdit),
      onCopy: handleMouseEvent(handleCopy),
      onDelete: handleMouseEvent(handleDelete),
    }
  }
  return (
    <div
      class={cn(
        'block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700',
        props.class,
      )}
      onClick={(e) => handlers().onClick?.(e)}
    >
      <ItemContextProvider
        item={props.item}
        macroOverflow={props.macroOverflow}
      >
        <div class="flex items-center">
          <div class="flex flex-1  items-center">
            <div class="flex-1">
              {typeof props.header === 'function'
                ? props.header()
                : props.header}
            </div>
            <div class="">
              {props.mode === 'edit' && (
                <ContextMenu
                  trigger={
                    <div class="text-3xl active:scale-105 hover:text-blue-200">
                      <MoreVertIcon />
                    </div>
                  }
                  class="ml-2"
                >
                  <Show when={handlers().onEdit}>
                    {(onEdit) => (
                      <ContextMenu.Item
                        class="text-left px-4 py-2 hover:bg-gray-700"
                        onClick={onEdit()}
                      >
                        <div class="flex items-center gap-2">
                          <span class="text-blue-500">✏️</span>
                          <span>Editar</span>
                        </div>
                      </ContextMenu.Item>
                    )}
                  </Show>
                  <Show when={handlers().onCopy}>
                    {(onCopy) => (
                      <ContextMenu.Item
                        class="text-left px-4 py-2 hover:bg-gray-700"
                        onClick={onCopy()}
                      >
                        <div class="flex items-center gap-2">
                          <CopyIcon size={15} />
                          <span>Copiar</span>
                        </div>
                      </ContextMenu.Item>
                    )}
                  </Show>
                  <Show when={handlers().onDelete}>
                    {(onDelete) => (
                      <ContextMenu.Item
                        class="text-left px-4 py-2 text-red-400 hover:bg-gray-700"
                        onClick={onDelete()}
                      >
                        <div class="flex items-center gap-2">
                          <span class="text-red-400">
                            <TrashIcon size={15} />
                          </span>
                          <span class="text-red-400">Excluir</span>
                        </div>
                      </ContextMenu.Item>
                    )}
                  </Show>
                </ContextMenu>
              )}
            </div>
          </div>
        </div>
        {typeof props.nutritionalInfo === 'function'
          ? props.nutritionalInfo()
          : props.nutritionalInfo}
      </ItemContextProvider>
    </div>
  )
}

export function ItemName() {
  debug('ItemName called')

  const { item } = useItemContext()

  const [template, setTemplate] = createSignal<Template | null>(null)

  createEffect(() => {
    debug('[ItemName] createEffect triggered', { item: item() })

    const itemValue = item()
    if (isTemplateItemRecipe(itemValue)) {
      recipeRepository
        .fetchRecipeById(itemValue.reference)
        .then(setTemplate)
        .catch((err) => {
          handleApiError(err)
          setTemplate(null)
        })
    } else if (isTemplateItemFood(itemValue)) {
      fetchFoodById(itemValue.reference)
        .then(setTemplate)
        .catch((err) => {
          handleApiError(err)
          setTemplate(null)
        })
    }
  })

  const templateNameColor = () => {
    if (isTemplateItemFood(item())) {
      return 'text-white'
    } else if (isTemplateItemRecipe(item())) {
      return 'text-blue-500'
    } else {
      // No need for unnecessary conditional, just stringify item
      handleValidationError(
        new Error(
          `Item is not a Item or RecipeItem! Item: ${JSON.stringify(item())}`,
        ),
        {
          component: 'ItemView::ItemName',
          operation: 'templateNameColor',
          additionalData: { item: item() },
        },
      )
      return 'text-red-500 bg-red-100'
    }
  }

  const name = () => {
    const t = template()
    if (
      t &&
      typeof t === 'object' &&
      'name' in t &&
      typeof t.name === 'string'
    ) {
      return t.name
    }
    return 'food not found'
  }

  return (
    <div class="">
      {/* //TODO:   Item id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.Item.id}]</h5> */}
      <h5
        class={`mb-2 text-lg font-bold tracking-tight ${templateNameColor()}`}
      >
        {name()}{' '}
      </h5>
    </div>
  )
}

export function ItemCopyButton(props: {
  onCopyItem: (item: TemplateItem) => void
}) {
  debug('ItemCopyButton called', { props })

  const { item } = useItemContext()

  return (
    <div
      class={'btn btn-ghost ml-auto mt-1 px-2 text-white hover:scale-105'}
      onClick={(e) => {
        debug('ItemCopyButton onClick', { item: item() })
        e.stopPropagation()
        e.preventDefault()
        props.onCopyItem(item())
      }}
    >
      <CopyIcon />
    </div>
  )
}

export function ItemFavorite(props: { foodId: number }) {
  debug('ItemFavorite called', { props })

  const toggleFavorite = (e: MouseEvent) => {
    debug('toggleFavorite', {
      foodId: props.foodId,
      isFavorite: isFoodFavorite(props.foodId),
    })
    setFoodAsFavorite(props.foodId, !isFoodFavorite(props.foodId))
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      class="text-3xl text-orange-400 active:scale-105 hover:text-blue-200"
      onClick={toggleFavorite}
    >
      {isFoodFavorite(props.foodId) ? '★' : '☆'}
    </div>
  )
}

export function ItemNutritionalInfo() {
  debug('ItemNutritionalInfo called')

  const { item, macroOverflow } = useItemContext()

  const multipliedMacros = (): MacroNutrients => calcItemMacros(item())

  // Provide explicit macro overflow checker object for MacroNutrientsView
  const isMacroOverflowing = () => {
    const currentDayDiet_ = currentDayDiet()
    const macroTarget_ = getMacroTargetForDay(stringToDate(targetDay()))
    const context = {
      currentDayDiet: currentDayDiet_,
      macroTarget: macroTarget_,
      macroOverflowOptions: macroOverflow(),
    }
    return {
      carbs: () => isOverflow(item(), 'carbs', context),
      protein: () => isOverflow(item(), 'protein', context),
      fat: () => isOverflow(item(), 'fat', context),
    }
  }

  return (
    <div class="flex">
      <MacroNutrientsView
        macros={multipliedMacros()}
        isMacroOverflowing={isMacroOverflowing()}
      />
      <div class="ml-auto">
        <span class="text-white"> {item().quantity}g </span>|
        <span class="text-white">
          {' '}
          {calcItemCalories(item()).toFixed(0)}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}
