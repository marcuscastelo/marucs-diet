import { type Accessor, createMemo, For, type JSXElement, Show } from 'solid-js'

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
import { calcUnifiedItemCalories } from '~/shared/utils/macroMath'

export type UnifiedItemViewProps = {
  item: Accessor<UnifiedItem>
  header?: JSXElement
  nutritionalInfo?: JSXElement
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

  return (
    <div
      class={`bg-gray-700 p-3 rounded ${props.class ?? ''} ${
        isInteractive() ? 'hover:bg-gray-600 cursor-pointer' : ''
      }`}
      onClick={() => {
        if (isInteractive() && props.handlers.onClick) {
          props.handlers.onClick(props.item())
        }
      }}
    >
      <div class="flex justify-between items-start">
        <div class="flex-1">
          {props.header}
          {props.nutritionalInfo}
        </div>

        <Show when={isInteractive()}>
          <ContextMenu
            trigger={
              <button class="p-1 hover:bg-gray-600 rounded">
                <MoreVertIcon class="w-4 h-4" />
              </button>
            }
          >
            <ContextMenu.Item
              onClick={() => props.handlers.onEdit?.(props.item())}
              class="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-700"
            >
              <span class="w-4 h-4">✏️</span>
              <span>Editar</span>
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={() => props.handlers.onCopy?.(props.item())}
              class="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-700"
            >
              <CopyIcon size={16} />
              <span>Copiar</span>
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={() => props.handlers.onDelete?.(props.item())}
              class="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-700 text-red-400"
            >
              <TrashIcon size={16} />
              <span>Excluir</span>
            </ContextMenu.Item>
          </ContextMenu>
        </Show>
      </div>

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

  return (
    <div class="flex items-center gap-2">
      <span class="text-lg">{typeIndicator()}</span>
      <h6 class={`text-lg font-medium ${nameColor()}`}>{props.item().name}</h6>
    </div>
  )
}

export function UnifiedItemViewNutritionalInfo(props: {
  item: Accessor<UnifiedItem>
}) {
  const calories = createMemo(() => calcUnifiedItemCalories(props.item()))

  return (
    <div class="mt-2">
      <div class="flex justify-between items-center text-sm text-gray-300">
        <span>{props.item().quantity}g</span>
        <span>{calories().toFixed(0)}kcal</span>
      </div>
      <MacroNutrientsView macros={props.item().macros} />
    </div>
  )
}

export function UnifiedItemCopyButton(props: {
  onCopyItem: (item: UnifiedItem) => void
  item: Accessor<UnifiedItem>
}) {
  return (
    <button
      class="p-1 hover:bg-gray-600 rounded"
      onClick={(e) => {
        e.stopPropagation()
        props.onCopyItem(props.item())
      }}
      title="Copiar item"
    >
      <CopyIcon size={16} />
    </button>
  )
}
