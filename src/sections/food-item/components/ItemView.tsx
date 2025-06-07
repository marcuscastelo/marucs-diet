import { calcItemCalories, calcItemMacros } from '~/legacy/utils/macroMath'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { type Template } from '~/modules/diet/template/domain/template'
import {
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import {
  ItemContextProvider,
  useItemContext,
} from '~/sections/food-item/context/ItemContext'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'

import {
  type Accessor,
  createEffect,
  createSignal,
  type JSXElement,
} from 'solid-js'
import { createMacroOverflowChecker } from '~/legacy/utils/macroOverflow'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { fetchFoodById } from '~/modules/diet/food/application/food'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import {
  handleApiError,
  handleValidationError,
} from '~/shared/error/errorHandler'
import { stringToDate } from '~/shared/utils/date'

// TODO:   Use repository pattern through use cases instead of directly using repositories
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
  mode?: 'edit' | 'read-only' | 'summary'
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

export function ItemName() {
  const { item } = useItemContext()

  const [template, setTemplate] = createSignal<Template | null>(null)

  createEffect(() => {
    console.debug('[ItemName] item changed, fetching API:', item())

    const itemValue = item()
    if (isTemplateItemRecipe(itemValue)) {
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
    } else if (isTemplateItemFood(itemValue)) {
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
    if (isTemplateItemFood(item())) {
      return 'text-white'
    } else if (isTemplateItemRecipe(item())) {
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

export function ItemFavorite(props: { foodId: number }) {
  const toggleFavorite = (e: MouseEvent) => {
    setFoodAsFavorite(props.foodId, !isFoodFavorite(props.foodId))
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      class="ml-auto mt-1 text-3xl text-orange-400 active:scale-105 hover:text-blue-200"
      onClick={toggleFavorite}
    >
      {isFoodFavorite(props.foodId) ? '★' : '☆'}
    </div>
  )
}

export function ItemNutritionalInfo() {
  const { item, macroOverflow } = useItemContext()

  const multipliedMacros = (): MacroNutrients => calcItemMacros(item())

  const isMacroOverflowing = () => {
    const currentDayDiet_ = currentDayDiet()
    const macroTarget_ = getMacroTargetForDay(stringToDate(targetDay()))

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
