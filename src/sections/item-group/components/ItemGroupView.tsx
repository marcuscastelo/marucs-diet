import MacroNutrientsView from '@/sections/macro-nutrients/components/MacroNutrientsView'
import { type MacroNutrients } from '@/modules/diet/macro-nutrients/domain/macroNutrients'
import CopyIcon from '@/sections/common/components/icons/CopyIcon'
import {
  type ItemGroup,
  isSimpleSingleGroup
} from '@/modules/diet/item-group/domain/itemGroup'
import { calcGroupCalories, calcGroupMacros } from '@/legacy/utils/macroMath'
import { isRecipedGroupUpToDate } from '@/legacy/utils/groupUtils'
import { type Loadable } from '@/legacy/utils/loadable'
import { type Recipe } from '@/modules/diet/recipe/domain/recipe'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type JSXElement, type Accessor, createSignal, createEffect } from 'solid-js'

// TODO: Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

export type ItemGroupViewProps = {
  itemGroup: Accessor<ItemGroup>
  header?: JSXElement
  nutritionalInfo?: JSXElement
  className?: string
  onClick?: (itemGroup: ItemGroup) => void
}

export default function ItemGroupView (props: ItemGroupViewProps) {
  const handleClick = (e: MouseEvent) => {
    props.onClick?.(props.itemGroup())
    e.stopPropagation()
    e.preventDefault()
  }
  console.debug('[ItemGroupView] - Rendering')

  return (
    <div
      class={`meal-item block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700 ${
        props.className ?? ''
      }`}
      onClick={handleClick}
    >
      {props.header}
      {props.nutritionalInfo}
    </div>
  )
}

export type ItemGroupViewHeaderProps = {
  name?: JSXElement
  copyButton?: JSXElement
}

export function ItemGroupHeader (props: ItemGroupViewHeaderProps) {
  return (
    <div class="flex">
      {/* //TODO: ItemGroupView id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.ItemGroupView.id}]</h5> */}
      <div class="my-2">{props.name}</div>
      {/*
        // TODO: Remove code duplication between FoodItemView and ItemGroupView
      */}
      <div class={'ml-auto flex gap-2'}>
        <div class="my-auto">{props.copyButton}</div>
      </div>
    </div>
  )
}

export function ItemGroupName (props: {
  group: Accessor<ItemGroup>
}) {
  const [recipe, setRecipe] = createSignal<Loadable<Recipe | null>>({
    loading: true
  })

  createEffect(() => {
    console.debug('[ItemGroupName] item changed, fetching API:', props.group)
    const group = props.group()
    if (group?.type === 'recipe') {
      recipeRepository
        .fetchRecipeById(group.recipe)
        .then((foundRecipe) => {
          setRecipe({ loading: false, errored: false, data: foundRecipe })
        }).catch((err) => {
          console.error('[ItemGroupName] Error fetching recipe:', err)
          setRecipe({ loading: false, errored: true, error: err })
        })
    } else {
      setRecipe({ loading: false, errored: false, data: null })
    }
  })

  const nameColor = () => {
    const group_ = props.group()
    const recipe_ = recipe()

    if (group_ === null) {
      console.error('[ItemGroupName] item is null!!')
      return 'text-red-900 bg-red-200'
    }

    if (recipe_.loading) return 'text-gray-500 animate-pulse'
    if (recipe_.errored) {
      console.error('[ItemGroupName] recipe errored!!')
      return 'text-red-900 bg-red-200 bg-opacity-50'
    }

    if (group_.type === 'simple') {
      if (isSimpleSingleGroup(group_)) {
        return 'text-white'
      } else {
        return 'text-orange-400'
      }
    } else if (group_.type === 'recipe' && recipe_.data !== null) {
      if (isRecipedGroupUpToDate(group_, recipe_.data)) {
        return 'text-yellow-200'
      } else {
        // Strike-through text in red
        const className = 'text-yellow-200 underline decoration-red-500'
        return className
      }
    } else {
      console.error(
        '[ItemGroupName] item is not simple or recipe!! Item:',
        group_
      )
      return 'text-red-400'
    }
  }

  return (
    <div class="">
      {/*
        //TODO: ItemGroupView id is random, but it should be an entry on the database (meal too)
      */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.ItemGroupView.id}]</h5> */}
      <h5 class={`mb-2 text-lg font-bold tracking-tight ${nameColor()}`}>
        {props.group()?.name ?? 'Erro: grupo sem nome'}{' '}
      </h5>
    </div>
  )
}

export function ItemGroupCopyButton (props: {
  onCopyItemGroup: (itemGroup: ItemGroup) => void
  group: Accessor<ItemGroup>
}) {
  return (
    <div
      class={'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        props.onCopyItemGroup(props.group())
      }}
    >
      <CopyIcon />
    </div>
  )
}

export function ItemGroupViewNutritionalInfo (props: {
  group: Accessor<ItemGroup>
}) {
  console.debug('[ItemGroupViewNutritionalInfo] - Rendering')

  createEffect(() => {
    console.debug('[ItemGroupViewNutritionalInfo] - itemGroup:', props.group)
  })

  const multipliedMacros = () => calcGroupMacros(props.group()) ?? {
    carbs: -666,
    protein: -666,
    fat: -666
  } satisfies MacroNutrients

  return (
    <div class="flex">
      <MacroNutrientsView {...multipliedMacros()} />
      <div class="ml-auto">
        <span class="text-white">
          {' '}
          {props.group()?.quantity ?? -666}g{' '}
        </span>
        |
        <span class="text-white">
          {' '}
          {calcGroupCalories(props.group()).toFixed(0)}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}
