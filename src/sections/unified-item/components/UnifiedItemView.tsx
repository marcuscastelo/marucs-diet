import {
  type Accessor,
  createMemo,
  createResource,
  For,
  type JSXElement,
  Show,
} from 'solid-js'

import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { isRecipeUnifiedItemManuallyEdited } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  isGroup,
  isRecipe,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { ContextMenu } from '~/sections/common/components/ContextMenu'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import { MoreVertIcon } from '~/sections/common/components/icons/MoreVertIcon'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import { cn } from '~/shared/cn'
import {
  calcUnifiedItemCalories,
  calcUnifiedItemMacros,
} from '~/shared/utils/macroMath'

export type UnifiedItemViewProps = {
  item: Accessor<UnifiedItem>
  header?: JSXElement | (() => JSXElement)
  nutritionalInfo?: JSXElement | (() => JSXElement)
  class?: string
  mode?: 'edit' | 'read-only' | 'summary'
  handlers: {
    onClick?: (item: UnifiedItem) => void
    onEdit?: (item: UnifiedItem) => void
    onCopy?: (item: UnifiedItem) => void
    onDelete?: (item: UnifiedItem) => void
  }
}

export function UnifiedItemView(props: UnifiedItemViewProps) {
  const isInteractive = () => props.mode !== 'summary'
  const hasChildren = () => {
    const item = props.item()
    return (
      (isRecipe(item) || isGroup(item)) &&
      Array.isArray(item.reference.children) &&
      item.reference.children.length > 0
    )
  }

  const getChildren = () => {
    const item = props.item()
    if (isRecipe(item) || isGroup(item)) {
      return item.reference.children
    }
    return []
  }

  // Handlers logic similar to ItemView
  const handleMouseEvent = (callback?: () => void) => {
    if (callback === undefined) {
      return undefined
    }
    return (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      callback()
    }
  }
  const getHandlers = () => {
    return {
      onClick: handleMouseEvent(
        props.handlers.onClick
          ? () => props.handlers.onClick!(props.item())
          : undefined,
      ),
      onEdit: handleMouseEvent(
        props.handlers.onEdit
          ? () => props.handlers.onEdit!(props.item())
          : undefined,
      ),
      onCopy: handleMouseEvent(
        props.handlers.onCopy
          ? () => props.handlers.onCopy!(props.item())
          : undefined,
      ),
      onDelete: handleMouseEvent(
        props.handlers.onDelete
          ? () => props.handlers.onDelete!(props.item())
          : undefined,
      ),
    }
  }

  return (
    <div
      class={cn(
        'block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700',
        props.class,
      )}
      onClick={(e) => getHandlers().onClick?.(e)}
    >
      <div class="flex items-center">
        <div class="flex flex-1  items-center">
          <div class="flex-1">
            {typeof props.header === 'function' ? props.header() : props.header}
          </div>
          <div class="">
            {isInteractive() && (
              <ContextMenu
                trigger={
                  <div class="text-3xl active:scale-105 hover:text-blue-200">
                    <MoreVertIcon />
                  </div>
                }
                class="ml-2"
              >
                <Show when={getHandlers().onEdit}>
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
                <Show when={getHandlers().onCopy}>
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
                <Show when={getHandlers().onDelete}>
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
      <Show when={hasChildren()}>
        <div class="mt-2 ml-4 space-y-1">
          <For each={getChildren()}>
            {(child) => (
              <div class="text-sm text-gray-300 flex justify-between">
                <span>
                  {child.name} ({child.quantity}g)
                </span>
                <span class="text-gray-400">
                  {calcUnifiedItemCalories(child).toFixed(0)}kcal
                </span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export function UnifiedItemName(props: { item: Accessor<UnifiedItem> }) {
  const recipeRepository = createSupabaseRecipeRepository()

  // Create a resource to fetch recipe data when needed
  const [originalRecipe] = createResource(
    () => {
      const item = props.item()
      return isRecipe(item) ? item.reference.id : null
    },
    async (recipeId: number) => {
      try {
        return await recipeRepository.fetchRecipeById(recipeId)
      } catch (error) {
        console.warn('Failed to fetch recipe for comparison:', error)
        return null
      }
    },
  )

  // Check if the recipe was manually edited
  const isManuallyEdited = createMemo(() => {
    const item = props.item()
    const recipe = originalRecipe()

    if (
      !isRecipe(item) ||
      recipe === null ||
      recipe === undefined ||
      originalRecipe.loading
    ) {
      return false
    }

    return isRecipeUnifiedItemManuallyEdited(item, recipe)
  })

  const nameColor = () => {
    const item = props.item()

    switch (item.reference.type) {
      case 'food':
        return 'text-white'
      case 'recipe':
        return 'text-yellow-200'
      case 'group':
        return 'text-green-200'
      default:
        return 'text-gray-400'
    }
  }

  const typeIndicator = () => {
    const item = props.item()
    switch (item.reference.type) {
      case 'food':
        return '🍽️'
      case 'recipe':
        return '📖'
      case 'group':
        return '📦'
      default:
        return '❓'
    }
  }

  const getTypeText = () => {
    const item = props.item()
    switch (item.reference.type) {
      case 'food':
        return 'alimento'
      case 'recipe':
        return 'receita'
      case 'group':
        return 'grupo'
      default:
        return 'desconhecido'
    }
  }

  const warningIndicator = () => {
    return isManuallyEdited() ? '⚠️' : ''
  }

  return (
    <div class="">
      <h5 class={`mb-2 text-lg font-bold tracking-tight ${nameColor()}`}>
        <span class="mr-2 cursor-help" title={getTypeText()}>
          {typeIndicator()}
        </span>
        {props.item().name}
        <Show when={warningIndicator()}>
          <span
            class="ml-1 text-yellow-500"
            title="Receita editada pontualmente"
          >
            {warningIndicator()}
          </span>
        </Show>
      </h5>
    </div>
  )
}

export function UnifiedItemViewNutritionalInfo(props: {
  item: Accessor<UnifiedItem>
}) {
  const calories = createMemo(() => calcUnifiedItemCalories(props.item()))
  const macros = createMemo(() => calcUnifiedItemMacros(props.item()))

  return (
    <div class="flex">
      <MacroNutrientsView macros={macros()} />
      <div class="ml-auto">
        <span class="text-white"> {props.item().quantity}g </span>|
        <span class="text-white"> {calories().toFixed(0)}kcal </span>
      </div>
    </div>
  )
}
