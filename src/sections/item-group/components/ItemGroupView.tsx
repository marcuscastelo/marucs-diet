import {
  type Accessor,
  type JSXElement,
  createEffect,
  createResource,
} from 'solid-js'
import { calcGroupCalories, calcGroupMacros } from '~/legacy/utils/macroMath'
import {
  type ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
  getItemGroupQuantity,
  isRecipedGroupUpToDate,
  isRecipedItemGroup,
  isSimpleItemGroup,
  isSimpleSingleGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import {
  handleApiError,
  handleValidationError,
} from '~/shared/error/errorHandler'

// TODO:   Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

export type ItemGroupViewProps = {
  itemGroup: Accessor<ItemGroup>
  header?: JSXElement
  nutritionalInfo?: JSXElement
  className?: string
  onClick?: (itemGroup: ItemGroup) => void
  mode?: 'edit' | 'read-only' | 'summary'
}

export function ItemGroupView(props: ItemGroupViewProps) {
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

export function ItemGroupName(props: { group: Accessor<ItemGroup> }) {
  const [recipe] = createResource(async () => {
    const group = props.group()
    if (isRecipedItemGroup(group)) {
      try {
        return await recipeRepository.fetchRecipeById(group.recipe)
      } catch (err) {
        handleApiError(err, {
          component: 'ItemGroupView::ItemGroupName',
          operation: 'fetchRecipeById',
          additionalData: { recipeId: group.recipe },
        })
        throw err
      }
    }
    return null
  })

  const nameColor = () => {
    const group_ = props.group()
    if (recipe.state === 'pending') return 'text-gray-500 animate-pulse'
    if (recipe.state === 'errored') {
      handleValidationError(new Error('Recipe loading failed'), {
        component: 'ItemGroupView::ItemGroupName',
        operation: 'nameColor',
        additionalData: { recipeError: recipe.error },
      })
      return 'text-red-900 bg-red-200 bg-opacity-50'
    }

    const handleSimple = (simpleGroup: SimpleItemGroup) => {
      if (isSimpleSingleGroup(simpleGroup)) {
        return 'text-white'
      } else {
        return 'text-orange-400'
      }
    }

    const handleRecipe = (
      recipedGroup: RecipedItemGroup,
      recipeData: Recipe,
    ) => {
      if (isRecipedGroupUpToDate(recipedGroup, recipeData)) {
        return 'text-yellow-200'
      } else {
        // Strike-through text in red
        const className = 'text-yellow-200 underline decoration-red-500'
        return className
      }
    }

    if (isSimpleItemGroup(group_)) {
      return handleSimple(group_)
    } else if (isRecipedItemGroup(group_)) {
      if (recipe() !== null) {
        return handleRecipe(group_, recipe()!)
      } else {
        return 'text-red-400'
      }
    } else {
      handleValidationError(new Error(`Unknown ItemGroup: ${String(group_)}`), {
        component: 'ItemGroupView::ItemGroupName',
        operation: 'nameColor',
        additionalData: { group: group_ },
      })
      return 'text-red-400'
    }
  }

  return (
    <div class="">
      <h5 class={`mb-2 text-lg font-bold tracking-tight ${nameColor()}`}>
        {props.group().name}{' '}
      </h5>
    </div>
  )
}

export function ItemGroupCopyButton(props: {
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

export function ItemGroupViewNutritionalInfo(props: {
  group: Accessor<ItemGroup>
}) {
  console.debug('[ItemGroupViewNutritionalInfo] - Rendering')

  createEffect(() => {
    console.debug('[ItemGroupViewNutritionalInfo] - itemGroup:', props.group)
  })

  const multipliedMacros = () => calcGroupMacros(props.group())

  return (
    <div class="flex">
      <MacroNutrientsView macros={multipliedMacros()} />
      <div class="ml-auto">
        <span class="text-white"> {getItemGroupQuantity(props.group())}g </span>
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
