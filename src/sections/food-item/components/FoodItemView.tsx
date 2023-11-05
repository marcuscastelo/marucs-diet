import MacroNutrientsView from '@/sections/macro-nutrients/components/MacroNutrientsView'
import { type MacroNutrients } from '@/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  FoodItemContextProvider,
  useFoodItemContext,
} from '@/sections/food-item/context/FoodItemContext'
import { CopyIcon } from '@/sections/common/components/icons/CopyIcon'
import { calcItemCalories } from '@/legacy/utils/macroMath'
import { type TemplateItem } from '@/modules/diet/template-item/domain/templateItem'
import { type Template } from '@/modules/diet/template/domain/template'

import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import {
  type JSXElement,
  type Accessor,
  createSignal,
  createEffect,
} from 'solid-js'
import { cn } from '@/legacy/utils/cn'
import { fetchFoodById } from '@/modules/diet/food/application/food'

// TODO: Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

export type FoodItemViewProps = {
  foodItem: Accessor<TemplateItem>
  header?: JSXElement
  nutritionalInfo?: JSXElement
  class?: string
  onClick?: (foodItem: TemplateItem) => void
}

export function FoodItemView(props: FoodItemViewProps) {
  const handleClick = (e: MouseEvent) => {
    props.onClick?.(props.foodItem())
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
      <FoodItemContextProvider foodItem={props.foodItem}>
        {props.header}
        {props.nutritionalInfo}
      </FoodItemContextProvider>
    </div>
  )
}

export type FoodItemHeaderProps = {
  name?: JSXElement
  favorite?: JSXElement
  copyButton?: JSXElement
}

export function FoodItemHeader(props: FoodItemHeaderProps) {
  return (
    <div class="flex">
      {/* //TODO: FoodItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.FoodItem.id}]</h5> */}
      <div class="my-2">{props.name}</div>
      <div class={'ml-auto flex gap-2'}>
        <div class="my-auto">{props.copyButton}</div>
        <div class="my-auto">{props.favorite}</div>
      </div>
    </div>
  )
}

export function FoodItemName() {
  const { foodItem: item } = useFoodItemContext()

  const [template, setTemplate] = createSignal<Template | null>(null)

  createEffect(() => {
    console.debug('[FoodItemName] item changed, fetching API:', item())

    const itemValue = item()
    if (itemValue === undefined) {
      console.warn('[FoodItemName] item is undefined!!')
      return // TODO: Remove serverActions: causing bugs with signals
    }

    if (itemValue.__type === 'RecipeItem') {
      recipeRepository
        .fetchRecipeById(itemValue.reference)
        .then(setTemplate)
        .catch((err) => {
          console.error('[FoodItemName] Error fetching recipe:', err)
          setTemplate(null)
        })
    } else {
      fetchFoodById(itemValue.reference)
        .then(setTemplate)
        .catch((err) => {
          console.error('[FoodItemName] Error fetching food:', err)
          setTemplate(null)
        })
    }
  })

  const templateNameColor = () => {
    if (item()?.__type === 'FoodItem') {
      return 'text-white'
    } else if (item().__type === 'RecipeItem') {
      return 'text-blue-500'
    } else {
      console.error(
        '[FoodItemName] item is not a FoodItem or RecipeItem! Item:',
        item(),
      )
      return 'text-red-500 bg-red-100'
    }
  }

  const name = () => template()?.name ?? 'food not found'

  return (
    <div class="">
      {/* //TODO: FoodItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.FoodItem.id}]</h5> */}
      <h5
        class={`mb-2 text-lg font-bold tracking-tight ${templateNameColor()}`}
      >
        {name()}{' '}
      </h5>
    </div>
  )
}

export function FoodItemCopyButton(props: {
  onCopyItem: (foodItem: TemplateItem) => void
}) {
  const { foodItem } = useFoodItemContext()

  return (
    <div
      class={'btn btn-ghost ml-auto mt-1 px-2 text-white hover:scale-105'}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        props.onCopyItem(foodItem())
      }}
    >
      <CopyIcon />
    </div>
  )
}

export function FoodItemFavorite(props: {
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

export function FoodItemNutritionalInfo() {
  const { foodItem: item } = useFoodItemContext()

  const multipliedMacros = (): MacroNutrients => ({
    carbs: (item().macros.carbs * item().quantity) / 100,
    protein: (item().macros.protein * item().quantity) / 100,
    fat: (item().macros.fat * item().quantity) / 100,
  })

  return (
    <div class="flex">
      <MacroNutrientsView {...multipliedMacros()} />
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
