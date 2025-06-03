import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  ItemContextProvider,
  useItemContext,
} from '~/sections/food-item/context/ItemContext'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import { calcItemCalories, calcItemMacros } from '~/legacy/utils/macroMath'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { type Template } from '~/modules/diet/template/domain/template'

import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import {
  type JSXElement,
  type Accessor,
  createSignal,
  createEffect,
} from 'solid-js'
import { cn } from '~/shared/cn'
import { fetchFoodById } from '~/modules/diet/food/application/food'
import { stringToDate } from '~/shared/utils/date'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { macroTarget } from '~/modules/diet/macro-target/application/macroTarget'
import { createMacroOverflowChecker } from '~/legacy/utils/macroOverflow'
import {
  handleApiError,
  handleValidationError,
} from '~/shared/error/errorHandler'

// TODO: Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

export type ItemViewProps = {
  item: Accessor<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
  header?: JSXElement
  nutritionalInfo?: JSXElement
  class?: string
  onClick?: (item: TemplateItem) => void
}

export function ItemView(props: ItemViewProps) {
  const handleClick = (e: MouseEvent) => {
    props.onClick?.(props.item())
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      class={`meal-item block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700 ${
        props.class ?? ''
      }`}
      onClick={handleClick}
    >
      <ItemContextProvider
        item={props.item}
        macroOverflow={props.macroOverflow}
      >
        {props.header}
        {props.nutritionalInfo}
      </ItemContextProvider>
    </div>
  )
}

export type ItemHeaderProps = {
  name?: JSXElement
  favorite?: JSXElement
  copyButton?: JSXElement
  removeFromListButton?: JSXElement
}

export function ItemHeader(props: ItemHeaderProps) {
  return (
    <div class="flex">
      {/* //TODO: Item id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.Item.id}]</h5> */}
      <div class="my-2">{props.name}</div>
      <div class="ml-auto flex flex-col">
        <div class="my-auto">{props.removeFromListButton}</div>
        <div class={'ml-auto flex gap-2'}>
          <div class="my-auto">{props.copyButton}</div>
          <div class="my-auto">{props.favorite}</div>
        </div>
      </div>
    </div>
  )
}

export function ItemName() {
  const { item } = useItemContext()

  const [template, setTemplate] = createSignal<Template | null>(null)

  createEffect(() => {
    console.debug('[ItemName] item changed, fetching API:', item())

    const itemValue = item()
    if (itemValue === undefined) {
      console.warn('[ItemName] item is undefined!!')
      return // TODO: Remove serverActions: causing bugs with signals
    }

    if (itemValue.__type === 'RecipeItem') {
      recipeRepository
        .fetchRecipeById(itemValue.reference)
        .then(setTemplate)
        .catch((err) => {
          handleApiError(err, {
            component: 'ItemView::ItemName',
            operation: 'fetchRecipeById',
            additionalData: { recipeId: itemValue.reference },
          })
          setTemplate(null)
        })
    } else {
      fetchFoodById(itemValue.reference)
        .then(setTemplate)
        .catch((err) => {
          handleApiError(err, {
            component: 'ItemView::ItemName',
            operation: 'fetchFoodById',
            additionalData: { foodId: itemValue.reference },
          })
          setTemplate(null)
        })
    }
  })

  const templateNameColor = () => {
    if (item()?.__type === 'Item') {
      return 'text-white'
    } else if (item().__type === 'RecipeItem') {
      return 'text-blue-500'
    } else {
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

  const name = () => template()?.name ?? 'food not found'

  return (
    <div class="">
      {/* //TODO: Item id is random, but it should be an entry on the database (meal too) */}
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
  const { item } = useItemContext()

  return (
    <div
      class={'btn btn-ghost ml-auto mt-1 px-2 text-white hover:scale-105'}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        props.onCopyItem(item())
      }}
    >
      <CopyIcon />
    </div>
  )
}

export function ItemFavorite(props: {
  favorite: boolean
  onSetFavorite?: (favorite: boolean) => void
}) {
  const toggleFavorite = (e: MouseEvent) => {
    props.onSetFavorite?.(!props.favorite)
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      class={cn('ml-auto mt-1 text-3xl text-orange-400 active:scale-105', {
        'hover:text-blue-200': props.onSetFavorite !== undefined,
      })}
      onClick={toggleFavorite}
    >
      {props.favorite ? '★' : '☆'}
    </div>
  )
}

export function ItemNutritionalInfo() {
  const { item, macroOverflow } = useItemContext()

  const multipliedMacros = (): MacroNutrients => calcItemMacros(item())

  const isMacroOverflowing = () => {
    const currentDayDiet_ = currentDayDiet()
    const macroTarget_ = macroTarget(stringToDate(targetDay()))

    return createMacroOverflowChecker(item(), {
      currentDayDiet: currentDayDiet_,
      macroTarget: macroTarget_,
      macroOverflowOptions: macroOverflow(),
    })
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
