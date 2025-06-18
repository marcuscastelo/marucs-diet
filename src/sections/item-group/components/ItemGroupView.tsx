import {
  type Accessor,
  createEffect,
  createMemo,
  createResource,
  type JSXElement,
  Show,
  untrack,
} from 'solid-js'

import {
  getItemGroupQuantity,
  isRecipedGroupUpToDate,
  isRecipedItemGroup,
  isSimpleItemGroup,
  isSimpleSingleGroup,
  type ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { ContextMenu } from '~/sections/common/components/ContextMenu'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import { MoreVertIcon } from '~/sections/common/components/icons/MoreVertIcon'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import {
  handleApiError,
  handleValidationError,
} from '~/shared/error/errorHandler'
import { createDebug } from '~/shared/utils/createDebug'
import { calcGroupCalories, calcGroupMacros } from '~/shared/utils/macroMath'

const debug = createDebug()

// TODO:   Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

export type ItemGroupViewProps = {
  itemGroup: Accessor<ItemGroup>
  header?: JSXElement
  nutritionalInfo?: JSXElement
  class?: string
  mode?: 'edit' | 'read-only' | 'summary'
  handlers: {
    onClick?: (itemGroup: ItemGroup) => void
    onEdit?: (itemGroup: ItemGroup) => void
    onCopy?: (itemGroup: ItemGroup) => void
    onDelete?: (itemGroup: ItemGroup) => void
  }
}

export function ItemGroupView(props: ItemGroupViewProps) {
  console.debug('[ItemGroupView] - Rendering')

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

  const handlers = createMemo(() => {
    const callHandler = (handler?: (item: ItemGroup) => void) =>
      handler ? () => handler(untrack(() => props.itemGroup())) : undefined

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
  })

  return (
    <div
      class={`meal-item block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700 ${
        props.class ?? ''
      }`}
      onClick={(e) => handlers().onClick?.(e)}
    >
      <div class="flex flex-1  items-center">
        <div class="flex-1">{props.header}</div>
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
        handleApiError(err)
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
      return 'text-red-900 bg-red-200/50'
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
      class={
        'btn-ghost btn cursor-pointer uppercase ml-auto mt-1 px-2 text-white hover:scale-105'
      }
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
